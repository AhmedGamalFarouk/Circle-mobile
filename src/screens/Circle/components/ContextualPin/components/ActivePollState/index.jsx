import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const ActivePollState = ({ pollData, onFinishVoting, onVote }) => {

    const [remainingTime, setRemainingTime] = useState('');

    useEffect(() => {
        if (!pollData || !pollData.deadline) {
            setRemainingTime('No deadline');
            return;
        }

        const calculateRemainingTime = () => {
            const deadlineDate = pollData.deadline.toDate(); // Convert Firebase Timestamp to Date
            const now = new Date();
            const diff = deadlineDate.getTime() - now.getTime();

            if (diff <= 0) {
                setRemainingTime('Poll ended');
                // Optionally, trigger a refresh or state change to reflect poll closure
                return;
            }

            const seconds = Math.floor((diff / 1000) % 60);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            if (hours > 0 || days > 0) timeString += `${hours}h `;
            if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
            timeString += `${seconds}s`;

            setRemainingTime(timeString.trim());
        };

        calculateRemainingTime(); // Initial calculation
        const timer = setInterval(calculateRemainingTime, 1000); // Update every second

        return () => clearInterval(timer); // Cleanup on unmount
    }, [pollData]);

    if (!pollData) {
        return null;
    }

    const getVoteCount = (optionText) => {
        if (!pollData.votes) return 0;
        return Object.values(pollData.votes).filter(vote => vote === optionText).length;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.pollQuestion}>{pollData.question}</Text>
            <Text style={styles.deadlineText}>Ends in: {remainingTime}</Text>
            {pollData.options.map((option, index) => (
                <TouchableOpacity key={index} style={styles.optionContainer} onPress={() => onVote(option.text)}>
                    <Text style={styles.optionText}>{option.text}</Text>
                    <Text style={styles.voteCount}>{getVoteCount(option.text)}</Text>
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
    deadlineText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
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