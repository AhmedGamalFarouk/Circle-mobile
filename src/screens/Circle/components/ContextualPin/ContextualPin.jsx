import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    Pressable,
    Animated,
    Text,
    LayoutAnimation,
    UIManager,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';
import DefaultState from './components/DefaultState';
import ActivePollState from './components/ActivePollState';
import PollClosedState from './components/PollClosedState';
import AdminConfirmationState from './components/AdminConfirmationState';
import EventConfirmedState from './components/EventConfirmedState';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const HEADER_HEIGHT = 50; // Based on paddingVertical: 10, height of elements, and borderBottomWidth in CircleHeader.jsx
const MINIMIZED_BUTTON_TOP_OFFSET = 65; // Positioned at the bottom of the header

const ContextualPin = ({
    currentStage,
    onStartPoll,
    activityPollData,
    placePollData,
    onFinishVoting,
    onVote,
    onAddOption,
    eventData,
    pollData,
    onRsvp,
    onStartNewPoll,
    onDismiss,
    onPollNextStep
}) => {
    const { colors } = useTheme();
    const [isMinimized, setIsMinimized] = useState(false);
    const [slideAnim] = useState(new Animated.Value(-height));

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: isMinimized ? -height : 0,
            tension: 100,
            friction: 15,
            useNativeDriver: true,
        }).start();
    }, [isMinimized]);

    const handleToggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const getStageInfo = () => {
        switch (currentStage) {
            case 'Idle':
                return {
                    title: 'Ready to Plan?',
                    subtitle: 'Start organizing your next event',
                    icon: 'calendar-outline',
                    color: colors.primary
                };
            case 'Planning the Activity':
                return {
                    title: 'Activity Poll Active',
                    subtitle: 'Vote for what you want to do',
                    icon: 'game-controller',
                    color: colors.success
                };
            case 'Activity Poll Closed':
                return {
                    title: 'Activity Decided!',
                    subtitle: 'Now let\'s pick a place',
                    icon: 'checkmark-circle',
                    color: colors.success
                };
            case 'Planning the Place':
                return {
                    title: 'Place Poll Active',
                    subtitle: 'Vote for where to meet',
                    icon: 'location',
                    color: colors.warning
                };
            case 'Place Poll Closed':
                return {
                    title: 'Place Decided!',
                    subtitle: 'Ready to finalize the event',
                    icon: 'checkmark-circle',
                    color: colors.success
                };
            case 'Pending Confirmation':
                return {
                    title: 'Awaiting Confirmation',
                    subtitle: 'Admin is reviewing the results',
                    icon: 'hourglass-outline',
                    color: colors.warning
                };
            case 'Awaiting Admin Confirmation':
                return {
                    title: 'Awaiting Confirmation',
                    subtitle: 'Admin is reviewing the results',
                    icon: 'hourglass-outline',
                    color: colors.warning
                };
            case 'Event Confirmed':
                return {
                    title: 'Event Confirmed!',
                    subtitle: 'RSVP and see who\'s coming',
                    icon: 'calendar',
                    color: colors.primary
                };
            default:
                return {
                    title: 'Event Planning',
                    subtitle: 'Organize your circle events',
                    icon: 'calendar-outline',
                    color: colors.primary
                };
        }
    };

    const renderContent = () => {
        switch (currentStage) {
            case 'Idle':
                return <DefaultState onStartPoll={onStartPoll} />;
            case 'Planning the Activity':
                return (
                    <ActivePollState
                        pollData={activityPollData}
                        onFinishVoting={onFinishVoting}
                        onVote={onVote}
                        onAddOption={(option) => onAddOption(option, 'activity')}
                        pollType="activity"
                    />
                );
            case 'Activity Poll Closed':
                return (
                    <PollClosedState
                        data={{
                            winningOption: { text: eventData?.winningActivity },
                            nextStep: 'poll_venue',
                            type: 'activity'
                        }}
                        onPollNextStep={onPollNextStep}
                    />
                );
            case 'Planning the Place':
                return (
                    <ActivePollState
                        pollData={placePollData}
                        onFinishVoting={onFinishVoting}
                        onVote={onVote}
                        onAddOption={(option) => onAddOption(option, 'place')}
                        pollType="place"
                    />
                );
            case 'Place Poll Closed':
                return (
                    <PollClosedState
                        data={{
                            winningOption: { text: eventData?.winningPlace },
                            nextStep: 'admin_confirmation',
                            type: 'place'
                        }}
                        onPollNextStep={onPollNextStep}
                    />
                );
            case 'Pending Confirmation':
                return (
                    <AdminConfirmationState
                        eventData={{
                            ...eventData,
                            winningActivity: pollData?.winningActivity,
                            winningPlace: pollData?.winningPlace
                        }}
                    />
                );
            case 'Awaiting Admin Confirmation':
                return (
                    <AdminConfirmationState
                        eventData={{
                            ...eventData,
                            winningActivity: pollData?.winningActivity,
                            winningPlace: pollData?.winningPlace
                        }}
                    />
                );
            case 'Event Confirmed':
                return (
                    <EventConfirmedState
                        eventData={eventData}
                        onRsvp={onRsvp}
                        onStartNewPoll={onStartNewPoll}
                    />
                );
            default:
                return <DefaultState onStartPoll={onStartPoll} />;
        }
    };

    const stageInfo = getStageInfo();
    const styles = getStyles(colors, isMinimized, HEADER_HEIGHT, MINIMIZED_BUTTON_TOP_OFFSET);

    return (
        <>
            <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
                <View style={[styles.gradientBackground, { backgroundColor: colors.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={[styles.stageIcon, { backgroundColor: stageInfo.color + '20' }]}>
                                <Ionicons name={stageInfo.icon} size={24} color={stageInfo.color} />
                            </View>
                            <View style={styles.stageInfo}>
                                <Text style={styles.stageTitle}>{stageInfo.title}</Text>
                                <Text style={styles.stageSubtitle}>{stageInfo.subtitle}</Text>
                            </View>
                        </View>
                        <Pressable style={styles.dismissButton} onPress={handleToggleMinimize}>
                            <Ionicons name="chevron-up" size={24} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    {/* Progress Indicator and Content */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: getProgressWidth(currentStage),
                                        backgroundColor: stageInfo.color,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{getProgressText(currentStage)}</Text>
                    </View>
                    <View style={styles.content}>{renderContent()}</View>
                </View>
            </Animated.View>
            <Pressable style={styles.minimizedButton} onPress={handleToggleMinimize}>
                <Ionicons name="chevron-down" size={28} color={colors.primary} />
            </Pressable>
        </>
    );
};

const getProgressWidth = (stage) => {
    switch (stage) {
        case 'Idle': return '0%';
        case 'Planning the Activity': return '16%';
        case 'Activity Poll Closed': return '33%';
        case 'Planning the Place': return '50%';
        case 'Place Poll Closed': return '66%';
        case 'Pending Confirmation':
        case 'Awaiting Admin Confirmation': return '83%';
        case 'Event Confirmed': return '100%';
        default: return '0%';
    }
};

const getProgressText = (stage) => {
    switch (stage) {
        case 'Idle': return 'Ready to start';
        case 'Planning the Activity': return 'Step 1 of 4';
        case 'Activity Poll Closed': return 'Step 2 of 4';
        case 'Planning the Place': return 'Step 3 of 4';
        case 'Place Poll Closed': return 'Step 4 of 4';
        case 'Pending Confirmation':
        case 'Awaiting Admin Confirmation': return 'Pending approval';
        case 'Event Confirmed': return 'Complete!';
        default: return '';
    }
};

const getStyles = (colors, isMinimized, HEADER_HEIGHT, MINIMIZED_BUTTON_TOP_OFFSET) => StyleSheet.create({
    container: {
        position: 'absolute',
        top: HEADER_HEIGHT, // Starts at the bottom of the header
        left: 0,
        right: 0,
        zIndex: 10,
        marginHorizontal: 16,
        marginTop: 16, // Keep the original margin for the pin itself
        borderRadius: RADII.large,
        ...SHADOWS.large,
        overflow: 'hidden',
    },
    minimizedButton: {
        position: 'absolute',
        top: MINIMIZED_BUTTON_TOP_OFFSET, // Positioned at the bottom of the header
        left: '50%',
        transform: [{ translateX: -25 }],
        width: 50,
        height: 40,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        zIndex: 5,
    },
    gradientBackground: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    stageIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stageInfo: {
        flex: 1,
    },
    stageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    stageSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    dismissButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.surface + '80',
    },
    progressContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
});

export default ContextualPin;