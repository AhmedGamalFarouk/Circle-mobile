import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook to manage pending events for a circle with real-time updates
 * @param {string} circleId - The circle ID
 * @returns {Object} Object containing pending events array and loading state
 */
const usePendingEvents = (circleId) => {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!circleId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Create query to get pending events
        const eventsRef = collection(db, 'circles', circleId, 'events');
        const pendingEventsQuery = query(eventsRef, where('status', '==', 'pending'));

        const unsubscribe = onSnapshot(pendingEventsQuery, (snapshot) => {
            const eventsList = [];
            snapshot.forEach(doc => {
                eventsList.push({ id: doc.id, ...doc.data() });
            });

            setPendingEvents(eventsList);
            setLoading(false);
        }, (error) => {
            console.error('Error listening to pending events:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [circleId]);

    return {
        pendingEvents,
        loading,
        pendingCount: pendingEvents.length
    };
};

export default usePendingEvents;