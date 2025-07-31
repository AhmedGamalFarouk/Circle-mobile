import React from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import DefaultState from './components/DefaultState';
import ActivePollState from './components/ActivePollState';
import PollClosedState from './components/PollClosedState';
import EventConfirmedState from './components/EventConfirmedState';

const { width } = Dimensions.get('window');

const ContextualPin = ({ currentStage, onStartPoll, activityPollData, placePollData, onFinishVoting, onVote, eventData }) => {
    console.log('[ContextualPin] Current poll state:', currentStage);
    const renderContent = () => {
        switch (currentStage) {
            case 'Idle':
                return <DefaultState onStartPoll={onStartPoll} />;
            case 'Planning the Activity':
                return <ActivePollState pollData={activityPollData} onFinishVoting={onFinishVoting} onVote={onVote} />;
            case 'Planning the Place':
                return <ActivePollState pollData={placePollData} onFinishVoting={onFinishVoting} onVote={onVote} />;
            case 'Event Confirmed':
                return <EventConfirmedState eventData={eventData} />;
            default:
                return <DefaultState onStartPoll={onStartPoll} />;
        }
    };

    return (
        <View style={styles.stateContainer}>
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    stateContainer: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ContextualPin;