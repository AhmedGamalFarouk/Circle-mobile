import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, RADII } from '../../../constants/constants';

const PollCreation = ({ onLaunchPoll, pollType }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [deadline, setDeadline] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleOptionChange = (text, index) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleLaunch = () => {
        const pollData = {
            question,
            options: options.filter(opt => opt.trim() !== '').map(opt => ({ text: opt, votes: 0 })),
            deadline: deadline.toISOString(), // Convert to ISO string for storage
            status: 'active', // Set initial status to active
        };
        onLaunchPoll(pollData);
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || deadline;
        setShowDatePicker(Platform.OS === 'ios');
        setDeadline(currentDate);
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const areAllOptionsFilled = options.every(opt => opt.trim() !== '');
    const isLaunchDisabled = question.trim() === '' || options.filter(opt => opt.trim() !== '').length < 2 || !deadline;

    const addSuggestionAsOption = (suggestion) => {
        setOptions([...options, suggestion]);
    };

    const renderOption = ({ item, index }) => (
        <TextInput
            style={styles.input}
            placeholder={`Option ${index + 1}`}
            placeholderTextColor={COLORS.text}
            value={item}
            onChangeText={(text) => handleOptionChange(text, index)}
        />
    );

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.title}>
                    {pollType === 'activity' ? "Plan an Activity" : "Where should we go?"}
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ask a question..."
                    placeholderTextColor={COLORS.text}
                    value={question}
                    onChangeText={setQuestion}
                />
                <FlatList
                    data={options}
                    renderItem={renderOption}
                    keyExtractor={(item, index) => index.toString()}
                />
                <TouchableOpacity
                    style={[styles.addButton, !areAllOptionsFilled && styles.disabledButton]}
                    onPress={handleAddOption}
                    disabled={!areAllOptionsFilled}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
                    <Text style={styles.datePickerButtonText}>
                        {`Deadline: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={deadline}
                        mode="datetime"
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}

                <View style={styles.aiSuggestions}>
                    <Text style={styles.aiTitle}>AI Suggestions ✨</Text>
                    <View style={styles.suggestionButtons}>
                        <TouchableOpacity style={styles.suggestionButton} onPress={() => addSuggestionAsOption('Go for Dinner')}>
                            <Text style={styles.suggestionText}>Go for Dinner</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.suggestionButton} onPress={() => addSuggestionAsOption('See a Movie')}>
                            <Text style={styles.suggestionText}>See a Movie</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.launchButton, isLaunchDisabled && styles.disabledButton]}
                    onPress={handleLaunch}
                    disabled={isLaunchDisabled}
                >
                    <Text style={styles.launchButtonText}>Launch Poll</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
    },
    modalContent: {
        backgroundColor: COLORS.darker,
        borderRadius: RADII.largeRounded,
        padding: 25,
        width: '90%',
        // ...SHADOWS.glassCard,
    },
    title: {
        fontFamily: FONTS.heading,
        fontSize: 24,
        color: COLORS.light,
        marginBottom: 25,
        textAlign: 'center',
    },
    input: {
        backgroundColor: COLORS.dark,
        color: COLORS.text,
        padding: 18,
        borderRadius: RADII.rounded,
        marginBottom: 12,
        fontFamily: FONTS.body,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: RADII.rounded,
        alignItems: 'center',
        marginBottom: 12,
    },
    addButtonText: {
        color: COLORS.darker,
        fontSize: 22,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
    },
    datePickerButton: {
        backgroundColor: COLORS.dark,
        padding: 18,
        borderRadius: RADII.rounded,
        marginBottom: 25,
        alignItems: 'center',
    },
    datePickerButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 16,
    },
    aiSuggestions: {
        marginBottom: 25,
    },
    aiTitle: {
        fontFamily: FONTS.heading,
        fontSize: 20,
        color: COLORS.light,
        marginBottom: 15,
    },
    suggestionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    suggestionButton: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: RADII.pill,
        margin: 6,
    },
    suggestionText: {
        color: COLORS.light,
        fontFamily: FONTS.body,
    },
    launchButton: {
        backgroundColor: COLORS.accent,
        padding: 18,
        borderRadius: RADII.pill,
        alignItems: 'center',
        //...SHADOWS.btnSecondaryHover,
    },
    launchButtonText: {
        color: COLORS.darker,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
        fontSize: 18,
    },
    disabledButton: {
        backgroundColor: COLORS.dark,
        opacity: 0.5,
    },
});

export default PollCreation;