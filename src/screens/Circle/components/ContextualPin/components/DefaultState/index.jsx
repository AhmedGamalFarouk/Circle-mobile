import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const DefaultState = ({ onStartPoll }) => {
    return (
        <View style={styles.pollSomethingContainer}>
            <Text style={styles.pollSomethingText}>What's the Plan?</Text>
            <TouchableOpacity style={styles.button} onPress={onStartPoll}>
                <Text style={styles.buttonText}>+ Start a Poll</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    pollSomethingContainer: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.largeRounded,
        borderBottomRightRadius: RADII.largeRounded,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 220,
    },
    pollSomethingText: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 28,
        marginBottom: 25,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        paddingHorizontal: 35,
        borderRadius: RADII.pill,
        //...SHADOWS.btnPrimary,
    },
    buttonText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default DefaultState;