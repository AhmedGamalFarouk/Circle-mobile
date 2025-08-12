import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook to manage circle members with real-time updates
 * @param {string} circleId - The circle ID
 * @returns {Object} Object containing members array, loading state, and member count
 */
const useCircleMembers = (circleId) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [memberCount, setMemberCount] = useState(0);

    useEffect(() => {
        if (!circleId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Create query to get members ordered by join date
        const membersRef = collection(db, 'circles', circleId, 'members');
        const membersQuery = query(membersRef, orderBy('joinedAt', 'asc'));

        const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
            const membersList = [];
            snapshot.forEach(doc => {
                membersList.push({ id: doc.id, ...doc.data() });
            });

            setMembers(membersList);
            setMemberCount(membersList.length);
            setLoading(false);
        }, (error) => {
            console.error('Error listening to circle members:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [circleId]);

    // Helper functions
    const getAdmins = () => members.filter(member => member.isAdmin);
    const getNonAdmins = () => members.filter(member => !member.isAdmin);
    const isMember = (userId) => members.some(member => member.userId === userId);
    const isAdmin = (userId) => members.some(member => member.userId === userId && member.isAdmin);
    const getMember = (userId) => members.find(member => member.userId === userId);

    return {
        members,
        loading,
        memberCount,
        admins: getAdmins(),
        nonAdmins: getNonAdmins(),
        isMember,
        isAdmin,
        getMember
    };
};

export default useCircleMembers;