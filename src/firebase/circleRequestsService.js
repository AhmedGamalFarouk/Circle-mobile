import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc,
    orderBy,
    serverTimestamp,
    getDocs,
    getDoc
} from 'firebase/firestore';
import { db } from './config';

export const circleRequestsService = {
    // Create a new join request
    createJoinRequest: async (circleId, userId, adminId, circleName, userName) => {
        try {
            // Get user information for additional fields
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            const requestData = {
                adminId,
                avatarPhoto: userData.photoURL || userData.avatar || '',
                circleId,
                circleName,
                createdAt: serverTimestamp(),
                email: userData.email || '',
                message: `${userName} wants to join your circle "${circleName}".`,
                status: 'pending',
                type: 'join-request',
                userId,
                username: userName
            };

            const docRef = await addDoc(collection(db, 'circleRequests'), requestData);
            return { success: true, requestId: docRef.id };
        } catch (error) {
            console.error('Error creating join request:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if user already has a pending request for this circle
    checkExistingRequest: async (circleId, userId) => {
        try {
            const q = query(
                collection(db, 'circleRequests'),
                where('circleId', '==', circleId),
                where('userId', '==', userId),
                where('status', '==', 'pending')
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking existing request:', error);
            return false;
        }
    },

    // Get all pending requests for a specific circle (for admin)
    getCircleRequests: (circleId, callback) => {
        const q = query(
            collection(db, 'circleRequests'),
            where('circleId', '==', circleId),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, callback, (error) => {
            console.error('Error listening to circle requests:', error);
        });
    },

    // Get all requests for a specific admin
    getAdminRequests: (adminId, callback) => {
        const q = query(
            collection(db, 'circleRequests'),
            where('adminId', '==', adminId),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, callback, (error) => {
            console.error('Error listening to admin requests:', error);
        });
    },

    // Approve a join request
    approveRequest: async (requestId, addMemberToCircle) => {
        try {
            const requestRef = doc(db, 'circleRequests', requestId);
            const requestSnap = await getDoc(requestRef);
            if (!requestSnap.exists()) {
                return { success: false, error: 'Request not found' };
            }
            const { circleId, userId } = requestSnap.data();

            await addMemberToCircle(circleId, userId);

            await updateDoc(requestRef, {
                status: 'approved',
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error approving request:', error);
            return { success: false, error: error.message };
        }
    },

    // Deny a join request
    denyRequest: async (requestId) => {
        try {
            const requestRef = doc(db, 'circleRequests', requestId);
            await updateDoc(requestRef, {
                status: 'denied',
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error denying request:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete a request (after processing)
    deleteRequest: async (requestId) => {
        try {
            await deleteDoc(doc(db, 'circleRequests', requestId));
            return { success: true };
        } catch (error) {
            console.error('Error deleting request:', error);
            return { success: false, error: error.message };
        }
    },

    // Approve all pending requests for a circle
    approveAllRequests: async (circleId, addMemberToCircle) => {
        try {
            const q = query(
                collection(db, 'circleRequests'),
                where('circleId', '==', circleId),
                where('status', '==', 'pending')
            );

            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map(async (doc) => {
                const { userId } = doc.data();
                await addMemberToCircle(circleId, userId);
                return updateDoc(doc.ref, {
                    status: 'approved',
                    updatedAt: serverTimestamp()
                });
            });

            await Promise.all(promises);
            return { success: true, count: snapshot.docs.length };
        } catch (error) {
            console.error('Error approving all requests:', error);
            return { success: false, error: error.message };
        }
    },

    // Deny all pending requests for a circle
    denyAllRequests: async (circleId) => {
        try {
            const q = query(
                collection(db, 'circleRequests'),
                where('circleId', '==', circleId),
                where('status', '==', 'pending')
            );

            const snapshot = await getDocs(q);
            const updatePromises = snapshot.docs.map(doc =>
                updateDoc(doc.ref, {
                    status: 'denied',
                    updatedAt: serverTimestamp()
                })
            );

            await Promise.all(updatePromises);
            return { success: true, count: snapshot.docs.length };
        } catch (error) {
            console.error('Error denying all requests:', error);
            return { success: false, error: error.message };
        }
    }
};