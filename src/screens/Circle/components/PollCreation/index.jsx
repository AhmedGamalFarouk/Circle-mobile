import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../../constants/constants';

const PollCreation = ({ onLaunchPoll, pollType }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [deadline, setDeadline] = useState('24'); // hours

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleLaunchPoll = () => {
        const filledOptions = options.filter(option => option.trim() !== '');

        if (!question.trim()) {
            Alert.alert('Error', 'Please enter a poll question');
            return;
        }

        if (filledOptions.length < 2) {
            Alert.alert('Error', 'Please provide at least 2 options');
            return;
        }

        const deadlineDate = new Date();
        deadlineDate.setHours(deadlineDate.getHours() + parseInt(deadline));

        const pollData = {
            question: question.trim(),
            options: filledOptions.map(option => ({ text: option.trim() })),
            deadline: deadlineDate,
            createdAt: new Date(),
            allowNewOptions: true // Enable adding new options after creation
        };

        onLaunchPoll(pollData);
    };

    const getPlaceholder = () => {
        if (pollType === 'activity') {
            return 'What should we do?';
        } else if (pollType === 'place') {
            return 'Where should we go?';
        }
        return 'Enter your question';
    };

    return (
        <View style={styles.container}>
            <View style={styles.modal}>
                <Text style={styles.title}>Create {pollType === 'activity' ? 'Activity' : 'Place'} Poll</Text>

                <TextInput
                    style={styles.questionInput}
                    placeholder={getPlaceholder()}
                    placeholderTextColor={COLORS.text}
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                />

                <ScrollView style={styles.optionsContainer}>
                    <Text style={styles.sectionTitle}>Options:</Text>
                    {options.map((option, index) => (
                        <View key={index} style={styles.optionRow}>
                            <TextInput
                                style={styles.optionInput}
                                placeholder={`Option ${index + 1}`}
                                placeholderTextColor={COLORS.text}
                                value={option}
                                onChangeText={(value) => updateOption(index, value)}
                            />
                            {options.length > 2 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeOption(index)}
                                >
                                    <Text style={styles.removeButtonText}>×</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {options.length < 6 && (
                        <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                            <Text style={styles.addOptionText}>+ Add Option</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                <View style={styles.deadlineContainer}>
                    <Text style={styles.sectionTitle}>Poll Duration (hours):</Text>
                    <TextInput
                        style={styles.deadlineInput}
                        value={deadline}
                        onChangeText={setDeadline}
                        keyboardType="numeric"
                        placeholder="24"
                        placeholderTextColor={COLORS.text}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.launchButton} onPress={handleLaunchPoll}>
                        <Text style={styles.launchButtonText}>Launch Poll</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: COLORS.dark,
        borderRadius: RADII.rounded,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    title: {
        color: COLORS.light,
        fontFamily: FONTS.heading,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    questionInput: {
        backgroundColor: COLORS.darker,
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
        padding: 15,
        borderRadius: RADII.rounded,
        marginBottom: 20,
        minHeight: 50,
    },
    optionsContainer: {
        maxHeight: 200,
        marginBottom: 20,
    },
    sectionTitle: {
        color: COLORS.light,
        fontFamily: FONTS.body,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    optionInput: {
        flex: 1,
        backgroundColor: COLORS.darker,
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 14,
        padding: 12,
        borderRadius: RADII.rounded,
        marginRight: 10,
    },
    removeButton: {
        backgroundColor: COLORS.accent,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: COLORS.darker,
        fontSize: 18,
        fontWeight: 'bold',
    },
    addOptionButton: {
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: RADII.rounded,
        alignItems: 'center',
        marginTop: 10,
    },
    addOptionText: {
        color: COLORS.light,
        fontFamily: FONTS.body,
        fontSize: 14,
        fontWeight: 'bold',
    },
    deadlineContainer: {
        marginBottom: 20,
    },
    deadlineInput: {
        backgroundColor: COLORS.darker,
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
        padding: 15,
        borderRadius: RADII.rounded,
        textAlign: 'center',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    launchButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: RADII.pill,
        alignItems: 'center',
    },
    launchButtonText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PollCreation;