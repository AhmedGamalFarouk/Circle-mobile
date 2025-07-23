import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const DefaultState = ({ data, onInitiatePlan }) => {
    if (data?.upcomingEvent) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: 'https://img.icons8.com/ios-glyphs/30/ffffff/calendar.png' }} style={styles.icon} />
                <View>
                    <Text style={styles.eventTitle}>{data.upcomingEvent.title}</Text>
                    <Text style={styles.eventTime}>{data.upcomingEvent.time}</Text>
                </View>
                <View style={styles.attendeesContainer}>
                    {data.upcomingEvent.attendees.map((attendee, index) => (
                        <Image key={index} source={{ uri: attendee.profilePic }} style={styles.attendeeImage} />
                    ))}
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity style={styles.planSomethingContainer} onPress={onInitiatePlan}>
            <Image source={{ uri: 'https://img.icons8.com/ios-glyphs/30/ffffff/plus-math.png' }} style={styles.icon} />
            <Text style={styles.planSomethingText}>Ready to plan something fun?</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.rounded,
        borderBottomRightRadius: RADII.rounded,
        padding: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    planSomethingContainer: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.rounded,
        borderBottomRightRadius: RADII.rounded,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 200,
    },
    icon: {
        width: 30,
        height: 30,
        marginRight: 15,
    },
    eventTitle: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    eventTime: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
    },
    attendeesContainer: {
        flexDirection: 'row',
    },
    attendeeImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: -10,
        borderWidth: 2,
        borderColor: COLORS.dark,
    },
    planSomethingText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
        marginTop: 10,
    },
});

export default DefaultState;