import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Updates user profile information
 * @param {string} userId - The user's ID
 * @param {Object} profileData - Object containing profile updates
 */
export const updateUserProfile = async (userId, profileData) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, profileData);
        console.log(`User profile updated for ${userId}:`, profileData);
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Gets complete user profile
 * @param {string} userId - The user's ID
 * @returns {Object} Complete user profile data
 */
export const getUserProfile = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

/**
 * Updates user's phone number
 * @param {string} userId - The user's ID
 * @param {string} phoneNumber - The new phone number
 */
export const updatePhoneNumber = async (userId, phoneNumber) => {
    await updateUserProfile(userId, { phoneNumber });
};

/**
 * Updates user's bio
 * @param {string} userId - The user's ID
 * @param {string} bio - The new bio
 */
export const updateBio = async (userId, bio) => {
    await updateUserProfile(userId, { bio });
};

/**
 * Updates user's location
 * @param {string} userId - The user's ID
 * @param {string} location - The new location
 */
export const updateLocation = async (userId, location) => {
    await updateUserProfile(userId, { location });
};

/**
 * Updates user's interests
 * @param {string} userId - The user's ID
 * @param {Array} interests - Array of interest strings
 */
export const updateInterests = async (userId, interests) => {
    await updateUserProfile(userId, { interests });
};

/**
 * Checks if user is blocked
 * @param {string} userId - The user's ID
 * @returns {boolean} Whether the user is blocked
 */
export const isUserBlocked = async (userId) => {
    try {
        const profile = await getUserProfile(userId);
        return profile.isBlocked || false;
    } catch (error) {
        console.error('Error checking if user is blocked:', error);
        return false;
    }
};

/**
 * Gets user's friends list
 * @param {string} userId - The user's ID
 * @returns {Array} Array of friend user IDs
 */
export const getUserFriends = async (userId) => {
    try {
        const profile = await getUserProfile(userId);
        return profile.friends || [];
    } catch (error) {
        console.error('Error getting user friends:', error);
        return [];
    }
};

/**
 * Gets user's friend requests
 * @param {string} userId - The user's ID
 * @returns {Object} Object with sent and received friend requests
 */
export const getUserFriendRequests = async (userId) => {
    try {
        const profile = await getUserProfile(userId);
        return profile.friendRequests || { sent: [], received: [] };
    } catch (error) {
        console.error('Error getting user friend requests:', error);
        return { sent: [], received: [] };
    }
};

/**
 * Gets user's joined circles
 * @param {string} userId - The user's ID
 * @returns {Array} Array of joined circle IDs
 */
export const getUserJoinedCircles = async (userId) => {
    try {
        const profile = await getUserProfile(userId);
        return profile.joinedCircles || [];
    } catch (error) {
        console.error('Error getting user joined circles:', error);
        return [];
    }
};

/**
 * Gets user's joined events
 * @param {string} userId - The user's ID
 * @returns {Array} Array of joined event IDs
 */
export const getUserJoinedEvents = async (userId) => {
    try {
        const profile = await getUserProfile(userId);
        return profile.joinedEvents || [];
    } catch (error) {
        console.error('Error getting user joined events:', error);
        return [];
    }
};