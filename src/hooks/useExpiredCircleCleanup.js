import { useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { circleMembersService } from '../firebase/circleMembersService';

/**
 * Hook to manage cleanup of expired flash circles
 * This hook provides functionality to automatically delete expired flash circles
 * and can be triggered on navigation events or app state changes
 */
const useExpiredCircleCleanup = () => {
    const cleanupExpiredCircles = useCallback(async () => {
        try {
            const now = Timestamp.now();
            const circlesRef = collection(db, 'circles');
            
            // Query for all flash circles first (to avoid composite index requirement)
            const q = query(
                circlesRef,
                where('circleType', '==', 'flash')
            );
            
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                console.log('No flash circles found.');
                return { success: true, deletedCount: 0 };
            }
            
            // Filter expired circles on the client side
            const expiredCircles = snapshot.docs.filter(doc => {
                const data = doc.data();
                return data.expiresAt && data.expiresAt.toDate() <= now.toDate();
            });
            
            if (expiredCircles.length === 0) {
                console.log('No expired flash circles found for cleanup.');
                return { success: true, deletedCount: 0 };
            }
            
            console.log(`Found ${expiredCircles.length} expired flash circles to delete.`);
            
            // Delete each expired circle
            const deletePromises = expiredCircles.map(async (doc) => {
                const circleData = doc.data();
                console.log(`Deleting expired flash circle: ${circleData.circleName || 'Unknown'} (${doc.id})`);
                
                try {
                    const result = await circleMembersService.deleteCircle(doc.id);
                    if (result.success) {
                        return { id: doc.id, success: true };
                    } else {
                        console.error(`Failed to delete circle ${doc.id}:`, result.error);
                        return { id: doc.id, success: false, error: result.error };
                    }
                } catch (error) {
                    console.error(`Error deleting circle ${doc.id}:`, error);
                    return { id: doc.id, success: false, error: error.message };
                }
            });
            
            const results = await Promise.all(deletePromises);
            const successfulDeletions = results.filter(result => result.success);
            const failedDeletions = results.filter(result => !result.success);
            
            console.log(`Successfully deleted ${successfulDeletions.length} expired flash circles.`);
            if (failedDeletions.length > 0) {
                console.warn(`Failed to delete ${failedDeletions.length} expired flash circles:`, failedDeletions);
            }
            
            return {
                success: true,
                deletedCount: successfulDeletions.length,
                failedCount: failedDeletions.length,
                results
            };
            
        } catch (error) {
            console.error('Error during expired circle cleanup:', error);
            return {
                success: false,
                error: error.message,
                deletedCount: 0
            };
        }
    }, []);
    

    
    return {
        cleanupExpiredCircles
    };
};

export default useExpiredCircleCleanup;