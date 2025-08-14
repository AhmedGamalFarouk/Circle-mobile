import { systemMessagesService } from '../firebase/systemMessagesService';

/**
 * Utility functions for creating system messages
 */

/**
 * Create a system message when a user joins a circle
 * @param {string} circleId - The circle ID
 * @param {string} userId - The user ID
 * @param {string} username - The username
 */
export const createUserJoinedMessage = async (circleId, userId, username) => {
    try {
        return await systemMessagesService.createUserJoinedMessage(circleId, userId, username);
    } catch (error) {
        console.error('Error creating user joined message:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a system message when a user leaves a circle
 * @param {string} circleId - The circle ID
 * @param {string} userId - The user ID
 * @param {string} username - The username
 */
export const createUserLeftMessage = async (circleId, userId, username) => {
    try {
        return await systemMessagesService.createUserLeftMessage(circleId, userId, username);
    } catch (error) {
        console.error('Error creating user left message:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a system message when a user is invited
 * @param {string} circleId - The circle ID
 * @param {string} userId - The user ID
 * @param {string} username - The username
 * @param {string} inviterId - The inviter's ID
 * @param {string} inviterName - The inviter's name
 */
export const createUserInvitedMessage = async (circleId, userId, username, inviterId, inviterName) => {
    try {
        return await systemMessagesService.createUserInvitedMessage(circleId, userId, username, inviterId, inviterName);
    } catch (error) {
        console.error('Error creating user invited message:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a welcome message for new members
 * @param {string} circleId - The circle ID
 * @param {string} circleName - The circle name
 */
export const createWelcomeMessage = async (circleId, circleName) => {
    try {
        return await systemMessagesService.createWelcomeMessage(circleId, circleName);
    } catch (error) {
        console.error('Error creating welcome message:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a generic system message
 * @param {string} circleId - The circle ID
 * @param {string} messageType - The type of system message
 * @param {Object} data - Additional data for the message
 */
export const createSystemMessage = async (circleId, messageType, data) => {
    try {
        return await systemMessagesService.createSystemMessage(circleId, messageType, data);
    } catch (error) {
        console.error('Error creating system message:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Format system message text based on type and data
 * @param {Object} message - The system message object
 * @param {Function} t - Translation function
 * @returns {string} Formatted message text
 */
export const formatSystemMessageText = (message, t) => {
    switch (message.systemMessageType) {
        case 'user_joined':
            return t('systemMessages.userJoined', { username: message.username });
        case 'user_left':
            return t('systemMessages.userLeft', { username: message.username });
        case 'user_invited':
            return t('systemMessages.userInvited', {
                username: message.username,
                inviter: message.inviterName
            });
        case 'welcome':
            return t('systemMessages.welcomeToCircle', { circleName: message.circleName });
        default:
            return message.message || 'System message';
    }
};