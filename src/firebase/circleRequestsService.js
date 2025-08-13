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
import { systemMessagesService } from './systemMessagesService';

export const circleRequestsService = {
    // Create a new join request
    createJoinRequest: async (circleId, userId, adminId, circleName, userName) => {
        try {
            // Get user information for additional fields
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Get admin/inviter information
            const adminDoc = await getDoc(doc(db, 'users', adminId));
            const adminData = adminDoc.exists() ? adminDoc.data() : {};

            const requestData = {
                circleId,
                circleName,
                createdAt: serverTimestamp(),
                requesterEmail: userData.email || '',
                requesterId: userId,
                requesterPhotoUrl: userData.photoURL || userData.avatar || '',
                requesterUsername: userData.username || userData.displayName || userName,
                message: `${userData.username || userData.displayName || userName} wants to join your circle "${circleName}".`,
                status: 'pending',
                type: 'join-request'
            };

            const docRef = await addDoc(collection(db, 'circleRequests'), requestData);
            return { success: true, requestId: docRef.id };
        } catch (error) {
            console.error('Error creating join request:', error);
            return { success: false, error: error.message };
        }
    },

    // Create a new invitation
    createInvitation: async (circleId, userId, inviterId, circleName, inviterName, ownerId) => {
        try {
            // Get invitation receiver information
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Get inviter information
            const inviterDoc = await getDoc(doc(db, 'users', inviterId));
            const inviterData = inviterDoc.exists() ? inviterDoc.data() : {};

            const requestData = {
                circleId,
                circleName,
                createdAt: serverTimestamp(),
                invitedUserEmail: userData.email || '',
                invitedUserId: userId,
                invitedUserPhotoUrl: userData.photoURL || userData.avatar || '',
                invitedUserUsername: userData.username || userData.displayName || 'Unknown User',
                inviterId,
                inviterUsername: inviterData.username || inviterData.displayName || inviterName,
                message: `${inviterName} invited you to join the circle "${circleName}".`,
                status: 'pending',
                type: 'invitation'
            };

            const docRef = await addDoc(collection(db, 'circleRequests'), requestData);
            return { success: true, requestId: docRef.id };
        } catch (error) {
            console.error('Error creating invitation:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if user already has a pending request for this circle
    checkExistingRequest: async (circleId, userId) => {
        try {
            // Validate inputs
            if (!circleId || !userId) {
                console.warn('checkExistingRequest: Missing circleId or userId');
                return false;
            }

            const q = query(
                collection(db, 'circleRequests'),
                where('circleId', '==', circleId),
                where('requesterId', '==', userId),
                where('status', '==', 'pending'),
                where('type', '==', 'join-request')
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking existing request:', error);
            return false;
        }
    },

    // Check if user already has a pending invitation for this circle
    checkExistingInvitation: async (circleId, userId) => {
        try {
            // Validate inputs
            if (!circleId || !userId) {
                console.warn('checkExistingInvitation: Missing circleId or userId');
                return false;
            }

            const q = query(
                collection(db, 'circleRequests'),
                where('circleId', '==', circleId),
                where('invitedUserId', '==', userId),
                where('type', '==', 'invitation'),
                where('status', '==', 'pending')
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking existing invitation:', error);
            return false;
        }
    },

    // Get all pending requests for a specific circle (for admin)
    getCircleRequests: (circleId, callback) => {
        // Validate inputs
        if (!circleId) {
            console.warn('getCircleRequests: Missing circleId');
            return () => { }; // Return empty unsubscribe function
        }

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

    // Get all requests for a specific admin (for join requests, this would be circle admin)
    getAdminRequests: (adminId, callback) => {
        // Validate inputs
        if (!adminId) {
            console.warn('getAdminRequests: Missing adminId');
            return () => { }; // Return empty unsubscribe function
        }

        const q = query(
            collection(db, 'circleRequests'),
            where('inviterId', '==', adminId),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, callback, (error) => {
            console.error('Error listening to admin requests:', error);
        });
    },

    // Approve a join request
    approveRequest: async (requestId, addMemberToCircle, approverId) => {
        try {
            const requestRef = doc(db, 'circleRequests', requestId);
            const requestSnap = await getDoc(requestRef);
            if (!requestSnap.exists()) {
                return { success: false, error: 'Request not found' };
            }
            const requestData = requestSnap.data();
            const { circleId, requesterId, invitedUserId, type } = requestData;

            // Determine the user ID based on request type
            const userId = requesterId || invitedUserId;

            // Get approver information
            const approverDoc = await getDoc(doc(db, 'users', approverId));
            const approverData = approverDoc.exists() ? approverDoc.data() : {};

            // Add member to circle (this will also create the "user joined" system message)
            await addMemberToCircle(circleId, userId);

            // If this was an invitation, create an additional system message
            if (type === 'invitation' && requestData.inviterId) {
                const username = requestData.invitedUserUsername || 'Unknown User';
                const inviterName = requestData.inviterUsername || 'Someone';
                await systemMessagesService.createUserInvitedMessage(
                    circleId,
                    userId,
                    username,
                    requestData.inviterId,
                    inviterName
                );
            }

            // Update with new field structure for approved requests
            await updateDoc(requestRef, {
                status: 'accepted',
                approverId: approverId,
                approverUsername: approverData.username || approverData.displayName || 'Admin',
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
    approveAllRequests: async (circleId, addMemberToCircle, approverId) => {
        try {
            const q = query(
                collection(db, 'circleRequests'),
                where('circleId', '==', circleId),
                where('status', '==', 'pending')
            );

            // Get approver information
            const approverDoc = await getDoc(doc(db, 'users', approverId));
            const approverData = approverDoc.exists() ? approverDoc.data() : {};

            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map(async (docSnap) => {
                const requestData = docSnap.data();
                const userId = requestData.requesterId || requestData.invitedUserId; // Support both old and new field names
                const { type } = requestData;

                // Add member to circle (this will also create the "user joined" system message)
                await addMemberToCircle(circleId, userId);

                // If this was an invitation, create an additional system message
                if (type === 'invitation' && requestData.inviterId) {
                    const username = requestData.invitedUserUsername || 'Unknown User';
                    const inviterName = requestData.inviterUsername || 'Someone';
                    await systemMessagesService.createUserInvitedMessage(
                        circleId,
                        userId,
                        username,
                        requestData.inviterId,
                        inviterName
                    );
                }

                return updateDoc(docSnap.ref, {
                    status: 'accepted',
                    approverId: approverId,
                    approverUsername: approverData.username || approverData.displayName || 'Admin',
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