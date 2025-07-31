import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const PollClosedState = ({ data, onPollNextStep }) => {
    const { winningOption, nextStep } = data;

    const getButtonText = () => {
        if (nextStep === 'poll_venue') {
            return 'Poll the Venue';
        }
        return 'Finalize Event & Get RSVPs';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Poll Closed! The winner is...</Text>
            <View style={styles.winnerContainer}>
                <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/crown.png' }} style={styles.crown} />
                <Text style={styles.winningOption}>{winningOption.text}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={onPollNextStep}>
                <Text style={styles.buttonText}>{getButtonText()}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.rounded,
        borderBottomRightRadius: RADII.rounded,
        padding: 20,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 20,
        marginBottom: 20,
    },
    winnerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    crown: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    winningOption: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 24,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: RADII.rounded,
    },
    buttonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
});

export default PollClosedState;