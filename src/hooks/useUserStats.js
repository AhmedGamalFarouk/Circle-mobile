import { useState, useCallback } from 'react';
import { updateUserStats, incrementUserStat, decrementUserStat, getUserStats } from '../utils/userStatsManager';

/**
 * Hook for managing user stats
 * @param {string} userId - The user's ID
 */
const useUserStats = (userId) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const updateStats = useCallback(async (statsUpdate) => {
        if (!userId) return;

        setIsUpdating(true);
        try {
            await updateUserStats(userId, statsUpdate);
        } catch (error) {
            console.error('Error updating stats:', error);
            throw error;
        } finally {
            setIsUpdating(false);
        }
    }, [userId]);

    const incrementStat = useCallback(async (statType, amount = 1) => {
        if (!userId) return;

        setIsUpdating(true);
        try {
            await incrementUserStat(userId, statType, amount);
        } catch (error) {
            console.error('Error incrementing stat:', error);
            throw error;
        } finally {
            setIsUpdating(false);
        }
    }, [userId]);

    const decrementStat = useCallback(async (statType, amount = 1) => {
        if (!userId) return;

        setIsUpdating(true);
        try {
            await decrementUserStat(userId, statType, amount);
        } catch (error) {
            console.error('Error decrementing stat:', error);
            throw error;
        } finally {
            setIsUpdating(false);
        }
    }, [userId]);

    const getStats = useCallback(async () => {
        if (!userId) return { circles: 0, connections: 0, events: 0 };

        try {
            return await getUserStats(userId);
        } catch (error) {
            console.error('Error getting stats:', error);
            return { circles: 0, connections: 0, events: 0 };
        }
    }, [userId]);

    return {
        updateStats,
        incrementStat,
        decrementStat,
        getStats,
        isUpdating
    };
};

export default useUserStats;