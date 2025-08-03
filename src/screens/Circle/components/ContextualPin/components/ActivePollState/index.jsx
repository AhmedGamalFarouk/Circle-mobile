import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../../../constants/constants';

const ActivePollState = ({ pollData, onFinishVoting, onVote, onAddOption }) => {

    const [remainingTime, setRemainingTime] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [showAddOption, setShowAddOption] = useState(false);
    const [newOptionText, setNewOptionText] = useState('');

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
                setIsExpired(true);
                // Optionally, trigger a refresh or state change to reflect poll closure
                return;
            } else {
                setIsExpired(false);
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

    const handleAddOption = () => {
        if (!newOptionText.trim()) {
            Alert.alert('Error', 'Please enter an option');
            return;
        }

        if (isExpired) {
            Alert.alert('Error', 'Cannot add options after the poll deadline');
            return;
        }

        // Check if option already exists
        const optionExists = pollData.options.some(option =>
            option.text.toLowerCase() === newOptionText.trim().toLowerCase()
        );

        if (optionExists) {
            Alert.alert('Error', 'This option already exists');
            return;
        }

        onAddOption(newOptionText.trim());
        setNewOptionText('');
        setShowAddOption(false);
    };

    const canAddOptions = pollData.allowNewOptions && !isExpired;

    return (
        <View style={styles.container}>
            <Text style={styles.pollQuestion}>{pollData.question}</Text>
            <Text style={[styles.deadlineText, isExpired && styles.expiredText]}>
                Ends in: {remainingTime}
            </Text>
            {pollData.options.map((option, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.optionContainer, isExpired && styles.disabledOption]}
                    onPress={() => !isExpired && onVote(option.text)}
                    disabled={isExpired}
                >
                    <Text style={[styles.optionText, isExpired && styles.disabledText]}>{option.text}</Text>
                    <Text style={styles.voteCount}>{getVoteCount(option.text)}</Text>
                </TouchableOpacity>
            ))}

            {canAddOptions && (
                <>
                    {showAddOption ? (
                        <View style={styles.addOptionContainer}>
                            <TextInput
                                style={styles.addOptionInput}
                                placeholder="Enter new option..."
                                placeholderTextColor={COLORS.text}
                                value={newOptionText}
                                onChangeText={setNewOptionText}
                                maxLength={50}
                            />
                            <View style={styles.addOptionButtons}>
                                <TouchableOpacity style={styles.addOptionConfirm} onPress={handleAddOption}>
                                    <Text style={styles.addOptionConfirmText}>Add</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.addOptionCancel}
                                    onPress={() => {
                                        setShowAddOption(false);
                                        setNewOptionText('');
                                    }}
                                >
                                    <Text style={styles.addOptionCancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addOptionButton}
                            onPress={() => setShowAddOption(true)}
                        >
                            <Text style={styles.addOptionButtonText}>+ Add Option</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}

            <TouchableOpacity
                style={[styles.finishButton, isExpired && styles.disabledButton]}
                onPress={onFinishVoting}
                disabled={isExpired}
            >
                <Text style={[styles.finishButtonText, isExpired && styles.disabledText]}>
                    {isExpired ? 'Poll Ended' : 'Finish Voting'}
                </Text>
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
    expiredText: {
        color: COLORS.accent,
        fontWeight: 'bold',
    },
    disabledOption: {
        opacity: 0.6,
    },
    disabledButton: {
        backgroundColor: COLORS.darker,
        opacity: 0.6,
    },
    disabledText: {
        color: COLORS.text,
        opacity: 0.6,
    },
    addOptionButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: RADII.rounded,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    addOptionButtonText: {
        color: COLORS.light,
        fontFamily: FONTS.body,
        fontSize: 14,
        fontWeight: 'bold',
    },
    addOptionContainer: {
        backgroundColor: COLORS.darker,
        padding: 15,
        borderRadius: RADII.rounded,
        marginBottom: 15,
    },
    addOptionInput: {
        backgroundColor: COLORS.dark,
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
        padding: 12,
        borderRadius: RADII.rounded,
        marginBottom: 10,
    },
    addOptionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    addOptionConfirm: {
        backgroundColor: COLORS.accent,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: RADII.rounded,
        flex: 0.45,
        alignItems: 'center',
    },
    addOptionConfirmText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
        fontSize: 14,
    },
    addOptionCancel: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: RADII.rounded,
        borderWidth: 1,
        borderColor: COLORS.text,
        flex: 0.45,
        alignItems: 'center',
    },
    addOptionCancelText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
    },
});

export default ActivePollState;