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

    // Actions for members
    const memberActions = [
        {
            title: 'Open Chat',
            icon: 'chatbubbles',
            color: colors.primary,
            onPress: () => navigation.navigate('Circle', { circleId }),
        },
        {
            title: 'Create Poll',
            icon: 'bar-chart',
            color: colors.secondary,
            onPress: () => navigation.navigate('CreatePoll', { circleId }),
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
            onPress: () => navigation.navigate('InviteMembers', { circleId }),
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
        console.log('Sharing circle:', circleId);
    };

    const handleViewProfile = (userId) => {
        setShowJoinRequestsModal(false);
        navigation.navigate('Profile', { userId });
    };


    // Show actions based on user role
    const actions = currentUserIsAdmin ? adminActions : memberActions;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                {actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.actionButton, { borderColor: action.color }]}
                        onPress={action.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.actionContent}>
                            <Ionicons name={action.icon} size={28} color={action.color} style={styles.actionIcon} />
                            {action.badge && (
                                <View style={[styles.badge, { backgroundColor: action.color }]}>
                                    <Text style={styles.badgeText}>{action.badge}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.actionTitle, { color: action.color }]}>
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
});

export default CircleActions;