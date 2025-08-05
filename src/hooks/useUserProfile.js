import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const useUserProfile = (userId) => {
    const [profile, setProfile] = useState(null);
    const [connectionsCount, setConnectionsCount] = useState(0);
    const [circlesCount, setCirclesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setProfile(data);
                setConnectionsCount(data.connections?.length || 0);
                setCirclesCount(data.joinedCircles?.length || 0);
            } else {
                setProfile(null);
                setConnectionsCount(0);
                setCirclesCount(0);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { profile, connectionsCount, circlesCount, loading };
};

export default useUserProfile;