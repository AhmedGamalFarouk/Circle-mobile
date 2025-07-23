import React from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import DefaultState from './components/DefaultState';
import ActivePollState from './components/ActivePollState';
import PollClosedState from './components/PollClosedState';
import EventConfirmedState from './components/EventConfirmedState';

const { width } = Dimensions.get('window');

const dummyData = {
    default: {
        upcomingEvent: {
            title: "Dinner at Mike's",
            time: 'Sat at 7 PM',
            attendees: [
                { id: 1, profilePic: 'https://randomuser.me/api/portraits/men/1.jpg' },
                { id: 2, profilePic: 'https://randomuser.me/api/portraits/women/2.jpg' },
                { id: 3, profilePic: 'https://randomuser.me/api/portraits/men/3.jpg' },
            ],
        },
    },
    active_poll: {
        poll: {
            creator: { name: 'Maria' },
            endsIn: '12 hours',
            question: 'What should we do this Saturday?',
            options: [
                { id: 1, text: 'Go to the beach', votes: 3 },
                { id: 2, text: 'Watch a movie', votes: 5 },
                { id: 3, text: 'Play board games', votes: 2 },
            ],
            voters: [
                { id: 1, profilePic: 'https://randomuser.me/api/portraits/men/1.jpg' },
                { id: 2, profilePic: 'https://randomuser.me/api/portraits/women/2.jpg' },
                { id: 3, profilePic: 'https://randomuser.me/api/portraits/men/3.jpg' },
                { id: 4, profilePic: 'https://randomuser.me/api/portraits/women/4.jpg' },
                { id: 5, profilePic: 'https://randomuser.me/api/portraits/men/5.jpg' },
            ],
        },
        currentUser: { id: 2, votedFor: 2 },
    },
    poll_closed: {
        winningOption: { text: 'Watch a movie' },
        nextStep: 'plan_venue',
    },
    event_confirmed: {
        event: {
            title: 'Movie Night',
            location: 'Cineplex',
            dateTime: 'Sat, 7 PM',
            rsvps: [
                { user: { id: 1, name: 'Ahmed', profilePic: 'https://randomuser.me/api/portraits/men/1.jpg' }, status: 'going' },
                { user: { id: 2, name: 'Maria', profilePic: 'https://randomuser.me/api/portraits/women/2.jpg' }, status: 'going' },
                { user: { id: 3, name: 'John', profilePic: 'https://randomuser.me/api/portraits/men/3.jpg' }, status: 'maybe' },
                { user: { id: 4, name: 'Sara', profilePic: 'https://randomuser.me/api/portraits/women/4.jpg' }, status: 'not_going' },
            ],
        },
        currentUser: { id: 1, rsvp: 'going' },
    },
};

const ContextualPin = () => {
    return (
        <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
        >
            <View style={styles.stateContainer}>
                <DefaultState data={dummyData.default} />
            </View>
            <View style={styles.stateContainer}>
                <ActivePollState data={dummyData.active_poll} />
            </View>
            <View style={styles.stateContainer}>
                <PollClosedState data={dummyData.poll_closed} />
            </View>
            <View style={styles.stateContainer}>
                <EventConfirmedState data={dummyData.event_confirmed} />
            </View>
        </ScrollView>
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