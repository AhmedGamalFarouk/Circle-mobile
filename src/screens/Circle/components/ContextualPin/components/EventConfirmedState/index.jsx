import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';
import { useTheme } from '../../../../../../context/ThemeContext';

const EventConfirmedState = ({ eventData, onRsvp, onStartNewPoll }) => {
    const { colors } = useTheme();
    // Handle case when eventData is null (after deletion)
    if (!eventData) {
        return null;
    }
    
    const { title, location, rsvps, currentUser } = eventData;

    const getRsvpCounts = () => {
        const counts = { yes: 0, no: 0, maybe: 0 };
        Object.values(rsvps || {}).forEach(rsvp => {
            if (counts[rsvp] !== undefined) counts[rsvp]++;
        });
        return counts;
    };

    const openInGoogleMaps = () => {
        if (!location) {
            Alert.alert('No Location', 'No location information available for this event.');
            return;
        }

        const encodedLocation = encodeURIComponent(location);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        
        Linking.canOpenURL(googleMapsUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(googleMapsUrl);
                } else {
                    Alert.alert('Error', 'Unable to open Google Maps');
                }
            })
            .catch((err) => {
                console.error('Error opening Google Maps:', err);
                Alert.alert('Error', 'Failed to open Google Maps');
            });
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
            <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Event Confirmed!</Text>
            </View>

            <View style={[styles.eventDetailsContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.detailRow, { backgroundColor: colors.background }]}>
                    <Ionicons name="star" size={16} color={colors.primary} />
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Activity:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{title}</Text>
                </View>

                <View style={[styles.detailRow, { backgroundColor: colors.background }]}>
                    <Ionicons name="location" size={16} color={colors.primary} />
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Location:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{location}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color={COLORS.primary} />
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{eventData?.day ? new Date(eventData.day).toLocaleDateString() : 'TBD'}</Text>
                </View>
                
                <TouchableOpacity style={[styles.mapsButton, { backgroundColor: colors.background }]} onPress={openInGoogleMaps}>
                    <Ionicons name="navigate" size={16} color={colors.primary} />
                    <Text style={[styles.mapsButtonText, { color: colors.primary }]}>Open in Google Maps</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.rsvpSection, { backgroundColor: colors.background, borderColor: colors.primary }]}>
                <Text style={[styles.rsvpTitle, { color: colors.text }]}>Will you be joining us?</Text>

                <View style={[styles.rsvpButtonsContainer, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                        style={[getRsvpButtonStyle('yes'), { backgroundColor: colors.background }]}
                        onPress={() => onRsvp('yes')}
                    >
                        <Ionicons
                            name={getRsvpIcon('yes')}
                            size={24}
                            color={userRsvp === 'yes' ? COLORS.light : getRsvpColor('yes')}
                        />
                        <Text style={[getRsvpTextStyle('yes'), { color: colors.text }]}>Yes</Text>
                        <View style={[styles.countBadge, { backgroundColor: colors.background }]}>
                            <Text style={[styles.countText, { color: colors.text }]}>{rsvpCounts.yes}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[getRsvpButtonStyle('maybe'), { backgroundColor: colors.background }]}
                        onPress={() => onRsvp('maybe')}
                    >
                        <Ionicons
                            name={getRsvpIcon('maybe')}
                            size={24}
                            color={userRsvp === 'maybe' ? COLORS.light : getRsvpColor('maybe')}
                        />
                        <Text style={[getRsvpTextStyle('maybe'), { color: colors.text }]}>Maybe</Text>
                        <View style={[styles.countBadge, { backgroundColor: colors.background }]}>
                            <Text style={[styles.countText, { color: colors.text }]}>{rsvpCounts.maybe}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[getRsvpButtonStyle('no'), { backgroundColor: colors.background }]}
                        onPress={() => onRsvp('no')}
                    >
                        <Ionicons
                            name={getRsvpIcon('no')}
                            size={24}
                            color={userRsvp === 'no' ? COLORS.light : getRsvpColor('no')}
                        />
                        <Text style={[getRsvpTextStyle('no'), { color: colors.text }]}>No</Text>
                        <View style={[styles.countBadge, { backgroundColor: colors.background }]}>
                            <Text style={[styles.countText, { color: colors.text }]}>{rsvpCounts.no}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.summaryContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>RSVP Summary</Text>
                <View style={[styles.summaryStats, { backgroundColor: colors.background }]}>
                    <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                        <Text style={[styles.statNumber, { color: getRsvpColor('yes') }]}>
                            {rsvpCounts.yes}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Going</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                        <Text style={[styles.statNumber, { color: getRsvpColor('maybe') }]}>
                            {rsvpCounts.maybe}
                        </Text>
                            <Text style={[styles.statLabel, { color: colors.text }]}>Maybe</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                        <Text style={[styles.statNumber, { color: getRsvpColor('no') }]}>
                            {rsvpCounts.no}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Not Going</Text>
                    </View>
                </View>
            </View>

            {onStartNewPoll && (() => {
                const eventDate = new Date(eventData?.day);
                const nextAvailableDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);
                const currentDate = new Date();
                const isEventActive = eventData?.day && currentDate < nextAvailableDate;
                
                return (
                    <View style={[styles.newPollContainer, { backgroundColor: colors.background }]}>
                        <TouchableOpacity 
                            style={[
                                styles.newPollButton,
                                isEventActive && styles.disabledButton,
                                { backgroundColor: colors.background }
                            ]} 
                            onPress={isEventActive ? null : onStartNewPoll}
                            disabled={isEventActive}
                        >
                            <Ionicons 
                                name="add-circle-outline" 
                                size={20} 
                                color={isEventActive ? colors.text : colors.primary} 
                            />
                            <Text style={[
                                styles.newPollButtonText,
                                isEventActive && styles.disabledButtonText,
                                { color: colors.primary, backgroundColor: colors.background }
                            ]}>
                                {isEventActive ? 'Event In Progress' : 'Plan New Event'}
                            </Text>
                        </TouchableOpacity>
                        {isEventActive && (
                            <Text style={[styles.disabledButtonHint, { color: colors.text }]}>
                                New events can be planned after {nextAvailableDate.toLocaleDateString('en-US', {
                                    month: 'short', 
                                    day: 'numeric'
                                })}
                            </Text>
                        )}
                    </View>
                );
            })()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
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
        fontFamily: FONTS.heading,
        fontSize: 18,
        marginTop: 8,
        textAlign: 'center',
    },
    eventDetailsContainer: {
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
    mapsButton: {
        borderRadius: RADII.pill,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    mapsButtonText: {
        fontFamily: FONTS.body,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
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

    disabledButton: {

        opacity: 0.6,
    },
    disabledButtonText: {
    },
    disabledButtonHint: {
        fontFamily: FONTS.body,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    newPollContainer: {
        borderRadius: RADII.rounded,
        padding: 10,
        marginBottom: 8,
    },
});

export default EventConfirmedState;