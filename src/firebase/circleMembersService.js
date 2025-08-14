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
                isOwner: false,
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
    },

    // Make a member an admin
    makeAdmin: async (circleId, userId, currentUserId) => {
        try {
            // Check if current user is owner or admin
            const currentUserMemberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', currentUserId)
            );
            const currentUserSnapshot = await getDocs(currentUserMemberQuery);

            if (currentUserSnapshot.empty) {
                return { success: false, error: 'You are not a member of this circle' };
            }

            const currentUserData = currentUserSnapshot.docs[0].data();
            if (!currentUserData.isOwner && !currentUserData.isAdmin) {
                return { success: false, error: 'You do not have permission to make admins' };
            }

            // Find the target member
            const memberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', userId)
            );
            const memberSnapshot = await getDocs(memberQuery);

            if (memberSnapshot.empty) {
                return { success: false, error: 'User is not a member of this circle' };
            }

            const memberDoc = memberSnapshot.docs[0];
            await updateDoc(memberDoc.ref, {
                isAdmin: true
            });

            return { success: true };
        } catch (error) {
            console.error('Error making user admin:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove admin status from a member
    removeAdmin: async (circleId, userId, currentUserId) => {
        try {
            // Check if current user is owner
            const currentUserMemberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', currentUserId)
            );
            const currentUserSnapshot = await getDocs(currentUserMemberQuery);

            if (currentUserSnapshot.empty) {
                return { success: false, error: 'You are not a member of this circle' };
            }

            const currentUserData = currentUserSnapshot.docs[0].data();
            if (!currentUserData.isOwner) {
                return { success: false, error: 'Only the owner can remove admin status' };
            }

            // Find the target member
            const memberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', userId)
            );
            const memberSnapshot = await getDocs(memberQuery);

            if (memberSnapshot.empty) {
                return { success: false, error: 'User is not a member of this circle' };
            }

            const memberDoc = memberSnapshot.docs[0];
            const memberData = memberDoc.data();

            // Prevent removing owner's admin status
            if (memberData.isOwner) {
                return { success: false, error: 'Cannot remove admin status from the owner' };
            }

            await updateDoc(memberDoc.ref, {
                isAdmin: false
            });

            return { success: true };
        } catch (error) {
            console.error('Error removing admin status:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove a member from circle (admin function)
    removeMemberByAdmin: async (circleId, userId, currentUserId) => {
        try {
            // Check if current user is owner or admin
            const currentUserMemberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', currentUserId)
            );
            const currentUserSnapshot = await getDocs(currentUserMemberQuery);

            if (currentUserSnapshot.empty) {
                return { success: false, error: 'You are not a member of this circle' };
            }

            const currentUserData = currentUserSnapshot.docs[0].data();
            if (!currentUserData.isOwner && !currentUserData.isAdmin) {
                return { success: false, error: 'You do not have permission to remove members' };
            }

            // Find the target member
            const memberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', userId)
            );
            const memberSnapshot = await getDocs(memberQuery);

            if (memberSnapshot.empty) {
                return { success: false, error: 'User is not a member of this circle' };
            }

            const memberData = memberSnapshot.docs[0].data();

            // Prevent removing the owner
            if (memberData.isOwner) {
                return { success: false, error: 'Cannot remove the circle owner' };
            }

            // Non-owners cannot remove admins
            if (!currentUserData.isOwner && memberData.isAdmin) {
                return { success: false, error: 'Only the owner can remove admins' };
            }

            // Use the existing removeMemberFromCircle function
            return await this.removeMemberFromCircle(circleId, userId);
        } catch (error) {
            console.error('Error removing member by admin:', error);
            return { success: false, error: error.message };
        }
    },

    // Add circle owner (called when circle is created)
    addOwnerToCircle: async (circleId, userId) => {
        try {
            // Get user information
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Add owner to circle's members subcollection
            const memberData = {
                userId,
                userName: userData.displayName || userData.username || userData.name || 'Unknown User',
                userEmail: userData.email || '',
                userAvatar: userData.photoURL || userData.avatar || '',
                isAdmin: true,
                isOwner: true,
                joinedAt: serverTimestamp(),
                addedBy: 'circle_creation'
            };

            await addDoc(collection(db, 'circles', circleId, 'members'), memberData);

            // Also add the circle to the user's joinedCircles array
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                joinedCircles: arrayUnion(circleId)
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding owner to circle:', error);
            return { success: false, error: error.message };
        }
    }
};