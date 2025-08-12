import {
    collection,
    addDoc,
    doc,
    getDoc,
    serverTimestamp,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from './config';

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

            // Add member to circle
            const memberData = {
                userId,
                userName: userData.displayName || userData.name || 'Unknown User',
                userEmail: userData.email || '',
                userAvatar: userData.photoURL || userData.avatar || '',
                isAdmin: false,
                joinedAt: serverTimestamp(),
                addedBy: 'join_request'
            };

            await addDoc(membersRef, memberData);
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