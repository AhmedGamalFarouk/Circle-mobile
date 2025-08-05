import React from 'react';
import { ScrollView, StyleSheet, View, Dimensions, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DefaultState from './components/DefaultState';
import ActivePollState from './components/ActivePollState';
import PollClosedState from './components/PollClosedState';
import EventConfirmedState from './components/EventConfirmedState';

const { width } = Dimensions.get('window');

const ContextualPin = ({ currentStage, onStartPoll, activityPollData, placePollData, onFinishVoting, onVote, onAddOption, eventData, onRsvp, onStartNewPoll, onDismiss, onPollNextStep }) => {
    console.log('[ContextualPin] Current poll state:', currentStage);
    console.log('[ContextualPin] Activity poll data:', activityPollData ? 'Present' : 'Missing');
    console.log('[ContextualPin] Place poll data:', placePollData ? 'Present' : 'Missing');
    console.log('[ContextualPin] Event data:', eventData);

    const renderContent = () => {
        switch (currentStage) {
            case 'Idle':
                console.log('[ContextualPin] Rendering DefaultState');
                return <DefaultState onStartPoll={onStartPoll} />;
            case 'Planning the Activity':
                console.log('[ContextualPin] Rendering ActivePollState for Activity');
                return <ActivePollState pollData={activityPollData} onFinishVoting={onFinishVoting} onVote={onVote} onAddOption={(option) => onAddOption(option, 'activity')} />;
            case 'Activity Poll Closed':
                console.log('[ContextualPin] Rendering PollClosedState for Activity');
                return <PollClosedState data={{ winningOption: { text: eventData?.winningActivity }, nextStep: 'poll_venue' }} onPollNextStep={onPollNextStep} />;
            case 'Planning the Place':
                console.log('[ContextualPin] Rendering ActivePollState for Place');
                return <ActivePollState pollData={placePollData} onFinishVoting={onFinishVoting} onVote={onVote} onAddOption={(option) => onAddOption(option, 'place')} />;
            case 'Place Poll Closed':
                console.log('[ContextualPin] Rendering PollClosedState for Place');
                return <PollClosedState data={{ winningOption: { text: eventData?.winningPlace }, nextStep: 'finalize_event' }} onPollNextStep={onPollNextStep} />;
            case 'Event Confirmed':
                console.log('[ContextualPin] Rendering EventConfirmedState');
                return <EventConfirmedState eventData={eventData} onRsvp={onRsvp} onStartNewPoll={onStartNewPoll} />;
            default:
                console.log('[ContextualPin] Unknown stage, rendering DefaultState');
                return <DefaultState onStartPoll={onStartPoll} />;
        }
    };

    return (
        <View style={styles.stateContainer}>
            <Pressable style={styles.dismissButton} onPress={onDismiss}>
                <Feather name="chevron-up" size={24} color="gray" />
            </Pressable>
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
    dismissButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
});

export default ContextualPin;