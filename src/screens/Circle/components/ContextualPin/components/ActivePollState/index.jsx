import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const ActivePollState = ({ pollData, onFinishVoting, onVote }) => {

    if (!pollData) {
        return null;
    }

    const getVoteCount = (option) => {
        if (!pollData.votes) return 0;
        return Object.values(pollData.votes).filter(vote => vote === option).length;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.pollQuestion}>{pollData.question}</Text>
            {pollData.options.map((option, index) => (
                <TouchableOpacity key={index} style={styles.optionContainer} onPress={() => onVote(option)}>
                    <Text style={styles.optionText}>{option}</Text>
                    <Text style={styles.voteCount}>{getVoteCount(option)}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.finishButton} onPress={onFinishVoting}>
                <Text style={styles.finishButtonText}>Finish Voting</Text>
            </TouchableOpacity>
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
    pollQuestion: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 22,
        marginBottom: 20,
        textAlign: 'center',
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.darker,
        padding: 18,
        borderRadius: RADII.rounded,
        marginBottom: 12,
    },
    optionText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
    },
    voteCount: {
        color: COLORS.primary,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
        fontSize: 16,
    },
    finishButton: {
        backgroundColor: COLORS.accent,
        padding: 18,
        borderRadius: RADII.pill,
        alignItems: 'center',
        marginTop: 25,
        //...SHADOWS.btnSecondaryHover,
    },
    finishButtonText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default ActivePollState;