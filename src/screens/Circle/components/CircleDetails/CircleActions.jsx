import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import useAuth from '../../../../hooks/useAuth';
import useCircleMembers from '../../../../hooks/useCircleMembers';
import useCircleRequests from '../../../../hooks/useCircleRequests';
import usePendingEvents from '../../../../hooks/usePendingEvents';
import JoinRequestsModal from '../../../../components/JoinRequestsModal';
import EventConfirmationModal from './EventConfirmationModal';
import { useNavigation } from '@react-navigation/native';
import { RADII, SHADOWS } from '../../../../constants/constants';
import { COLORS } from '../../../../constants/constants';
import { circleRequestsService } from '../../../../firebase/circleRequestsService';
import { circleMembersService } from '../../../../firebase/circleMembersService';
import { useTranslation } from 'react-i18next';


const CircleActions = ({ circleId, circle }) => {
    const { colors } = useTheme();
    const { currentLanguage } = useLanguage();
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigation = useNavigation();
    const { isMember, isAdmin, getAdmins } = useCircleMembers(circleId);
    const { requestCount, createJoinRequest, hasPendingRequest } = useCircleRequests(circleId);
    const { pendingCount } = usePendingEvents(circleId);
    const [isRequestingJoin, setIsRequestingJoin] = useState(false);
    const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
    const [showEventConfirmationModal, setShowEventConfirmationModal] = useState(false);
    const styles = getStyles(colors);

    const currentUserIsMember = isMember(user?.uid);
    const currentUserIsAdmin = isAdmin(user?.uid);
    const admins = getAdmins();

    // Actions for members
    const memberActions = [
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
        {
            title: 'View Events',
            icon: 'eye',
            color: colors.secondary,
            onPress: () => navigation.navigate('EventConfirmation', { circleId }),
        },
        {
            title: 'Leave Circle',
            icon: 'exit',
            color: '#FF3B30',
            onPress: handleLeaveCircle,
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
        {
            title: 'Confirm Events',
            icon: 'calendar',
            color: pendingCount > 0 ? colors.warning : colors.textSecondary,
            badge: pendingCount > 0 ? pendingCount : null,
            onPress: () => setShowEventConfirmationModal(true),
        },
    ];

    const handleShareCircle = () => {
        // Implement share functionality
    };

    const handleLeaveCircle = () => {
        if (!user?.uid) {
            Alert.alert('Error', 'User not authenticated. Please try again.');
            return;
        }
        if (!circleId) {
            Alert.alert('Error', 'Circle not found. Please try again.');
            return;
        }

        Alert.alert(
            'Leave Circle',
            `Are you sure you want to leave "${circle?.circleName || circle?.name || 'this circle'}"? You won't be able to see messages or participate in polls.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await circleMembersService.removeMemberFromCircle(circleId, user.uid);
                            if (result.success) {
                                // Show different message if circle was deleted
                                if (result.circleDeleted) {
                                    Alert.alert(
                                        'Circle Deleted',
                                        'You were the last member, so the circle has been deleted.',
                                        [{ 
                                            text: 'OK', 
                                            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
                                        }]
                                    );
                                } else {
                                    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                                }
                            } else {
                                Alert.alert('Error', result.error || 'Failed to leave circle. Please try again.');
                            }
                        } catch (error) {
                            console.error('Error leaving circle:', error);
                            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleViewProfile = (userId) => {
        setShowJoinRequestsModal(false);
        if (userId) {
            const profileTabName = currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profile';
            navigation.navigate(profileTabName, { userId });
        }
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

            <EventConfirmationModal
                visible={showEventConfirmationModal}
                onClose={() => setShowEventConfirmationModal(false)}
                circleId={circleId}
                circleName={circle.circleName || circle.name}
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