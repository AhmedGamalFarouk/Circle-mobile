import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const EventConfirmedState = ({ data, onRsvp }) => {
    const { event, currentUser } = data;

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
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDetails}>{event.location} • {event.dateTime}</Text>
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
        borderBottomLeftRadius: RADII.rounded,
        borderBottomRightRadius: RADII.rounded,
        padding: 20,
        width: '100%',
    },
    eventTitle: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 5,
    },
    eventDetails: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    rsvpButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    button: {
        backgroundColor: COLORS.lightGrey,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: RADII.rounded,
    },
    selectedButton: {
        backgroundColor: COLORS.primary,
    },
    buttonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: 14,
    },
    rsvpSection: {
        marginBottom: 15,
    },
    sectionTitle: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 16,
        marginBottom: 10,
    },
    rsvpUser: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    profilePic: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    userName: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
    },
});

export default EventConfirmedState;