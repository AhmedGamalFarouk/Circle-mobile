import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';

const CircleActions = ({ circleId, circle, navigation }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const actions = [
        {
            title: 'Open Chat',
            icon: 'chatbubbles',
            color: colors.primary,
            onPress: () => navigation.navigate('Chat', { circleId }),
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

    const handleShareCircle = () => {
        // Implement share functionality
        console.log('Sharing circle:', circleId);
    };

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
                        <Ionicons name={action.icon} size={28} color={action.color} style={styles.actionIcon} />
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
    actionIcon: {
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default CircleActions;