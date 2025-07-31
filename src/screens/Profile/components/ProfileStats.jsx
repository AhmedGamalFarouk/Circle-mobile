import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/constants';

const ProfileStats = ({ connections, circles, location = "Obour, Cairo" }) => {
    return (
        <View style={styles.container}>
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{connections}</Text>
                    <Text style={styles.statLabel}>Connections</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{circles}</Text>
                    <Text style={styles.statLabel}>Circles</Text>
                </View>

            </View>
            <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={18} color={COLORS.text} style={styles.locationIcon} />
                <Text style={styles.locationText}>{location}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 15,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: COLORS.light,
        fontSize: 22,
        fontWeight: 'bold',
    },
    statLabel: {
        color: COLORS.text,
        fontSize: 14,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    locationIcon: {
        marginRight: 8,
    },
    locationText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ProfileStats;