import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, collection, onSnapshot, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ContextualPin from './components/ContextualPin/ContextualPin';
import ChatFeed from './components/ChatFeed';
import ChatInputBar from './components/ChatInputBar';
import { COLORS } from '../../constants/constants';
import PollCreation from './components/PollCreation';
import useAuth from '../../hooks/useAuth';

const PLANNING_STAGES = {
    IDLE: 'Idle',
    PLANNING_ACTIVITY: 'Planning the Activity',
    PLANNING_PLACE: 'Planning the Place',
    EVENT_CONFIRMED: 'Event Confirmed',
};

const CircleScreen = () => {
    const route = useRoute();
    const { circleId } = route.params;
    console.log("CircleScreen circleId:", circleId);
    const { user } = useAuth();
    const [circle, setCircle] = useState(null);
    const [poll, setPoll] = useState(null);
    const [currentStage, setCurrentStage] = useState(PLANNING_STAGES.IDLE);
    const [isPollModalVisible, setPollModalVisible] = useState(false);
    const [pollType, setPollType] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        const fetchCircleData = async () => {
            const docRef = doc(db, "circles", circleId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const circleData = { id: docSnap.id, ...docSnap.data() };
                setCircle(circleData);
            } else {
                console.log("No such document!");
            }
        };

        fetchCircleData();

        const pollQuery = collection(db, 'circles', circleId, 'polls');
        const unsubscribe = onSnapshot(pollQuery, (snapshot) => {
            if (!snapshot.empty) {
                const currentPoll = snapshot.docs[0].data();
                setPoll({ id: snapshot.docs[0].id, ...currentPoll });
                setCurrentStage(currentPoll.stage);
            } else {
                setPoll(null);
                setCurrentStage(PLANNING_STAGES.IDLE);
            }
        });

        return () => unsubscribe();
    }, [circleId]);

    const handleStartPoll = () => {
        setPollType('activity');
        setPollModalVisible(true);
    };

    const handleLaunchPoll = async (pollData) => {
        setPollModalVisible(false);
        const pollRef = collection(db, 'circles', circleId, 'polls');
        if (pollType === 'activity') {
            await addDoc(pollRef, {
                stage: PLANNING_STAGES.PLANNING_ACTIVITY,
                activityPoll: { ...pollData, votes: {} },
                createdAt: serverTimestamp(),
            });
        } else if (pollType === 'place') {
            await updateDoc(doc(db, 'circles', circleId, 'polls', poll.id), {
                stage: PLANNING_STAGES.PLANNING_PLACE,
                placePoll: { ...pollData, votes: {} },
            });
        }
    };

    const handleVote = async (option) => {
        const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);
        const newVotes = { ...poll[pollType + 'Poll'].votes };
        newVotes[user.uid] = option;

        if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
            await updateDoc(pollRef, { 'activityPoll.votes': newVotes });
        } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
            await updateDoc(pollRef, { 'placePoll.votes': newVotes });
        }
    };

    const handleFinishVoting = async () => {
        const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);
        if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
            const winningOption = getWinningOption(poll.activityPoll.votes);
            await updateDoc(pollRef, {
                stage: PLANNING_STAGES.PLANNING_PLACE,
                winningActivity: winningOption,
            });
            setPollType('place');
            setPollModalVisible(true);
        } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
            const winningOption = getWinningOption(poll.placePoll.votes);
            await updateDoc(pollRef, {
                stage: PLANNING_STAGES.EVENT_CONFIRMED,
                winningPlace: winningOption,
            });
        }
    };

    const getWinningOption = (votes) => {
        if (!votes || Object.keys(votes).length === 0) return null;
        const voteCounts = Object.values(votes).reduce((acc, option) => {
            acc[option] = (acc[option] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);
    };

    const handleRsvp = async (status) => {
        const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);
        const newRsvps = { ...poll.rsvps };
        newRsvps[user.uid] = status;
        await updateDoc(pollRef, { rsvps: newRsvps });
    };

    const handleReply = (message) => {
        setReplyingTo(message);
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "padding"} // Change Android behavior to "padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90} // Add a small offset for Android
        >
            <ContextualPin
                currentStage={currentStage}
                onStartPoll={handleStartPoll}
                activityPollData={poll?.activityPoll}
                placePollData={poll?.placePoll}
                onFinishVoting={handleFinishVoting}
                onVote={handleVote}
                eventData={{
                    winningActivity: poll?.winningActivity,
                    winningPlace: poll?.winningPlace,
                    rsvps: poll?.rsvps || {},
                    currentUser: { id: user?.uid, rsvp: poll?.rsvps?.[user?.uid] },
                }}
                onRsvp={handleRsvp}
            />
            <View style={styles.chatFeedContainer}>
                <ChatFeed circleId={circleId} onReply={handleReply} />
            </View>
            <ChatInputBar circleId={circleId} replyingTo={replyingTo} onCancelReply={handleCancelReply} />
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
        </KeyboardAvoidingView>
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