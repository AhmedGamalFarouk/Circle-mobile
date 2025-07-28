import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../../firebase/config';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUser(userSnap.data());
            }
        };
        fetchUser();
    }, [userId]);

    if (!user) return null;

    return (
        <View style={styles.rsvpUser}>
            <Image source={{ uri: user.avatar }} style={styles.profilePic} />
            <Text style={styles.userName}>{user.name}</Text>
        </View>
    );
};


const EventConfirmedState = ({ eventData, onRsvp }) => {
    const { winningActivity, winningPlace, rsvps, currentUser } = eventData;

    const renderRsvpList = (status) => {
        if (!rsvps) return null;
        return Object.entries(rsvps)
            .filter(([_, rsvpStatus]) => rsvpStatus === status)
            .map(([userId]) => <UserProfile key={userId} userId={userId} />);
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