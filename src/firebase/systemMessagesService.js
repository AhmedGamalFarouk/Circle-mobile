import {
    collection,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export const systemMessagesService = {
    // Create a system message when a user joins a circle
    createUserJoinedMessage: async (circleId, userId, username) => {
        try {
            const messageData = {
                messageType: 'system',
                systemMessageType: 'user_joined',
                circleId,
                userId,
                username,
                text: `${username} just joined`,
                timeStamp: serverTimestamp()
            };

            // Add to circle's chat collection
            const messagesRef = collection(db, 'circles', circleId, 'chat');
            const docRef = await addDoc(messagesRef, messageData);

            return { success: true, messageId: docRef.id };
        } catch (error) {
            console.error('Error creating user joined system message:', error);
            return { success: false, error: error.message };
        }
    },

    // Create a system message when a user leaves a circle
    createUserLeftMessage: async (circleId, userId, username) => {
        try {
            const messageData = {
                messageType: 'system',
                systemMessageType: 'user_left',
                circleId,
                userId,
                username,
                text: `${username} left the circle`,
                timeStamp: serverTimestamp()
            };

            // Add to circle's chat collection
            const messagesRef = collection(db, 'circles', circleId, 'chat');
            const docRef = await addDoc(messagesRef, messageData);

            return { success: true, messageId: docRef.id };
        } catch (error) {
            console.error('Error creating user left system message:', error);
            return { success: false, error: error.message };
        }
    },

    // Create a system message when a user is invited
    createUserInvitedMessage: async (circleId, userId, username, inviterId, inviterName) => {
        try {
            const messageData = {
                messageType: 'system',
                systemMessageType: 'user_invited',
                circleId,
                userId,
                username,
                inviterId,
                inviterName,
                text: `${username} was invited by ${inviterName}`,
                timeStamp: serverTimestamp()
            };

            // Add to circle's chat collection
            const messagesRef = collection(db, 'circles', circleId, 'chat');
            const docRef = await addDoc(messagesRef, messageData);

            return { success: true, messageId: docRef.id };
        } catch (error) {
            console.error('Error creating user invited system message:', error);
            return { success: false, error: error.message };
        }
    },

    // Create a welcome message for new members
    createWelcomeMessage: async (circleId, circleName) => {
        try {
            const messageData = {
                messageType: 'system',
                systemMessageType: 'welcome',
                circleId,
                circleName,
                text: `Welcome to ${circleName}!`,
                timeStamp: serverTimestamp()
            };

            // Add to circle's chat collection
            const messagesRef = collection(db, 'circles', circleId, 'chat');
            const docRef = await addDoc(messagesRef, messageData);

            return { success: true, messageId: docRef.id };
        } catch (error) {
            console.error('Error creating welcome system message:', error);
            return { success: false, error: error.message };
        }
    },

    // Generic system message creator
    createSystemMessage: async (circleId, messageType, data) => {
        try {
            const messageData = {
                messageType: 'system',
                systemMessageType: messageType,
                circleId,
                ...data,
                timeStamp: serverTimestamp()
            };

            // Add to circle's chat collection
            const messagesRef = collection(db, 'circles', circleId, 'chat');
            const docRef = await addDoc(messagesRef, messageData);

            return { success: true, messageId: docRef.id };
        } catch (error) {
            console.error('Error creating system message:', error);
            return { success: false, error: error.message };
        }
    }
};