import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import useSystemMessages from '../../../../hooks/useSystemMessages';
import { RADII, SHADOWS } from '../../../../constants/constants';

const CircleActivity = ({ circleId, recentActivity }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const { systemMessages } = useSystemMessages(circleId);

    const activities = recentActivity.length > 0 ? recentActivity : systemMessages
        .filter(msg => msg.type === 'new_member' || msg.type === 'new_event')
        .map(msg => ({
            id: msg.id,
            type: msg.type,
            user: msg.type === 'new_member' ? msg.memberName : msg.creatorName,
            action: msg.type === 'new_member' ? 'joined the circle' : `created a new event: "${msg.eventName}"`,
            timestamp: new Date(msg.timestamp),
            icon: msg.type === 'new_member' ? 'person-add' : 'calendar',
        }));

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            return `${days}d ago`;
        }
    };

    const renderActivityItem = ({ item }) => (
        <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
            <View style={styles.activityIcon}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                    <Text style={styles.userName}>{item.user}</Text>
                    <Text style={styles.actionText}> {item.action}</Text>
                </Text>
                <Text style={styles.timestamp}>{formatTimeAgo(item.timestamp)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.activityList}>
                <FlatList
                    data={activities.slice(0, 5)} // Show only first 5 items
                    renderItem={renderActivityItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewAllText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    activityList: {
        backgroundColor: colors.card,
        borderRadius: RADII.rounded,
        padding: 4,
        ...SHADOWS.card,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: RADII.small,
        marginVertical: 2,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: RADII.circle,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    activityContent: {
        flex: 1,
    },
    activityText: {
        color: colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    userName: {
        fontWeight: '600',
        color: colors.primary,
    },
    actionText: {
        color: colors.textSecondary,
    },
    timestamp: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
});

export default CircleActivity;