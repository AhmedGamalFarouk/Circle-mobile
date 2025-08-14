import {
    collection,
    addDoc,
    doc,
    getDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { systemMessagesService } from './systemMessagesService';

export const circleMembersService = {
    // Add a user to a circle as a member
    addMemberToCircle: async (circleId, userId) => {
        try {
            // Check if user is already a member
            const membersRef = collection(db, 'circles', circleId, 'members');
            const q = query(membersRef, where('userId', '==', userId));
            const existingMember = await getDocs(q);

            if (!existingMember.empty) {
                return { success: false, error: 'User is already a member of this circle' };
            }

            // Get user information
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Add member to circle's members subcollection
            const memberData = {
                userId,
                userName: userData.displayName || userData.username || userData.name || 'Unknown User',
                userEmail: userData.email || '',
                userAvatar: userData.photoURL || userData.avatar || '',
                isAdmin: false,
                joinedAt: serverTimestamp(),
                addedBy: 'join_request'
            };

            await addDoc(membersRef, memberData);

            // Also add the circle to the user's joinedCircles array
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                joinedCircles: arrayUnion(circleId)
            });

            // Create system message for user joining
            const username = userData.displayName || userData.username || userData.name || 'Unknown User';
            await systemMessagesService.createUserJoinedMessage(circleId, userId, username);

            return { success: true };
        } catch (error) {
            console.error('Error adding member to circle:', error);
            return { success: false, error: error.message };
        }
    },

    // Get circle information
    getCircleInfo: async (circleId) => {
        try {
            const circleDoc = await getDoc(doc(db, 'circles', circleId));
            if (circleDoc.exists()) {
                return { success: true, data: circleDoc.data() };
            } else {
                return { success: false, error: 'Circle not found' };
            }
        } catch (error) {
            console.error('Error getting circle info:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove a user from a circle
    removeMemberFromCircle: async (circleId, userId) => {
        try {
            // Validate inputs
            if (!circleId || !userId) {
                return { success: false, error: 'Circle ID and User ID are required' };
            }

            // Get user information first for the system message
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            const username = userData.displayName || userData.username || userData.name || 'Unknown User';

            // Find and remove the member document
            const membersRef = collection(db, 'circles', circleId, 'members');
            const q = query(membersRef, where('userId', '==', userId));
            const memberSnapshot = await getDocs(q);

            if (memberSnapshot.empty) {
                return { success: false, error: 'User is not a member of this circle' };
            }

            // Delete the member document
            const memberDoc = memberSnapshot.docs[0];
            await deleteDoc(memberDoc.ref);

            // Remove the circle from the user's joinedCircles array (only if user document exists)
            if (userDoc.exists()) {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    joinedCircles: arrayRemove(circleId)
                });
            }

            // Create system message for user leaving
            await systemMessagesService.createUserLeftMessage(circleId, userId, username);

            return { success: true };
        } catch (error) {
            console.error('Error removing member from circle:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user information
    getUserInfo: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                return { success: true, data: userDoc.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user info:', error);
            return { success: false, error: error.message };
        }
    }
};