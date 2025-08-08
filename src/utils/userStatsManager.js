import { doc, updateDoc, increment, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Updates user stats in Firestore
 * @param {string} userId - The user's ID
 * @param {Object} statsUpdate - Object containing stat updates (e.g., { circles: 1, connections: -1 })
 */
export const updateUserStats = async (userId, statsUpdate) => {
    try {
        const userRef = doc(db, 'users', userId);

        // Build the update object for the stats map
        const updateData = {};

        Object.keys(statsUpdate).forEach(statKey => {
            if (['circles', 'connections', 'events'].includes(statKey)) {
                updateData[`stats.${statKey}`] = increment(statsUpdate[statKey]);
            }
        });

        await updateDoc(userRef, updateData);
        console.log(`User stats updated for ${userId}:`, statsUpdate);
    } catch (error) {
        console.error('Error updating user stats:', error);
        throw error;
    }
};

/**
 * Increments a specific stat for a user
 * @param {string} userId - The user's ID
 * @param {string} statType - The stat to increment ('circles', 'connections')
 * @param {number} amount - Amount to increment (default: 1)
 */
export const incrementUserStat = async (userId, statType, amount = 1) => {
    const statsUpdate = {};
    statsUpdate[statType] = amount;
    await updateUserStats(userId, statsUpdate);
};

/**
 * Decrements a specific stat for a user
 * @param {string} userId - The user's ID
 * @param {string} statType - The stat to decrement ('circles', 'connections')
 * @param {number} amount - Amount to decrement (default: 1)
 */
export const decrementUserStat = async (userId, statType, amount = 1) => {
    const statsUpdate = {};
    statsUpdate[statType] = -amount;
    await updateUserStats(userId, statsUpdate);
};

/**
 * Gets current user stats
 * @param {string} userId - The user's ID
 * @returns {Object} User stats object
 */
export const getUserStats = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.stats || { circles: 0, connections: 0, events: 0 };
        } else {
            return { circles: 0, connections: 0, events: 0 };
        }
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
};

/**
 * Adds a friend to user's friends list and updates stats
 * @param {string} userId - The user's ID
 * @param {string} friendId - The friend's ID to add
 */
export const addFriend = async (userId, friendId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const friendRef = doc(db, 'users', friendId);

        // Add friend to both users' friends arrays and update stats
        await updateDoc(userRef, {
            friends: arrayUnion(friendId),
            'stats.connections': increment(1)
        });

        await updateDoc(friendRef, {
            friends: arrayUnion(userId),
            'stats.connections': increment(1)
        });

        console.log(`Friend relationship created between ${userId} and ${friendId}`);
    } catch (error) {
        console.error('Error adding friend:', error);
        throw error;
    }
};

/**
 * Removes a friend from user's friends list and updates stats
 * @param {string} userId - The user's ID
 * @param {string} friendId - The friend's ID to remove
 */
export const removeFriend = async (userId, friendId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const friendRef = doc(db, 'users', friendId);

        // Remove friend from both users' friends arrays and update stats
        await updateDoc(userRef, {
            friends: arrayRemove(friendId),
            'stats.connections': increment(-1)
        });

        await updateDoc(friendRef, {
            friends: arrayRemove(userId),
            'stats.connections': increment(-1)
        });

        console.log(`Friend relationship removed between ${userId} and ${friendId}`);
    } catch (error) {
        console.error('Error removing friend:', error);
        throw error;
    }
};

/**
 * Sends a friend request
 * @param {string} senderId - The sender's ID
 * @param {string} receiverId - The receiver's ID
 */
export const sendFriendRequest = async (senderId, receiverId) => {
    try {
        const senderRef = doc(db, 'users', senderId);
        const receiverRef = doc(db, 'users', receiverId);

        // Add to sender's sent requests and receiver's received requests
        await updateDoc(senderRef, {
            'friendRequests.sent': arrayUnion(receiverId)
        });

        await updateDoc(receiverRef, {
            'friendRequests.received': arrayUnion(senderId)
        });

        console.log(`Friend request sent from ${senderId} to ${receiverId}`);
    } catch (error) {
        console.error('Error sending friend request:', error);
        throw error;
    }
};

