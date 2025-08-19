import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../../../constants/constants';

const AdminConfirmationState = ({ eventData, onContactAdmin }) => {
    const { colors } = useTheme();
    const { winningActivity, winningPlace, votingResults, memberCount } = eventData || {};

    const getParticipationStats = () => {
        if (!votingResults || !memberCount) return { totalVotes: 0, participationRate: 0 };

        const activityVotes = Object.values(votingResults.activity || {}).reduce((sum, votes) => sum + votes, 0);
        const placeVotes = Object.values(votingResults.place || {}).reduce((sum, votes) => sum + votes, 0);
        const totalVotes = Math.max(activityVotes, placeVotes);
        const participationRate = Math.round((totalVotes / memberCount) * 100);

        return { totalVotes, participationRate };
    };

    const { totalVotes, participationRate } = getParticipationStats();
    const styles = getStyles(colors);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
                <View style={styles.statusIndicator}>
                    <Ionicons name="hourglass-outline" size={24} color={colors.warning} />
                </View>
                <Text style={styles.title}>Awaiting Admin Confirmation</Text>
                <Text style={styles.subtitle}>Your votes have been counted and the results are in!</Text>
            </View>

            <View style={styles.resultsContainer}>
                <Text style={styles.sectionTitle}>Voting Results</Text>

                <View style={styles.resultCard}>
                    <View style={styles.resultRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="game-controller" size={16} color={colors.primary} />
                        </View>
                        <View style={styles.resultContent}>
                            <Text style={styles.resultLabel}>Winning Activity</Text>
                            <Text style={styles.resultValue}>{winningActivity || 'Not available'}</Text>
                        </View>
                    </View>

                    <View style={styles.resultRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="location" size={16} color={colors.primary} />
                        </View>
                        <View style={styles.resultContent}>
                            <Text style={styles.resultLabel}>Winning Location</Text>
                            <Text style={styles.resultValue}>{winningPlace || 'Not available'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Participation Stats</Text>

                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalVotes}</Text>
                        <Text style={styles.statLabel}>Total Votes</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{participationRate}%</Text>
                        <Text style={styles.statLabel}>Participation</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color={colors.accent} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>What happens next?</Text>
                        <Text style={styles.infoText}>
                            An admin will review the voting results and confirm the final event details.
                            You'll be notified once the event is officially confirmed and ready for RSVPs.
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.contactButton} onPress={onContactAdmin}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.surface} />
                <Text style={styles.contactButtonText}>Contact Admin</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        maxHeight: 280,
        backgroundColor: colors.surface,
        borderBottomLeftRadius: RADII.rounded,
        borderBottomRightRadius: RADII.rounded,
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statusIndicator: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.warning + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
    },
    resultsContainer: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    resultCard: {
        backgroundColor: colors.card,
        borderRadius: RADII.medium,
        padding: 12,
        ...SHADOWS.medium,
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    resultContent: {
        flex: 1,
    },
    resultLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    resultValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    statsContainer: {
        paddingHorizontal: 15,
        paddingBottom: 12,
    },
    statsCard: {
        backgroundColor: colors.card,
        borderRadius: RADII.medium,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        ...SHADOWS.medium,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.border,
        marginHorizontal: 15,
    },
    infoContainer: {
        paddingHorizontal: 15,
        paddingBottom: 12,
    },
    infoCard: {
        backgroundColor: colors.accent + '10',
        borderRadius: RADII.medium,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoContent: {
        flex: 1,
        marginLeft: 10,
    },
    infoTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 14,
    },
    contactButton: {
        backgroundColor: colors.warning,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: RADII.medium,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    contactButtonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default AdminConfirmationState;