import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';

const { width, height } = Dimensions.get('window');

const PollCreation = ({ onLaunchPoll, pollType, onClose }) => {
    const { colors } = useTheme();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [deadline, setDeadline] = useState('24'); // hours

    console.log('PollCreation: Component rendering with pollType:', pollType);

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

    const handleLaunchPoll = async () => {
        const filledOptions = options.filter(option => option.trim() !== '');

        if (!question.trim()) {
            Alert.alert('Error', 'Please enter a poll question');
            return;
        }

        if (filledOptions.length < 2) {
            Alert.alert('Error', 'Please provide at least 2 options');
            return;
        }

        setIsLoading(true);

        try {
            const deadlineDate = new Date();
            deadlineDate.setHours(deadlineDate.getHours() + parseInt(deadline));

            const pollData = {
                question: question.trim(),
                options: filledOptions.map(option => ({ text: option.trim() })),
                deadline: deadlineDate,
                timeStamp: new Date(),
                allowNewOptions: true,
                type: pollType
            };

            await onLaunchPoll(pollData);
            handleClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to create poll. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getPlaceholder = () => {
        if (pollType === 'activity') {
            return 'What should we do?';
        } else if (pollType === 'place') {
            return 'Where should we go?';
        }
        return 'Enter your question';
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Ionicons
                                name={pollType === 'activity' ? 'game-controller' : 'location'}
                                size={32}
                                color={colors.primary}
                            />
                            <Text style={styles.stepTitle}>
                                What's your {pollType === 'activity' ? 'activity' : 'place'} question?
                            </Text>
                            <Text style={styles.stepSubtitle}>
                                Ask your circle members to vote on the best option
                            </Text>
                        </View>

                        <TextInput
                            style={styles.questionInput}
                            placeholder={getPlaceholder()}
                            placeholderTextColor={colors.textSecondary}
                            value={question}
                            onChangeText={setQuestion}
                            multiline
                            maxLength={200}
                        />

                        <Text style={styles.characterCount}>
                            {question.length}/200 characters
                        </Text>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Ionicons name="list" size={32} color={colors.primary} />
                            <Text style={styles.stepTitle}>Add your options</Text>
                            <Text style={styles.stepSubtitle}>
                                Provide at least 2 options for members to choose from
                            </Text>
                        </View>

                        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                            {options.map((option, index) => (
                                <View key={index} style={styles.optionRow}>
                                    <View style={styles.optionNumber}>
                                        <Text style={styles.optionNumberText}>{index + 1}</Text>
                                    </View>
                                    <TextInput
                                        style={styles.optionInput}
                                        placeholder={`Option ${index + 1}`}
                                        placeholderTextColor={colors.textSecondary}
                                        value={option}
                                        onChangeText={(value) => updateOption(index, value)}
                                        maxLength={100}
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
                                    <Ionicons name="add" size={20} color={colors.primary} />
                                    <Text style={styles.addOptionText}>Add Another Option</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Ionicons name="time" size={32} color={colors.primary} />
                            <Text style={styles.stepTitle}>Set poll duration</Text>
                            <Text style={styles.stepSubtitle}>
                                How long should members have to vote?
                            </Text>
                        </View>

                        <View style={styles.durationOptions}>
                            {['6', '12', '24', '48'].map((hours) => (
                                <TouchableOpacity
                                    key={hours}
                                    style={[
                                        styles.durationOption,
                                        deadline === hours && styles.selectedDuration
                                    ]}
                                    onPress={() => setDeadline(hours)}
                                >
                                    <Text style={[
                                        styles.durationText,
                                        deadline === hours && styles.selectedDurationText
                                    ]}>
                                        {hours}h
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.customDurationContainer}>
                            <Text style={styles.customDurationLabel}>Custom duration (hours):</Text>
                            <TextInput
                                style={styles.customDurationInput}
                                value={deadline}
                                onChangeText={setDeadline}
                                keyboardType="numeric"
                                placeholder="24"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.pollPreview}>
                            <Text style={styles.previewTitle}>Poll Preview</Text>
                            <View style={styles.previewCard}>
                                <Text style={styles.previewQuestion}>{question || 'Your question here'}</Text>
                                <Text style={styles.previewMeta}>
                                    {options.filter(o => o.trim()).length} options • {deadline} hours
                                </Text>
                            </View>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.modal}>
                <View style={[styles.gradientBackground, { backgroundColor: colors.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.title}>
                                Create {pollType === 'activity' ? 'Activity' : 'Place'} Poll
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Simple Content for Testing */}
                    <View style={styles.content}>
                        <Text style={styles.stepTitle}>Poll Creation</Text>
                        <TextInput
                            style={styles.questionInput}
                            placeholder="What should we do?"
                            placeholderTextColor={colors.textSecondary}
                            value={question}
                            onChangeText={setQuestion}
                        />
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => {
                                console.log('Test button pressed');
                                onClose();
                            }}
                        >
                            <Text style={styles.primaryButtonText}>Test Button</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: colors.surface,
    },
    gradientBackground: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    questionInput: {
        backgroundColor: colors.background,
        color: colors.text,
        fontSize: 16,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.background,
    },

});

export default PollCreation;