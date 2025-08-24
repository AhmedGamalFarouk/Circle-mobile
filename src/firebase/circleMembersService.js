import {
    collection,
    addDoc,
    doc,
    getDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { systemMessagesService } from './systemMessagesService';

export const circleMembersService = {
    // Add a user to a circle as a member
    addMemberToCircle: async (circleId, userId) => {
        try {
            // Check if user is already a member
            const membersRef = collection(db, 'circles', circleId, 'members');
            const q = query(membersRef, where('userId', '==', userId));
            const existingMember = await getDocs(q);

            if (!existingMember.empty) {
                return { success: false, error: 'User is already a member of this circle' };
            }

            // Get user information
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Add member to circle's members subcollection
            const memberData = {
                userId,
                username: userData.displayName || userData.username || userData.name || 'Unknown User',
                email: userData.email || '',
                photoURL: userData.photoURL || userData.avatar || '',
                isAdmin: false,
                isOwner: false,
                joinedAt: serverTimestamp(),
                addedBy: 'join_request'
            };

            await addDoc(membersRef, memberData);

            // Update user stats using single source of truth
            const { joinCircle } = await import('../utils/userStatsManager');
            await joinCircle(userId, circleId);

            // Create system message for user joining
            const username = userData.displayName || userData.username || userData.name || 'Unknown User';
            await systemMessagesService.createUserJoinedMessage(circleId, userId, username);

            return { success: true };
        } catch (error) {
            console.error('Error adding member to circle:', error);
            return { success: false, error: error.message };
        }
    },

    // Get circle information
    getCircleInfo: async (circleId) => {
        try {
            const circleDoc = await getDoc(doc(db, 'circles', circleId));
            if (circleDoc.exists()) {
                return { success: true, data: circleDoc.data() };
            } else {
                return { success: false, error: 'Circle not found' };
            }
        } catch (error) {
            console.error('Error getting circle info:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete entire circle and all its data
    deleteCircle: async (circleId) => {
        try {
            // Get all members before deleting to update their joinedCircles arrays
            const membersRef = collection(db, 'circles', circleId, 'members');
            const membersSnapshot = await getDocs(membersRef);
            
            // Remove circle from all members' joinedCircles arrays
            const userUpdatePromises = membersSnapshot.docs.map(async (memberDoc) => {
                const memberData = memberDoc.data();
                if (memberData.userId) {
                    const userRef = doc(db, 'users', memberData.userId);
                    try {
                        await updateDoc(userRef, {
                            joinedCircles: arrayRemove(circleId),
                            'stats.circles': increment(-1)
                        });
                    } catch (error) {
                        console.error(`Error updating user ${memberData.userId}:`, error);
                    }
                }
            });
            
            await Promise.all(userUpdatePromises);

            // Delete all members
            const memberDeletePromises = membersSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(memberDeletePromises);

            // Delete all polls
            const pollsRef = collection(db, 'circles', circleId, 'polls');
            const pollsSnapshot = await getDocs(pollsRef);
            const pollDeletePromises = pollsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(pollDeletePromises);

            // Delete all messages
            const messagesRef = collection(db, 'circles', circleId, 'messages');
            const messagesSnapshot = await getDocs(messagesRef);
            const messageDeletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(messageDeletePromises);

            // Delete all join requests
            const requestsRef = collection(db, 'circleRequests');
            const requestsQuery = query(requestsRef, where('circleId', '==', circleId));
            const requestsSnapshot = await getDocs(requestsQuery);
            const requestDeletePromises = requestsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(requestDeletePromises);

            // Delete the circle document itself
            await deleteDoc(doc(db, 'circles', circleId));

            return { success: true };
        } catch (error) {
            console.error('Error deleting circle:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove a user from a circle
    removeMemberFromCircle: async (circleId, userId) => {
        try {
            // Validate inputs
            if (!circleId || !userId) {
                return { success: false, error: 'Circle ID and User ID are required' };
            }

            // Get user information first for the system message
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            const username = userData.displayName || userData.username || userData.name || 'Unknown User';

            // Find and remove the member document
            const membersRef = collection(db, 'circles', circleId, 'members');
            const q = query(membersRef, where('userId', '==', userId));
            const memberSnapshot = await getDocs(q);

            if (memberSnapshot.empty) {
                return { success: false, error: 'User is not a member of this circle' };
            }

            // Delete the member document
            const memberDoc = memberSnapshot.docs[0];
            await deleteDoc(memberDoc.ref);

            // Check remaining member count after deletion
            const remainingMembersSnapshot = await getDocs(membersRef);
            const remainingMemberCount = remainingMembersSnapshot.size;

            // If this was the last member, delete the entire circle
            if (remainingMemberCount === 0) {
                console.log(`Last member left circle ${circleId}, deleting circle...`);
                await circleMembersService.deleteCircle(circleId);
                return { success: true, circleDeleted: true };
            }

            // Update user stats using single source of truth (only if user document exists)
            if (userDoc.exists()) {
                // Import and use leaveCircle function to maintain single source of truth
                const { leaveCircle } = await import('../utils/userStatsManager');
                await leaveCircle(userId, circleId);
            }

            // Create system message for user leaving (only if circle still exists)
            await systemMessagesService.createUserLeftMessage(circleId, userId, username);

            return { success: true };
        } catch (error) {
            console.error('Error removing member from circle:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user information
    getUserInfo: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                return { success: true, data: userDoc.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user info:', error);
            return { success: false, error: error.message };
        }
    },

    // Make a member an admin
    makeAdmin: async (circleId, userId, currentUserId) => {
        try {
            // Check if current user is owner or admin
            const currentUserMemberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', currentUserId)
            );
            const currentUserSnapshot = await getDocs(currentUserMemberQuery);

            if (currentUserSnapshot.empty) {
                return { success: false, error: 'You are not a member of this circle' };
            }

            const currentUserData = currentUserSnapshot.docs[0].data();
            if (!currentUserData.isOwner && !currentUserData.isAdmin) {
                return { success: false, error: 'You do not have permission to make admins' };
            }

            // Find the target member
            const memberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', userId)
            );
            const memberSnapshot = await getDocs(memberQuery);

            if (memberSnapshot.empty) {
                return { success: false, error: 'User is not a member of this circle' };
            }

            const memberDoc = memberSnapshot.docs[0];
            await updateDoc(memberDoc.ref, {
                isAdmin: true
            });

            return { success: true };
        } catch (error) {
            console.error('Error making user admin:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove admin status from a member
    removeAdmin: async (circleId, userId, currentUserId) => {
        try {
            // Check if current user is owner
            const currentUserMemberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', currentUserId)
            );
            const currentUserSnapshot = await getDocs(currentUserMemberQuery);

            if (currentUserSnapshot.empty) {
                return { success: false, error: 'You are not a member of this circle' };
            }

            const currentUserData = currentUserSnapshot.docs[0].data();
            if (!currentUserData.isOwner) {
                return { success: false, error: 'Only the owner can remove admin status' };
            }

            // Find the target member
            const memberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', userId)
            );
            const memberSnapshot = await getDocs(memberQuery);

            if (memberSnapshot.empty) {
                return { success: false, error: 'User is not a member of this circle' };
            }

            const memberDoc = memberSnapshot.docs[0];
            const memberData = memberDoc.data();

            // Prevent removing owner's admin status
            if (memberData.isOwner) {
                return { success: false, error: 'Cannot remove admin status from the owner' };
            }

            await updateDoc(memberDoc.ref, {
                isAdmin: false
            });

            return { success: true };
        } catch (error) {
            console.error('Error removing admin status:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove a member from circle (admin function)
    removeMemberByAdmin: async (circleId, userId, currentUserId) => {
        try {
            // Check if current user is owner or admin
            const currentUserMemberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', currentUserId)
            );
            const currentUserSnapshot = await getDocs(currentUserMemberQuery);

            if (currentUserSnapshot.empty) {
                return { success: false, error: 'You are not a member of this circle' };
            }

            const currentUserData = currentUserSnapshot.docs[0].data();
            if (!currentUserData.isOwner && !currentUserData.isAdmin) {
                return { success: false, error: 'You do not have permission to remove members' };
            }

            // Find the target member
            const memberQuery = query(
                collection(db, 'circles', circleId, 'members'),
                where('userId', '==', userId)
            );
            const memberSnapshot = await getDocs(memberQuery);

            if (memberSnapshot.empty) {
                return { success: false, error: 'User is not a member of this circle' };
            }

            const memberData = memberSnapshot.docs[0].data();

            // Prevent removing the owner
            if (memberData.isOwner) {
                return { success: false, error: 'Cannot remove the circle owner' };
            }

            // Non-owners cannot remove admins
            if (!currentUserData.isOwner && memberData.isAdmin) {
                return { success: false, error: 'Only the owner can remove admins' };
            }

            // Use the existing removeMemberFromCircle function
            return await this.removeMemberFromCircle(circleId, userId);
        } catch (error) {
            console.error('Error removing member by admin:', error);
            return { success: false, error: error.message };
        }
    },

    // Add circle owner (called when circle is created)
    addOwnerToCircle: async (circleId, userId) => {
        try {
            // Get user information
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Add owner to circle's members subcollection
            const memberData = {
                userId,
                username: userData.displayName || userData.username || userData.name || 'Unknown User',
                email: userData.email || '',
                photoURL: userData.photoURL || userData.avatar || '',
                isAdmin: true,
                isOwner: true,
                joinedAt: serverTimestamp(),
                addedBy: 'circle_creation'
            };

            await addDoc(collection(db, 'circles', circleId, 'members'), memberData);

            // Update user stats using single source of truth
            const { joinCircle } = await import('../utils/userStatsManager');
            await joinCircle(userId, circleId);

            return { success: true };
        } catch (error) {
            console.error('Error adding owner to circle:', error);
            return { success: false, error: error.message };
        }
    },

    // Ensure circle creator is added as admin member if missing
    // This helps fix circles created on web that might not have members subcollection
    ensureCreatorAsAdmin: async (circleId, creatorId) => {
        try {
            // Check if creator is already in members subcollection
            const membersRef = collection(db, 'circles', circleId, 'members');
            const q = query(membersRef, where('userId', '==', creatorId));
            const existingMember = await getDocs(q);

            if (!existingMember.empty) {
                return { success: true, message: 'Creator already exists as member' };
            }

            // Get user information
            const userDoc = await getDoc(doc(db, 'users', creatorId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Add creator as admin member
            const memberData = {
                userId: creatorId,
                username: userData.displayName || userData.username || userData.name || 'Unknown User',
                email: userData.email || '',
                photoURL: userData.photoURL || userData.avatar || '',
                isAdmin: true,
                isOwner: true,
                joinedAt: serverTimestamp(),
                addedBy: 'auto_fix'
            };

            await addDoc(membersRef, memberData);

            return { success: true, message: 'Creator added as admin member' };
        } catch (error) {
            console.error('Error ensuring creator as admin:', error);
            return { success: false, error: error.message };
        }
    }
};