import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Check if a username is unique in the users collection
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} - Returns true if username is unique, false if it exists
 */
export const isUsernameUnique = async (username) => {
    try {
        // Normalize username for case-insensitive comparison
        const normalizedUsername = username.toLowerCase().trim();

        if (!normalizedUsername) {
            return false;
        }

        // Query users collection for existing username
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', normalizedUsername));
        const querySnapshot = await getDocs(q);

        // Return true if no documents found (username is unique)
        return querySnapshot.empty;
    } catch (error) {
        console.error('Error checking username uniqueness:', error);
        throw new Error('Failed to validate username. Please try again.');
    }
};

/**
 * Validate username format and uniqueness
 * @param {string} username - The username to validate
 * @returns {Promise<{isValid: boolean, error?: string}>}
 */
export const validateUsername = async (username) => {
    const trimmedUsername = username.trim();

    // Check if username is empty
    if (!trimmedUsername) {
        return { isValid: false, error: 'Username is required.' };
    }

    // Check username length
    if (trimmedUsername.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long.' };
    }

    if (trimmedUsername.length > 20) {
        return { isValid: false, error: 'Username must be less than 20 characters long.' };
    }

    // Check username format (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, and underscores.' };
    }

    // Check if username starts with a letter or number (not underscore)
    if (trimmedUsername.startsWith('_')) {
        return { isValid: false, error: 'Username cannot start with an underscore.' };
    }

    try {
        // Check uniqueness
        const isUnique = await isUsernameUnique(trimmedUsername);
        if (!isUnique) {
            return { isValid: false, error: 'This username is already taken. Please choose another one.' };
        }

        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
};