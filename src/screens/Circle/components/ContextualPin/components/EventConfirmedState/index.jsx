import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const EventConfirmedState = ({ eventData, onRsvp, onStartNewPoll }) => {
    const { title, location, rsvps, currentUser } = eventData;

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
                <Ionicons name="calendar-outline" size={24} color={COLORS.accent} />
                <Text style={styles.title}>Event Confirmed!</Text>
            </View>

            <View style={styles.eventDetailsContainer}>
                <View style={styles.detailRow}>
                    <Ionicons name="star" size={16} color={COLORS.primary} />
                    <Text style={styles.detailLabel}>Activity:</Text>
                    <Text style={styles.detailValue}>{title}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color={COLORS.primary} />
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{location}</Text>
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
        padding: 15,
        width: '100%',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 18,
        marginTop: 8,
        textAlign: 'center',
    },
    eventDetailsContainer: {
        backgroundColor: COLORS.darker,
        borderRadius: RADII.rounded,
        padding: 10,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
        marginLeft: 8,
        marginRight: 8,
        fontWeight: '600',
    },
    detailValue: {
        color: COLORS.light,
        fontFamily: FONTS.body,
        fontSize: 14,
        flex: 1,
    },
    rsvpSection: {
        marginBottom: 12,
    },
    rsvpTitle: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 12,
    },
    rsvpButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    rsvpButton: {
        flex: 1,
        backgroundColor: COLORS.darker,
        borderRadius: RADII.rounded,
        padding: 10,
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
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    selectedRsvpText: {
        color: COLORS.light,
    },
    countBadge: {
        position: 'absolute',
        top: -3,
        right: -3,
        backgroundColor: COLORS.accent,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontSize: 10,
        fontWeight: 'bold',
    },
    summaryContainer: {
        backgroundColor: COLORS.darker,
        borderRadius: RADII.rounded,
        padding: 10,
        marginBottom: 8,
    },
    summaryTitle: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 12,
        marginTop: 3,
    },
    newPollButton: {
        backgroundColor: COLORS.accent,
        borderRadius: RADII.pill,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    newPollButtonText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
    },
});

export default EventConfirmedState;