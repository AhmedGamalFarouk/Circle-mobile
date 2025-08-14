import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

const useUserProfile = (userId, isOwnProfile) => {
    const [profile, setProfile] = useState(null);
    const [connectionsCount, setConnectionsCount] = useState(0);
    const [circlesCount, setCirclesCount] = useState(0);
    const [eventsCount, setEventsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, "users", userId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setProfile(data);

                // Use stats structure
                setConnectionsCount(data.stats?.connections || 0);
                setCirclesCount(data.stats?.circles || 0);
                setEventsCount(data.stats?.events || 0);
            } else {
                setProfile(null);
                setConnectionsCount(0);
                setCirclesCount(0);
                setEventsCount(0);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, isOwnProfile]);

    return { profile, connectionsCount, circlesCount, eventsCount, loading };
};

export default useUserProfile;
