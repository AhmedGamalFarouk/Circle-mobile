import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const useUserProfile = (userId) => {
    const [profile, setProfile] = useState(null);
    const [connectionsCount, setConnectionsCount] = useState(0);
    const [circlesCount, setCirclesCount] = useState(0); // Correctly declare circlesCount state

    useEffect(() => {
        if (!userId) return;

        const docRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setProfile(data);
                // Get the length of the connections array or default to 0
                setConnectionsCount(data.connections?.length || 0);
                // Get the length of the joinedCircles array or default to 0
                setCirclesCount(data.joinedCircles?.length || 0); // Correctly update circlesCount
            } else {
                setProfile(null);
                setConnectionsCount(0);
                setCirclesCount(0); // Reset circlesCount on no doc
            }
        });

        return () => unsubscribe();
    }, [userId]);

    return { profile, connectionsCount, circlesCount };
};

export default useUserProfile;