import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const DefaultState = ({ onStartPlan }) => {
    return (
        <View style={styles.planSomethingContainer}>
            <Text style={styles.planSomethingText}>What's the plan?</Text>
            <TouchableOpacity style={styles.button} onPress={onStartPlan}>
                <Text style={styles.buttonText}>+ Start a Plan</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    planSomethingContainer: {
        backgroundColor: COLORS.dark,
        borderBottomLeftRadius: RADII.largeRounded,
        borderBottomRightRadius: RADII.largeRounded,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 220,
    },
    planSomethingText: {
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