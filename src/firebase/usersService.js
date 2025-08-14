import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    getDoc,
    doc
} from 'firebase/firestore';
import { db } from './config';

export const usersService = {
    // Search users by username
    searchUsersByUsername: async (searchTerm, excludeUserIds = [], limitCount = 10) => {
        try {
            if (!searchTerm || searchTerm.trim().length < 2) {
                return { success: true, users: [] };
            }

            const searchTermLower = searchTerm.toLowerCase().trim();

            // Query users where username starts with the search term
            const q = query(
                collection(db, 'users'),
                where('username', '>=', searchTermLower),
                where('username', '<=', searchTermLower + '\uf8ff'),
                orderBy('username'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const users = [];

            snapshot.forEach(doc => {
                const userData = doc.data();
                // Exclude specified user IDs (like current user or existing members)
                if (!excludeUserIds.includes(doc.id)) {
                    users.push({
                        id: doc.id,
                        username: userData.username,
                        email: userData.email,
                        photoURL: userData.photoURL || userData.avatar,
                        displayName: userData.displayName
                    });
                }
            });

            return { success: true, users };
        } catch (error) {
            console.error('Error searching users:', error);
            return { success: false, error: error.message, users: [] };
        }
    },

    // Get user by ID
    getUserById: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                return {
                    success: true,
                    user: {
                        id: userDoc.id,
                        ...userDoc.data()
                    }
                };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if user is member of circle
    isUserMemberOfCircle: async (userId, circleId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const joinedCircles = userData.joinedCircles || [];
                return joinedCircles.includes(circleId);
            }
            return false;
        } catch (error) {
            console.error('Error checking user membership:', error);
            return false;
        }
    }
};