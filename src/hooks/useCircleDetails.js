import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getCircleImageUrl, getUserAvatarUrl } from '../utils/imageUtils';

const useCircleDetails = (circleId) => {
    const [circle, setCircle] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMembersData = useCallback(async (circleId) => {
        try {
            // Query users who have this circleId in their joinedCircles array
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('joinedCircles', 'array-contains', circleId));
            const querySnapshot = await getDocs(q);

            const membersList = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                membersList.push({
                    id: doc.id,
                    name: userData.username || userData.displayName || 'Unknown User',
                    avatar: getUserAvatarUrl(userData),
                    email: userData.email,
                    isOnline: Math.random() > 0.7, // Random online status for demo
                });
            });

            return membersList;
        } catch (error) {
            console.error('Error fetching members:', error);
            return [];
        }
    }, []);

    const refetch = useCallback(async () => {
        if (!circleId) return;

        try {
            const docRef = doc(db, 'circles', circleId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const circleData = { id: docSnap.id, ...docSnap.data() };
                const members = await fetchMembersData(circleId);

                const realImage = getCircleImageUrl(circleData);
                console.log('Circle image data (refetch):', {
                    circleData: circleData,
                    finalImage: realImage
                });

                setCircle({
                    ...circleData,
                    members,
                    // Use real image from Firebase or fallback to a default
                    image: realImage,
                    // Real member count from actual members array
                    memberCount: members.length,
                    messageCount: circleData.messageCount || Math.floor(Math.random() * 500) + 50,
                    activeToday: circleData.activeToday || Math.floor(Math.random() * members.length),
                    pollCount: circleData.pollCount || Math.floor(Math.random() * 20) + 1,
                    recentActivity: circleData.recentActivity || [],
                });
            } else {
                setCircle(null);
            }
        } catch (error) {
            console.error('Error refetching circle details:', error);
        }
    }, [circleId, fetchMembersData]);

    useEffect(() => {
        if (!circleId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, 'circles', circleId);
        const unsubscribe = onSnapshot(docRef, async (doc) => {
            if (doc.exists()) {
                const circleData = { id: doc.id, ...doc.data() };

                // Fetch actual member data
                const members = await fetchMembersData(circleId);

                // Add enhanced data with real circle image and member count
                const realImage = getCircleImageUrl(circleData);
                console.log('Circle image data:', {
                    circleData: circleData,
                    finalImage: realImage
                });

                const enhancedCircle = {
                    ...circleData,
                    members,
                    // Use real image from Firebase or fallback to a default
                    image: realImage,
                    // Real member count from actual members array
                    memberCount: members.length,
                    messageCount: circleData.messageCount || Math.floor(Math.random() * 500) + 50,
                    activeToday: circleData.activeToday || Math.floor(Math.random() * members.length),
                    pollCount: circleData.pollCount || Math.floor(Math.random() * 20) + 1,
                    recentActivity: circleData.recentActivity || [],
                };

                setCircle(enhancedCircle);
            } else {
                setCircle(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [circleId, fetchMembersData]);

    return { circle, loading, refetch };
};

export default useCircleDetails;