import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../../../constants/constants';

const { width } = Dimensions.get('window');

const ActivePollState = ({ pollData, onFinishVoting, onVote, onAddOption, pollType = 'activity' }) => {
    const { colors } = useTheme();
    const [remainingTime, setRemainingTime] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [showAddOption, setShowAddOption] = useState(false);
    const [newOptionText, setNewOptionText] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [voteAnimations] = useState({});
    const [progressAnimations] = useState({});

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
                if (!isExpired) {
                    setIsExpired(true);
                    // Automatically trigger poll closure when deadline is reached
                    setTimeout(() => {
                        onFinishVoting();
                    }, 1000); // Small delay to show "Poll ended" message
                }
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
    }, [pollData, isExpired, onFinishVoting]);

    if (!pollData) {
        return null;
    }

    const getVoteCount = (optionText) => {
        if (!pollData.votes) return 0;
        return Object.values(pollData.votes).filter(vote => vote === optionText).length;
    };

    const getTotalVotes = () => {
        if (!pollData.votes) return 0;
        return Object.keys(pollData.votes).length;
    };

    const getVotePercentage = (optionText) => {
        const totalVotes = getTotalVotes();
        if (totalVotes === 0) return 0;
        return (getVoteCount(optionText) / totalVotes) * 100;
    };

    const handleVote = (optionText) => {
        if (isExpired) return;

        setSelectedOption(optionText);

        // Animate vote button
        if (!voteAnimations[optionText]) {
            voteAnimations[optionText] = new Animated.Value(1);
        }

        Animated.sequence([
            Animated.timing(voteAnimations[optionText], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(voteAnimations[optionText], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        onVote(optionText);
    };

    // Initialize progress animations
    useEffect(() => {
        if (pollData?.options) {
            pollData.options.forEach((option, index) => {
                if (!progressAnimations[option.text]) {
                    progressAnimations[option.text] = new Animated.Value(0);
                }

                const percentage = getVotePercentage(option.text);
                Animated.timing(progressAnimations[option.text], {
                    toValue: percentage,
                    duration: 500,
                    delay: index * 100,
                    useNativeDriver: false,
                }).start();
            });
        }
    }, [pollData?.votes]);

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
    const totalVotes = getTotalVotes();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            {/* Poll Header */}
            <View style={styles.header}>
                <View style={styles.pollTypeIcon}>
                    <Ionicons
                        name={pollType === 'activity' ? 'game-controller' : 'location'}
                        size={20}
                        color={colors.primary}
                    />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.pollQuestion} numberOfLines={2}>
                        {pollData.question}
                    </Text>
                    <View style={styles.pollMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="time" size={16} color={isExpired ? colors.error : colors.success} />
                            <Text style={[styles.deadlineText, isExpired && styles.expiredText]}>
                                {remainingTime}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="people" size={16} color={colors.textSecondary} />
                            <Text style={styles.voteCountText}>
                                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {pollData.options.map((option, index) => {
                    const voteCount = getVoteCount(option.text);
                    const percentage = getVotePercentage(option.text);
                    const isSelected = selectedOption === option.text;

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.optionWrapper,
                                voteAnimations[option.text] && {
                                    transform: [{ scale: voteAnimations[option.text] || 1 }]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.optionContainer,
                                    isExpired && styles.disabledOption,
                                    isSelected && styles.selectedOption
                                ]}
                                onPress={() => handleVote(option.text)}
                                disabled={isExpired}
                            >
                                {/* Progress Bar Background */}
                                <Animated.View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: progressAnimations[option.text]?.interpolate({
                                                inputRange: [0, 100],
                                                outputRange: ['0%', '100%'],
                                                extrapolate: 'clamp',
                                            }) || '0%',
                                        }
                                    ]}
                                />

                                {/* Option Content */}
                                <View style={styles.optionContent}>
                                    <View style={styles.optionLeft}>
                                        <Text style={[
                                            styles.optionText,
                                            isExpired && styles.disabledText,
                                            isSelected && styles.selectedOptionText,
                                            { color: colors.text }
                                        ]}>
                                            {option.text}
                                        </Text>
                                        {totalVotes > 0 && (
                                            <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
                                                {Math.round(percentage)}%
                                            </Text>
                                        )}
                                    </View>

                                    <View style={styles.optionRight}>
                                        <View style={[
                                            styles.voteCountBadge,
                                            voteCount > 0 && styles.activeVoteCountBadge
                                        ]}>
                                            <Text style={[
                                                styles.voteCount,
                                                voteCount > 0 && styles.activeVoteCount
                                            ]}>
                                                {voteCount}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={24}
                                                color={colors.success}
                                            />
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>

            {/* Add Option */}
            {canAddOptions && (
                <View style={styles.addOptionSection}>
                    {showAddOption ? (
                        <View style={styles.addOptionContainer}>
                            <TextInput
                                style={styles.addOptionInput}
                                placeholder={`Add ${pollType} option...`}
                                placeholderTextColor={colors.textSecondary}
                                value={newOptionText}
                                onChangeText={setNewOptionText}
                                maxLength={50}
                                autoFocus
                            />
                            <View style={styles.addOptionButtons}>
                                <TouchableOpacity
                                    style={styles.addOptionConfirm}
                                    onPress={handleAddOption}
                                >
                                    <Ionicons name="checkmark" size={20} color={colors.background} />
                                    <Text style={styles.addOptionConfirmText}>Add</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.addOptionCancel}
                                    onPress={() => {
                                        setShowAddOption(false);
                                        setNewOptionText('');
                                    }}
                                >
                                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addOptionButton}
                            onPress={() => setShowAddOption(true)}
                        >
                            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                            <Text style={styles.addOptionButtonText}>Add Option</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
                style={[styles.finishButton, isExpired && styles.disabledButton]}
                onPress={onFinishVoting}
                disabled={isExpired}
            >
                <View
                    style={[styles.finishButtonGradient, { backgroundColor: isExpired ? colors.surface : colors.success }]}
                >
                    <Ionicons
                        name={isExpired ? "time" : "checkmark-circle"}
                        size={20}
                        color={isExpired ? colors.textSecondary : colors.background}
                    />
                    <Text style={[styles.finishButtonText, isExpired && styles.disabledText]}>
                        {isExpired ? 'Poll Ended' : 'Close Poll'}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        paddingBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    pollTypeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    pollQuestion: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        lineHeight: 26,
    },
    pollMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    deadlineText: {
        fontSize: 14,
        color: colors.success,
        fontWeight: '600',
    },
    expiredText: {
        color: colors.error,
    },
    voteCountText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    optionsContainer: {
        marginBottom: 20,
        gap: 12,
    },
    optionWrapper: {
        borderRadius: RADII.medium,
        overflow: 'hidden',
    },
    optionContainer: {
        backgroundColor: colors.surface,
        borderRadius: RADII.medium,
        borderWidth: 2,
        borderColor: colors.border,
        overflow: 'hidden',
        position: 'relative',
    },
    selectedOption: {
        borderColor: colors.success,
        backgroundColor: colors.success + '10',
    },
    disabledOption: {
        opacity: 0.6,
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.primary + '20',
        zIndex: 1,
    },
    optionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        zIndex: 2,
    },
    optionLeft: {
        flex: 1,
        marginRight: 12,
    },
    optionText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
        marginBottom: 2,
    },
    selectedOptionText: {
        color: colors.success,
        fontWeight: '600',
    },
    percentageText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    disabledText: {
        opacity: 0.6,
    },
    optionRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    voteCountBadge: {
        minWidth: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeVoteCountBadge: {
        backgroundColor: colors.primary,
    },
    voteCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    activeVoteCount: {
        color: colors.background,
    },
    addOptionSection: {
        marginBottom: 20,
    },
    addOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: RADII.medium,
        padding: 16,
        gap: 8,
    },
    addOptionButtonText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },
    addOptionContainer: {
        backgroundColor: colors.surface,
        borderRadius: RADII.medium,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.border,
    },
    addOptionInput: {
        backgroundColor: colors.background,
        color: colors.text,
        fontSize: 16,
        padding: 12,
        borderRadius: RADII.small,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    addOptionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    addOptionConfirm: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: RADII.small,
        gap: 8,
    },
    addOptionConfirmText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '600',
    },
    addOptionCancel: {
        padding: 12,
        borderRadius: RADII.small,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    finishButton: {
        borderRadius: RADII.medium,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    finishButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    finishButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.background,
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default ActivePollState;