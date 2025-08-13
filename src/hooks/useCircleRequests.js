import { useEffect, useState } from 'react';
import { circleRequestsService } from '../firebase/circleRequestsService';
import useAuth from './useAuth';
import { circleMembersService } from '../firebase/circleMembersService';

/**
 * Hook to manage circle join requests
 * @param {string} circleId - The circle ID (for getting circle-specific requests)
 * @param {string} adminId - The admin ID (for getting admin-specific requests)
 * @returns {Object} Object containing requests, loading state, and helper functions
 */
const useCircleRequests = (circleId = null, adminId = null) => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestCount, setRequestCount] = useState(0);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);

    useEffect(() => {
        if (!circleId && !adminId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        let unsubscribe;

        if (circleId) {
            // Get requests for a specific circle
            unsubscribe = circleRequestsService.getCircleRequests(circleId, (snapshot) => {
                const requestsList = [];
                snapshot.forEach(doc => {
                    requestsList.push({ id: doc.id, ...doc.data() });
                });

                setRequests(requestsList);
                setRequestCount(requestsList.length);
                setLoading(false);
            });
        } else if (adminId) {
            // Get all requests for an admin
            unsubscribe = circleRequestsService.getAdminRequests(adminId, (snapshot) => {
                const requestsList = [];
                snapshot.forEach(doc => {
                    requestsList.push({ id: doc.id, ...doc.data() });
                });

                setRequests(requestsList);
                setRequestCount(requestsList.length);
                setLoading(false);
            });
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [circleId, adminId]);

    useEffect(() => {
        if (circleId && user?.uid) {
            const checkPending = async () => {
                const pending = await circleRequestsService.checkExistingRequest(circleId, user.uid);
                setHasPendingRequest(pending);
            };
            checkPending();
        } else {
            setHasPendingRequest(false);
        }
    }, [circleId, user]);

    // Helper functions
    const createJoinRequest = async (circleId, userId, adminId, circleName, userName) => {
        // Validate inputs
        if (!circleId || !userId) {
            return { success: false, error: 'Missing required parameters' };
        }

        // Check if request already exists
        const hasExistingRequest = await circleRequestsService.checkExistingRequest(circleId, userId);
        if (hasExistingRequest) {
            return { success: false, error: 'You already have a pending request for this circle' };
        }

        const result = await circleRequestsService.createJoinRequest(circleId, userId, adminId, circleName, userName);

        // Update the pending request status if successful
        if (result.success) {
            setHasPendingRequest(true);
        }

        return result;
    };

    const createInvitation = async (circleId, userId, inviterId, circleName, inviterName, ownerId) => {
        // Validate inputs
        if (!circleId || !userId || !inviterId) {
            return { success: false, error: 'Missing required parameters' };
        }

        // Check if invitation already exists
        const hasExistingInvitation = await circleRequestsService.checkExistingInvitation(circleId, userId);
        if (hasExistingInvitation) {
            return { success: false, error: 'This user already has a pending invitation for this circle' };
        }

        // Check if user is already a member
        const { usersService } = await import('../firebase/usersService');
        const isMember = await usersService.isUserMemberOfCircle(userId, circleId);
        if (isMember) {
            return { success: false, error: 'This user is already a member of this circle' };
        }

        return await circleRequestsService.createInvitation(circleId, userId, inviterId, circleName, inviterName, ownerId);
    };

    const approveRequest = async (requestId) => {
        return await circleRequestsService.approveRequest(requestId, circleMembersService.addMemberToCircle, user?.uid);
    };

    const denyRequest = async (requestId) => {
        return await circleRequestsService.denyRequest(requestId);
    };

    const approveAllRequests = async (circleId) => {
        return await circleRequestsService.approveAllRequests(circleId, circleMembersService.addMemberToCircle, user?.uid);
    };

    const denyAllRequests = async (circleId) => {
        return await circleRequestsService.denyAllRequests(circleId);
    };

    const deleteRequest = async (requestId) => {
        return await circleRequestsService.deleteRequest(requestId);
    };

    return {
        requests,
        loading,
        requestCount,
        createJoinRequest,
        createInvitation,
        approveRequest,
        denyRequest,
        approveAllRequests,
        denyAllRequests,
        deleteRequest,
        hasPendingRequest
    };
};

export default useCircleRequests;