/**
 * Accepts a friend request
 * @param {string} userId - The user accepting the request
 * @param {string} requesterId - The user who sent the request
 */
export const acceptFriendRequest = async (userId, requesterId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const requesterRef = doc(db, 'users', requesterId);

        // Remove from friend requests and add to friends
        await updateDoc(userRef, {
            'friendRequests.received': arrayRemove(requesterId),
            friends: arrayUnion(requesterId),
            'stats.connections': increment(1)
        });

        await updateDoc(requesterRef, {
            'friendRequests.sent': arrayRemove(userId),
            friends: arrayUnion(userId),
            'stats.connections': increment(1)
        });

        console.log(`Friend request accepted: ${userId} and ${requesterId} are now friends`);
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
};

/**
 * Rejects a friend request
 * @param {string} userId - The user rejecting the request
 * @param {string} requesterId - The user who sent the request
 */
export const rejectFriendRequest = async (userId, requesterId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const requesterRef = doc(db, 'users', requesterId);

        // Remove from friend requests without adding to friends
        await updateDoc(userRef, {
            'friendRequests.received': arrayRemove(requesterId)
        });

        await updateDoc(requesterRef, {
            'friendRequests.sent': arrayRemove(userId)
        });

        console.log(`Friend request rejected: ${userId} rejected ${requesterId}`);
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        throw error;
    }
};

/**
 * Joins a circle and updates user stats
 * @param {string} userId - The user's ID
 * @param {string} circleId - The circle's ID
 */
export const joinCircle = async (userId, circleId) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            joinedCircles: arrayUnion(circleId),
            'stats.circles': increment(1)
        });

        console.log(`User ${userId} joined circle ${circleId}`);
    } catch (error) {
        console.error('Error joining circle:', error);
        throw error;
    }
};

/**
 * Leaves a circle and updates user stats
 * @param {string} userId - The user's ID
 * @param {string} circleId - The circle's ID
 */
export const leaveCircle = async (userId, circleId) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            joinedCircles: arrayRemove(circleId),
            'stats.circles': increment(-1)
        });

        console.log(`User ${userId} left circle ${circleId}`);
    } catch (error) {
        console.error('Error leaving circle:', error);
        throw error;
    }
};

/**
 * Joins an event and updates user stats
 * @param {string} userId - The user's ID
 * @param {string} eventId - The event's ID
 */
export const joinEvent = async (userId, eventId) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            joinedEvents: arrayUnion(eventId),
            'stats.events': increment(1)
        });

        console.log(`User ${userId} joined event ${eventId}`);
    } catch (error) {
        console.error('Error joining event:', error);
        throw error;
    }
};

/**
 * Leaves an event and updates user stats
 * @param {string} userId - The user's ID
 * @param {string} eventId - The event's ID
 */
export const leaveEvent = async (userId, eventId) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            joinedEvents: arrayRemove(eventId),
            'stats.events': increment(-1)
        });

        console.log(`User ${userId} left event ${eventId}`);
    } catch (error) {
        console.error('Error leaving event:', error);
        throw error;
    }
};

/**
 * Reports a user (increments their reported count)
 * @param {string} userId - The user being reported
 */
export const reportUser = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            reported: increment(1)
        });

        console.log(`User ${userId} has been reported`);
    } catch (error) {
        console.error('Error reporting user:', error);
        throw error;
    }
};

/**
 * Blocks/unblocks a user
 * @param {string} userId - The user's ID
 * @param {boolean} blocked - Whether to block (true) or unblock (false)
 */
export const setUserBlocked = async (userId, blocked) => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            isBlocked: blocked
        });

        console.log(`User ${userId} ${blocked ? 'blocked' : 'unblocked'}`);
    } catch (error) {
        console.error('Error updating user block status:', error);
        throw error;
    }
};