import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../constants/constants';
import { Ionicons } from '@expo/vector-icons';

const PollCard = () => {
    const [voted, setVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const pollData = {
        creator: 'Maria',
        endsIn: '12 hours',
        question: 'What should we do this Saturday?',
        options: [
            { id: '1', text: 'Dinner', votes: 4, spark: true },
            { id: '2', text: 'Movie Night', votes: 2 },
            { id: '3', text: 'Go for a walk', votes: 1 },
        ],
        totalVotes: 7,
        members: 8,
        pollClosed: false,
    };

    const handleVote = (optionId) => {
        setSelectedOption(optionId);
        setVoted(true);
    };

    const renderActivePollNoVote = () => (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Maria started a poll</Text>
                <Text style={styles.timerText}>🕒 Ends in 12 hours</Text>
            </View>
            <Text style={styles.question}>{pollData.question}</Text>
            <View style={styles.optionsContainer}>
                {pollData.options.map((option) => (
                    <TouchableOpacity key={option.id} style={styles.optionRow} onPress={() => handleVote(option.id)}>
                        <View style={styles.radioButton} />
                        <Text style={styles.optionText}>{option.text} {option.spark && '✨'}</Text>
                        <Text style={styles.voteCount}>{option.votes}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>4 of 8 members have voted</Text>
            </View>
        </View>
    );

    const renderActivePollHasVoted = () => (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Maria started a poll</Text>
                <Text style={styles.timerText}>🕒 Ends in 12 hours</Text>
            </View>
            <Text style={styles.question}>{pollData.question}</Text>
            <View style={styles.optionsContainer}>
                {pollData.options.map((option) => {
                    const isSelected = option.id === selectedOption;
                    return (
                        <View key={option.id} style={styles.optionRow}>
                            <View style={[styles.radioButton, isSelected && styles.radioButtonChecked]}>
                                {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                            </View>
                            <Text style={styles.optionText}>{option.text}</Text>
                            <Text style={styles.voteCount}>{option.votes}</Text>
                        </View>
                    );
                })}
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>You and 4 others have voted</Text>
            </View>
        </View>
    );

    const renderPollClosed = () => {
        const winningOption = pollData.options.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.headerText, { fontWeight: 'bold' }]}>Poll Closed!</Text>
                </View>
                <Text style={styles.question}>{pollData.question}</Text>
                <View style={styles.optionsContainer}>
                    {pollData.options.map((option) => {
                        const isWinner = option.id === winningOption.id;
                        return (
                            <View key={option.id} style={[styles.optionRow, isWinner ? styles.winnerRow : styles.loserRow]}>
                                {isWinner && <Text style={styles.winnerText}>👑 Winner</Text>}
                                <Text style={[styles.optionText, !isWinner && styles.loserText]}>{option.text}</Text>
                                <Text style={[styles.voteCount, !isWinner && styles.loserText]}>{option.votes}</Text>
                            </View>
                        );
                    })}
                </View>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>+ Plan the Venue</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (pollData.pollClosed) {
        return renderPollClosed();
    }

    return voted ? renderActivePollHasVoted() : renderActivePollNoVote();
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.dark,
        borderRadius: RADII.rounded,
        padding: 20,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
    },
    timerText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
    },
    question: {
        color: COLORS.text,
        fontFamily: FONTS.heading,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    optionsContainer: {
        marginBottom: 20,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    optionText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
        flex: 1,
    },
    voteCount: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
    },
    winnerRow: {
        backgroundColor: 'gold',
        borderRadius: RADII.rounded,
    },
    winnerText: {
        color: 'black',
        fontWeight: 'bold',
    },
    loserRow: {
        opacity: 0.5,
    },
    loserText: {
        color: COLORS.gray,
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        borderRadius: RADII.rounded,
        paddingVertical: 15,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontFamily: FONTS.heading,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default PollCard;