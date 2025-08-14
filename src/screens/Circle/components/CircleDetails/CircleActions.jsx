import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';
import useAuth from '../../../../hooks/useAuth';
import useCircleMembers from '../../../../hooks/useCircleMembers';
import useCircleRequests from '../../../../hooks/useCircleRequests';
import JoinRequestsModal from '../../../../components/JoinRequestsModal';


const CircleActions = ({ circleId, circle, navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const { isMember, isAdmin, getAdmins } = useCircleMembers(circleId);
    const { requestCount, createJoinRequest, hasPendingRequest } = useCircleRequests(circleId);
    const [isRequestingJoin, setIsRequestingJoin] = useState(false);
    const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
    const styles = getStyles(colors);

    const currentUserIsMember = isMember(user?.uid);
    const currentUserIsAdmin = isAdmin(user?.uid);
    const admins = getAdmins();

    // Actions for members
    const memberActions = [
        {
            title: 'Create Poll',
            icon: 'bar-chart',
            color: colors.secondary,
            onPress: () => navigation.navigate('Circle', { circleId, openPollModal: true }),
        },
        {
            title: 'Share Circle',
            icon: 'share',
            color: colors.accent,
            onPress: () => handleShareCircle(),
        },
        {
            title: 'Invite Members',
            icon: 'person-add',
            color: colors.primary,
            onPress: () => navigation.navigate('InviteMembers', {
                circleId,
                circleName: circle.circleName || circle.name,
                ownerId: circle.createdBy
            }),
        },
    ];

    // Additional actions for admins
    const adminActions = [
        ...memberActions,
        {
            title: 'Join Requests',
            icon: 'people',
            color: requestCount > 0 ? colors.warning : colors.textSecondary,
            badge: requestCount > 0 ? requestCount : null,
            onPress: () => setShowJoinRequestsModal(true),
        },
    ];

    const handleShareCircle = () => {
        // Implement share functionality
    };

    const handleViewProfile = (userId) => {
        setShowJoinRequestsModal(false);
        navigation.navigate('Profile', { userId });
    };

    const handleJoinRequest = async () => {
        if (!user || !circle || isRequestingJoin) return;

        setIsRequestingJoin(true);
        try {
            // Get the first admin as the target for the request
            const adminId = admins.length > 0 ? admins[0].userId : circle.createdBy;

            const result = await createJoinRequest(
                circleId,
                user.uid,
                adminId,
                circle.circleName || circle.name,
                user.displayName || user.username || 'Unknown User'
            );

            if (result.success) {
                Alert.alert(
                    'Request Sent',
                    `Your request to join "${circle.circleName || circle.name}" has been sent to the admin.`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Request Failed',
                    result.error || 'Failed to send join request. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error sending join request:', error);
            Alert.alert(
                'Error',
                'An error occurred while sending your request. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsRequestingJoin(false);
        }
    };

    // Actions for non-members (join request)
    const nonMemberActions = [
        {
            title: hasPendingRequest ? 'Request Pending' : 'Request to Join',
            icon: hasPendingRequest ? 'hourglass' : 'person-add',
            color: hasPendingRequest ? colors.warning : colors.primary,
            onPress: hasPendingRequest ? null : handleJoinRequest,
            disabled: hasPendingRequest || isRequestingJoin,
        },
    ];

    // Show actions based on user role
    let actions;
    if (!currentUserIsMember) {
        actions = nonMemberActions;
    } else if (currentUserIsAdmin) {
        actions = adminActions;
    } else {
        actions = memberActions;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>
                {!currentUserIsMember ? 'Join Circle' : 'Quick Actions'}
            </Text>
            <View style={styles.actionsGrid}>
                {actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.actionButton,
                            { borderColor: action.color },
                            action.disabled && styles.disabledButton
                        ]}
                        onPress={action.disabled ? null : action.onPress}
                        activeOpacity={action.disabled ? 1 : 0.7}
                        disabled={action.disabled}
                    >
                        <View style={styles.actionContent}>
                            <Ionicons
                                name={action.icon}
                                size={28}
                                color={action.disabled ? colors.textSecondary : action.color}
                                style={styles.actionIcon}
                            />
                            {action.badge && (
                                <View style={[styles.badge, { backgroundColor: action.color }]}>
                                    <Text style={styles.badgeText}>{action.badge}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[
                            styles.actionTitle,
                            { color: action.disabled ? colors.textSecondary : action.color }
                        ]}>
                            {action.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <JoinRequestsModal
                visible={showJoinRequestsModal}
                onClose={() => setShowJoinRequestsModal(false)}
                circleId={circleId}
                circleName={circle.name}
                onViewProfile={handleViewProfile}
            />
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 8,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    joinContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        backgroundColor: colors.surface,
        borderRadius: RADII.rounded,
        borderWidth: 2,
        padding: 16,
        alignItems: 'center',
        width: '48%',
        marginBottom: 12,
        ...SHADOWS.card,
    },
    actionContent: {
        position: 'relative',
        alignItems: 'center',
    },
    actionIcon: {
        marginBottom: 8,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default CircleActions;