import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, FONTS, RADII } from '../../../constants/constants';

const PollCreation = ({ onLaunchPoll, pollType }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [newOption, setNewOption] = useState('');

    const handleAddOption = () => {
        if (newOption.trim() !== '') {
            setOptions([...options, newOption.trim()]);
            setNewOption('');
        }
    };

    const handleOptionChange = (text, index) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const handleLaunch = () => {
        const pollData = {
            question,
            options: options.filter(opt => opt.trim() !== ''),
        };
        onLaunchPoll(pollData);
    };

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
                    {pollType === 'activity' ? "What should we do?" : "Where should we go?"}
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
                <View style={styles.addOptionContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Add an option"
                        placeholderTextColor={COLORS.text}
                        value={newOption}
                        onChangeText={setNewOption}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddOption}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

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

                <TouchableOpacity style={styles.launchButton} onPress={handleLaunch}>
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
    addOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: RADII.rounded,
        marginLeft: 10,
    },
    addButtonText: {
        color: COLORS.darker,
        fontSize: 22,
        fontFamily: FONTS.body,
        fontWeight: 'bold',
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
});

export default PollCreation;