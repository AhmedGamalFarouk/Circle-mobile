import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const useUserProfile = (userId) => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const docRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setProfile(doc.data());
            } else {
                setProfile(null);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    return { profile };
};

export default useUserProfile;