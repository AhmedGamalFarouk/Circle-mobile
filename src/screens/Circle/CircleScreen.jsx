import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
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
    const { user } = useAuth();
    const [circle, setCircle] = useState(null);
    const [plan, setPlan] = useState(null);
    const [currentStage, setCurrentStage] = useState(PLANNING_STAGES.IDLE);
    const [isPollModalVisible, setPollModalVisible] = useState(false);
    const [pollType, setPollType] = useState(null);

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

        const planQuery = collection(db, 'circles', circleId, 'plans');
        const unsubscribe = onSnapshot(planQuery, (snapshot) => {
            if (!snapshot.empty) {
                const currentPlan = snapshot.docs[0].data();
                setPlan({ id: snapshot.docs[0].id, ...currentPlan });
                setCurrentStage(currentPlan.stage);
            } else {
                setPlan(null);
                setCurrentStage(PLANNING_STAGES.IDLE);
            }
        });

        return () => unsubscribe();
    }, [circleId]);

    const handleStartPlan = () => {
        setPollType('activity');
        setPollModalVisible(true);
    };

    const handleLaunchPoll = async (pollData) => {
        setPollModalVisible(false);
        const planRef = collection(db, 'circles', circleId, 'plans');
        if (pollType === 'activity') {
            await addDoc(planRef, {
                stage: PLANNING_STAGES.PLANNING_ACTIVITY,
                activityPoll: { ...pollData, votes: {} },
                createdAt: serverTimestamp(),
            });
        } else if (pollType === 'place') {
            await updateDoc(doc(db, 'circles', circleId, 'plans', plan.id), {
                stage: PLANNING_STAGES.PLANNING_PLACE,
                placePoll: { ...pollData, votes: {} },
            });
        }
    };

    const handleVote = async (option) => {
        const planRef = doc(db, 'circles', circleId, 'plans', plan.id);
        const newVotes = { ...plan[pollType + 'Poll'].votes };
        newVotes[user.uid] = option;

        if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
            await updateDoc(planRef, { 'activityPoll.votes': newVotes });
        } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
            await updateDoc(planRef, { 'placePoll.votes': newVotes });
        }
    };

    const handleFinishVoting = async () => {
        const planRef = doc(db, 'circles', circleId, 'plans', plan.id);
        if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
            const winningOption = getWinningOption(plan.activityPoll.votes);
            await updateDoc(planRef, {
                stage: PLANNING_STAGES.PLANNING_PLACE,
                winningActivity: winningOption,
            });
            setPollType('place');
            setPollModalVisible(true);
        } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
            const winningOption = getWinningOption(plan.placePoll.votes);
            await updateDoc(planRef, {
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
        const planRef = doc(db, 'circles', circleId, 'plans', plan.id);
        const newRsvps = { ...plan.rsvps };
        newRsvps[user.uid] = status;
        await updateDoc(planRef, { rsvps: newRsvps });
    };

    return (
        <View style={styles.container}>
            <ContextualPin
                currentStage={currentStage}
                onStartPlan={handleStartPlan}
                activityPollData={plan?.activityPoll}
                placePollData={plan?.placePoll}
                onFinishVoting={handleFinishVoting}
                onVote={handleVote}
                eventData={{
                    winningActivity: plan?.winningActivity,
                    winningPlace: plan?.winningPlace,
                    rsvps: plan?.rsvps || {},
                    currentUser: { id: user?.uid, rsvp: plan?.rsvps?.[user?.uid] },
                }}
                onRsvp={handleRsvp}
            />
            <View style={styles.chatFeedContainer}>
                <ChatFeed circleId={circleId} />
            </View>
            <ChatInputBar circleId={circleId} />
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