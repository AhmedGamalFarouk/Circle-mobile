import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII } from '../../../../constants/constants';

const SimplePollCreation = ({ onLaunchPoll, pollType, onClose }) => {
    const { colors } = useTheme();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [deadline, setDeadline] = useState('24');

    console.log('SimplePollCreation: Rendering with pollType:', pollType);

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
        console.log('SimplePollCreation: handleLaunchPoll called');
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
            timeStamp: new Date(),
            allowNewOptions: true
        };

        console.log('SimplePollCreation: Calling onLaunchPoll with:', pollData);
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

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.modal}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create {pollType === 'activity' ? 'Activity' : 'Place'} Poll</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <TextInput
                        style={styles.questionInput}
                        placeholder={getPlaceholder()}
                        placeholderTextColor={colors.textSecondary}
                        value={question}
                        onChangeText={setQuestion}
                        multiline
                    />

                    <Text style={styles.sectionTitle}>Options:</Text>
                    {options.map((option, index) => (
                        <View key={index} style={styles.optionRow}>
                            <TextInput
                                style={styles.optionInput}
                                placeholder={`Option ${index + 1}`}
                                placeholderTextColor={colors.textSecondary}
                                value={option}
                                onChangeText={(value) => updateOption(index, value)}
                            />
                            {options.length > 2 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeOption(index)}
                                >
                                    <Ionicons name="close" size={20} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {options.length < 6 && (
                        <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                            <Text style={styles.addOptionText}>+ Add Option</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.deadlineContainer}>
                        <Text style={styles.sectionTitle}>Poll Duration (hours):</Text>
                        <TextInput
                            style={styles.deadlineInput}
                            value={deadline}
                            onChangeText={setDeadline}
                            keyboardType="numeric"
                            placeholder="24"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <TouchableOpacity style={styles.launchButton} onPress={handleLaunchPoll}>
                        <Text style={styles.launchButtonText}>Launch Poll</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: colors.surface,
        borderRadius: RADII.large,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    content: {
        maxHeight: 400,
    },
    questionInput: {
        backgroundColor: colors.background,
        color: colors.text,
        fontSize: 16,
        padding: 15,
        borderRadius: RADII.medium,
        marginBottom: 20,
        minHeight: 50,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        color: colors.text,
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
        backgroundColor: colors.background,
        color: colors.text,
        fontSize: 14,
        padding: 12,
        borderRadius: RADII.medium,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    removeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.error + '20',
    },
    addOptionButton: {
        backgroundColor: colors.primary + '20',
        padding: 12,
        borderRadius: RADII.medium,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
    },
    addOptionText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    deadlineContainer: {
        marginBottom: 20,
    },
    deadlineInput: {
        backgroundColor: colors.background,
        color: colors.text,
        fontSize: 16,
        padding: 15,
        borderRadius: RADII.medium,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    launchButton: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: RADII.large,
        alignItems: 'center',
    },
    launchButtonText: {
        color: colors.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SimplePollCreation;