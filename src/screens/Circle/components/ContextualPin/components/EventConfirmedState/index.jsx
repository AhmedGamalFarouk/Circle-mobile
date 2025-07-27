import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const EventConfirmedState = ({ eventData, onRsvp }) => {
    const { winningActivity, winningPlace, rsvps, currentUser } = eventData;

    const renderRsvpList = (status) => {
        return event.rsvps
            .filter(rsvp => rsvp.status === status)
            .map(rsvp => (
                <View key={rsvp.user.id} style={styles.rsvpUser}>
                    <Image source={{ uri: rsvp.user.profilePic }} style={styles.profilePic} />
                    <Text style={styles.userName}>{rsvp.user.name}</Text>
                </View>
            ));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.eventTitle}>EVENT CONFIRMED</Text>
            <Text style={styles.eventDetails}>{winningActivity} at {winningPlace}</Text>
            <View style={styles.rsvpButtons}>
                <TouchableOpacity
                    style={[styles.button, currentUser.rsvp === 'going' && styles.selectedButton]}
                    onPress={() => onRsvp('going')}
                >
                    <Text style={styles.buttonText}>Going</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, currentUser.rsvp === 'maybe' && styles.selectedButton]}
                    onPress={() => onRsvp('maybe')}
                >
                    <Text style={styles.buttonText}>Maybe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, currentUser.rsvp === 'not_going' && styles.selectedButton]}
                    onPress={() => onRsvp('not_going')}
                >
                    <Text style={styles.buttonText}>Not Going</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.rsvpSection}>
                <Text style={styles.sectionTitle}>Going</Text>
                {renderRsvpList('going')}
            </View>
            <View style={styles.rsvpSection}>
                <Text style={styles.sectionTitle}>Maybe</Text>
                {renderRsvpList('maybe')}
            </View>
            <View style={styles.rsvpSection}>
                <Text style={styles.sectionTitle}>Not Going</Text>
                {renderRsvpList('not_going')}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.largeRounded,
        borderBottomRightRadius: RADII.largeRounded,
        padding: 25,
        width: '100%',
    },
    eventTitle: {
        color: COLORS.accent,
        fontFamily: FONTS.heading,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 8,
    },
    eventDetails: {
        color: COLORS.light,
        fontFamily: FONTS.body,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 25,
    },
    rsvpButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 25,
    },
    button: {
        backgroundColor: COLORS.darker,
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: RADII.pill,
    },
    selectedButton: {
        backgroundColor: COLORS.primary,
        // ...SHADOWS.btnPrimary,
    },
    buttonText: {
        color: COLORS.light,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
        fontSize: 14,
    },
    rsvpSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 18,
        marginBottom: 12,
    },
    rsvpUser: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    profilePic: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginRight: 12,
    },
    userName: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 15,
    },
});

export default EventConfirmedState;