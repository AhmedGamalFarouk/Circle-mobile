import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const EventConfirmedState = ({ eventData, onRsvp, onStartNewPoll }) => {
    const { winningActivity, winningPlace, rsvps, currentUser } = eventData;

    const getRsvpCounts = () => {
        const counts = { yes: 0, no: 0, maybe: 0 };
        Object.values(rsvps || {}).forEach(rsvp => {
            if (counts[rsvp] !== undefined) counts[rsvp]++;
        });
        return counts;
    };

    const rsvpCounts = getRsvpCounts();
    const userRsvp = currentUser?.rsvp;

    const getRsvpButtonStyle = (rsvpType) => {
        const isSelected = userRsvp === rsvpType;
        return [
            styles.rsvpButton,
            isSelected && styles.selectedRsvpButton,
            rsvpType === 'yes' && isSelected && styles.selectedYes,
            rsvpType === 'no' && isSelected && styles.selectedNo,
            rsvpType === 'maybe' && isSelected && styles.selectedMaybe,
        ];
    };

    const getRsvpTextStyle = (rsvpType) => {
        const isSelected = userRsvp === rsvpType;
        return [
            styles.rsvpButtonText,
            isSelected && styles.selectedRsvpText
        ];
    };

    const getRsvpIcon = (rsvpType) => {
        switch (rsvpType) {
            case 'yes': return 'checkmark-circle';
            case 'no': return 'close-circle';
            case 'maybe': return 'help-circle';
            default: return 'help-circle';
        }
    };

    const getRsvpColor = (rsvpType) => {
        switch (rsvpType) {
            case 'yes': return '#4CAF50';
            case 'no': return '#F44336';
            case 'maybe': return '#FF9800';
            default: return COLORS.text;
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
                <Ionicons name="calendar-outline" size={32} color={COLORS.accent} />
                <Text style={styles.title}>Event Confirmed!</Text>
            </View>

            <View style={styles.eventDetailsContainer}>
                <View style={styles.detailRow}>
                    <Ionicons name="star" size={20} color={COLORS.primary} />
                    <Text style={styles.detailLabel}>Activity:</Text>
                    <Text style={styles.detailValue}>{winningActivity}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{winningPlace}</Text>
                </View>
            </View>

            <View style={styles.rsvpSection}>
                <Text style={styles.rsvpTitle}>Will you be joining us?</Text>

                <View style={styles.rsvpButtonsContainer}>
                    <TouchableOpacity
                        style={getRsvpButtonStyle('yes')}
                        onPress={() => onRsvp('yes')}
                    >
                        <Ionicons
                            name={getRsvpIcon('yes')}
                            size={24}
                            color={userRsvp === 'yes' ? COLORS.light : getRsvpColor('yes')}
                        />
                        <Text style={getRsvpTextStyle('yes')}>Yes</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{rsvpCounts.yes}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={getRsvpButtonStyle('maybe')}
                        onPress={() => onRsvp('maybe')}
                    >
                        <Ionicons
                            name={getRsvpIcon('maybe')}
                            size={24}
                            color={userRsvp === 'maybe' ? COLORS.light : getRsvpColor('maybe')}
                        />
                        <Text style={getRsvpTextStyle('maybe')}>Maybe</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{rsvpCounts.maybe}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={getRsvpButtonStyle('no')}
                        onPress={() => onRsvp('no')}
                    >
                        <Ionicons
                            name={getRsvpIcon('no')}
                            size={24}
                            color={userRsvp === 'no' ? COLORS.light : getRsvpColor('no')}
                        />
                        <Text style={getRsvpTextStyle('no')}>No</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{rsvpCounts.no}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>RSVP Summary</Text>
                <View style={styles.summaryStats}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: getRsvpColor('yes') }]}>
                            {rsvpCounts.yes}
                        </Text>
                        <Text style={styles.statLabel}>Going</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: getRsvpColor('maybe') }]}>
                            {rsvpCounts.maybe}
                        </Text>
                        <Text style={styles.statLabel}>Maybe</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: getRsvpColor('no') }]}>
                            {rsvpCounts.no}
                        </Text>
                        <Text style={styles.statLabel}>Not Going</Text>
                    </View>
                </View>
            </View>

            {onStartNewPoll && (
                <TouchableOpacity style={styles.newPollButton} onPress={onStartNewPoll}>
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.darker} />
                    <Text style={styles.newPollButtonText}>Plan New Event</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.largeRounded,
        borderBottomRightRadius: RADII.largeRounded,
        padding: 25,
        width: '100%',
        maxHeight: 400,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 24,
        marginTop: 10,
        textAlign: 'center',
    },
    eventDetailsContainer: {
        backgroundColor: COLORS.darker,
        borderRadius: RADII.rounded,
        padding: 20,
        marginBottom: 25,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
        marginLeft: 10,
        marginRight: 10,
        fontWeight: '600',
    },
    detailValue: {
        color: COLORS.light,
        fontFamily: FONTS.body,
        fontSize: 16,
        flex: 1,
    },
    rsvpSection: {
        marginBottom: 25,
    },
    rsvpTitle: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    rsvpButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    rsvpButton: {
        flex: 1,
        backgroundColor: COLORS.darker,
        borderRadius: RADII.rounded,
        padding: 15,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    selectedRsvpButton: {
        borderColor: COLORS.primary,
    },
    selectedYes: {
        backgroundColor: '#4CAF50',
    },
    selectedNo: {
        backgroundColor: '#F44336',
    },
    selectedMaybe: {
        backgroundColor: '#FF9800',
    },
    rsvpButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
        fontWeight: '600',
        marginTop: 5,
    },
    selectedRsvpText: {
        color: COLORS.light,
    },
    countBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontSize: 12,
        fontWeight: 'bold',
    },
    summaryContainer: {
        backgroundColor: COLORS.darker,
        borderRadius: RADII.rounded,
        padding: 20,
    },
    summaryTitle: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 15,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontFamily: FONTS.heading,
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
        marginTop: 5,
    },
    newPollButton: {
        backgroundColor: COLORS.accent,
        borderRadius: RADII.pill,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    newPollButtonText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default EventConfirmedState;