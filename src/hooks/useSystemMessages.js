import { useEffect, useState } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook to manage system messages for a circle
 * @param {string} circleId - The circle ID
 * @param {number} limitCount - Maximum number of messages to fetch (default: 50)
 * @returns {Object} Object containing system messages and loading state
 */
const useSystemMessages = (circleId, limitCount = 50) => {
    const [systemMessages, setSystemMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!circleId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Query for system messages in the circle
            const messagesRef = collection(db, 'circles', circleId, 'messages');
            const q = query(
                messagesRef,
                where('messageType', '==', 'system'),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const messages = [];
                    snapshot.forEach(doc => {
                        messages.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });

                    setSystemMessages(messages);
                    setLoading(false);
                },
                (error) => {
                    console.error('Error listening to system messages:', error);
                    setError(error.message);
                    setLoading(false);
                }
            );

            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        } catch (error) {
            console.error('Error setting up system messages listener:', error);
            setError(error.message);
            setLoading(false);
        }
    }, [circleId, limitCount]);

    return {
        systemMessages,
        loading,
        error
    };
};

export default useSystemMessages;