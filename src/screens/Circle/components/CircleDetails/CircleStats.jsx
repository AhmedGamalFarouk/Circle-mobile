import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';

const CircleStats = ({ circle, memberCount }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const stats = [
        {
            label: 'Members',
            value: memberCount,
            icon: '👥',
        },
        {
            label: 'Messages',
            value: circle.messageCount || 0,
            icon: '💬',
        },
        {
            label: 'Active Today',
            value: circle.activeToday || 0,
            icon: '🟢',
        },
        {
            label: 'Polls',
            value: circle.pollCount || 0,
            icon: '📊',
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Circle Stats</Text>
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                        <Text style={styles.statIcon}>{stat.icon}</Text>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: colors.card,
        borderRadius: RADII.rounded,
        padding: 16,
        alignItems: 'center',
        width: '48%',
        marginBottom: 12,
        ...SHADOWS.card,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        color: colors.primary,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
    },
});

export default CircleStats;