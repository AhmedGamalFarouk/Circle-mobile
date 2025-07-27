import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import CircleHeader from './components/CircleHeader';
import ContextualPin from './components/ContextualPin/ContextualPin';
import ChatFeed from './components/ChatFeed';
import ChatInputBar from './components/ChatInputBar';
import { COLORS } from '../../constants/constants';
import PollCreation from './components/PollCreation';

const PLANNING_STAGES = {
    IDLE: 'Idle',
    PLANNING_ACTIVITY: 'Planning the Activity',
    PLANNING_PLACE: 'Planning the Place',
    EVENT_CONFIRMED: 'Event Confirmed',
};

const CircleScreen = () => {
    const [currentStage, setCurrentStage] = useState(PLANNING_STAGES.IDLE);
    const [isPollModalVisible, setPollModalVisible] = useState(false);
    const [pollType, setPollType] = useState(null);
    const [activityPollData, setActivityPollData] = useState(null);
    const [placePollData, setPlacePollData] = useState(null);
    const [winningActivity, setWinningActivity] = useState(null);
    const [winningPlace, setWinningPlace] = useState(null);

    const handleStartPlan = () => {
        setPollType('activity');
        setPollModalVisible(true);
    };

    const handleLaunchPoll = (pollData) => {
        setPollModalVisible(false);
        if (pollType === 'activity') {
            setActivityPollData({ ...pollData, votes: {} });
            setCurrentStage(PLANNING_STAGES.PLANNING_ACTIVITY);
        } else if (pollType === 'place') {
            setPlacePollData({ ...pollData, votes: {} });
            setCurrentStage(PLANNING_STAGES.PLANNING_PLACE);
        }
    };

    const handleVote = (option) => {
        if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
            setActivityPollData(prevData => ({
                ...prevData,
                votes: {
                    ...prevData.votes,
                    [option]: (prevData.votes[option] || 0) + 1,
                },
            }));
        } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
            setPlacePollData(prevData => ({
                ...prevData,
                votes: {
                    ...prevData.votes,
                    [option]: (prevData.votes[option] || 0) + 1,
                },
            }));
        }
    };

    const handleFinishVoting = () => {
        if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
            const winningOption = Object.keys(activityPollData.votes).reduce((a, b) => activityPollData.votes[a] > activityPollData.votes[b] ? a : b);
            setWinningActivity(winningOption);
            setCurrentStage(PLANNING_STAGES.PLANNING_PLACE);
            setPollType('place');
            setPollModalVisible(true);
        } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
            const winningOption = Object.keys(placePollData.votes).reduce((a, b) => placePollData.votes[a] > placePollData.votes[b] ? a : b);
            setWinningPlace(winningOption);
            setCurrentStage(PLANNING_STAGES.EVENT_CONFIRMED);
        }
    };

    return (
        <View style={styles.container}>
            <CircleHeader />
            <ContextualPin
                currentStage={currentStage}
                onStartPlan={handleStartPlan}
                activityPollData={activityPollData}
                placePollData={placePollData}
                onFinishVoting={handleFinishVoting}
                onVote={handleVote}
                eventData={{
                    winningActivity,
                    winningPlace,
                    rsvps: [],
                    currentUser: { id: 1, rsvp: 'going' },
                }}
            />
            <View style={styles.chatFeedContainer}>
                <ChatFeed />
            </View>
            <ChatInputBar />
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPollModalVisible}
                onRequestClose={() => setPollModalVisible(false)}
            >
                <PollCreation
                    onLaunchPoll={handleLaunchPoll}
                    pollType={pollType}
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darker,
    },
    chatFeedContainer: {
        flex: 1,
    },
});

export default CircleScreen;