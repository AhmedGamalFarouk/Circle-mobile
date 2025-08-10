import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';
import useAuth from '../../../../hooks/useAuth';
import useCircleMembers from '../../../../hooks/useCircleMembers';
import JoinRequestButton from '../../../../components/JoinRequest/JoinRequestButton';
import { useJoinRequests } from '../../../../hooks/useJoinRequests';

const CircleActions = ({ circleId, circle, navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const { isMember, isAdmin } = useCircleMembers(circleId);
    const { pendingCount } = useJoinRequests(circleId, 'pending');
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
            title: `Join Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}`,
            icon: 'people',
            color: pendingCount > 0 ? colors.warning : colors.primary,
            onPress: () => navigation.navigate('JoinRequests', { circleId }),
            badge: pendingCount > 0 ? pendingCount : null,
        },
    ];

    const handleShareCircle = () => {
        // Implement share functionality
        console.log('Sharing circle:', circleId);
    };

    // If user is not a member, show join request button
    if (!currentUserIsMember) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Join Circle</Text>
                <View style={styles.joinContainer}>
                    <JoinRequestButton
                        circleId={circleId}
                        onRequestSubmitted={() => {
                            // Optionally refresh or show success message
                            console.log('Join request submitted');
                        }}
                    />
                </View>
            </View>
        );
    }

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