import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, KeyboardAvoidingView, Platform, LayoutAnimation, Pressable, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { doc, getDoc, collection, onSnapshot, addDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ContextualPin from './components/ContextualPin/ContextualPin';
import ChatFeed from './components/ChatFeed';
import ChatInputBar from './components/ChatInputBar';
import CircleHeader from './components/CircleHeader';
import { COLORS } from '../../constants/constants';
import PollCreation from './components/PollCreation';
import useAuth from '../../hooks/useAuth';
import useUserProfile from '../../hooks/useUserProfile';

const PLANNING_STAGES = {
    IDLE: 'Idle',
    PLANNING_ACTIVITY: 'Planning the Activity',
    ACTIVITY_POLL_CLOSED: 'Activity Poll Closed',
    PLANNING_PLACE: 'Planning the Place',
    PLACE_POLL_CLOSED: 'Place Poll Closed',
    EVENT_CONFIRMED: 'Event Confirmed',
};

const CircleScreen = () => {
    const route = useRoute();
    const { circleId, openPollModal } = route.params;
    console.log("CircleScreen circleId:", circleId);
    const { user } = useAuth();
    const { profile: userProfile } = useUserProfile(user?.uid);
    const [circle, setCircle] = useState(null);
    const [poll, setPoll] = useState(null);
    const [currentStage, setCurrentStage] = useState(PLANNING_STAGES.IDLE);
    const [isPollModalVisible, setPollModalVisible] = useState(false);
    const [pollType, setPollType] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [isPinVisible, setPinVisible] = useState(true);

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
            console.log('Poll snapshot received, docs count:', snapshot.docs.length);

            // Filter out archived polls
            const activePoll = snapshot.docs.find(doc => !doc.data().archived);
            if (activePoll) {
                const currentPoll = activePoll.data();
                console.log('Active poll found:', {
                    id: activePoll.id,
                    stage: currentPoll.stage,
                    hasActivityPoll: !!currentPoll.activityPoll,
                    hasPlacePoll: !!currentPoll.placePoll,
                    winningActivity: currentPoll.winningActivity,
                    winningPlace: currentPoll.winningPlace,
                    rsvpCount: Object.keys(currentPoll.rsvps || {}).length
                });

                setPoll({ id: activePoll.id, ...currentPoll });
                setCurrentStage(currentPoll.stage);
            } else {
                console.log('No active poll found, setting to IDLE');
                setPoll(null);
                setCurrentStage(PLANNING_STAGES.IDLE);
            }
        }, (error) => {
            console.error('Error listening to polls:', error);
        });

        return () => unsubscribe();
    }, [circleId]);

    // Handle opening poll modal from navigation params
    useEffect(() => {
        if (openPollModal) {
            setPollType('activity');
            setPollModalVisible(true);
        }
    }, [openPollModal]);

    const handleStartPoll = () => {
        setPollType('activity');
        setPollModalVisible(true);
    };

    const handleLaunchPoll = async (pollData) => {
        setPollModalVisible(false);

        try {
            // Convert deadline to Firestore Timestamp
            const pollDataWithTimestamp = {
                ...pollData,
                deadline: Timestamp.fromDate(pollData.deadline)
            };

            if (pollType === 'activity') {
                const pollRef = collection(db, 'circles', circleId, 'polls');
                await addDoc(pollRef, {
                    stage: PLANNING_STAGES.PLANNING_ACTIVITY,
                    activityPoll: { ...pollDataWithTimestamp, votes: {} },
                    timeStamp: serverTimestamp(),
                });

                // Add system message to chat about activity poll start
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `🗳️ Activity poll started: "${pollData.question}"`,
                    timeStamp: serverTimestamp(),
                });

                console.log('Activity poll created successfully');
            } else if (pollType === 'place') {
                const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);
                await updateDoc(pollRef, {
                    stage: PLANNING_STAGES.PLANNING_PLACE,
                    placePoll: { ...pollDataWithTimestamp, votes: {} },
                });

                // Add system message to chat about place poll start
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `📍 Place poll started: "${pollData.question}"`,
                    timeStamp: serverTimestamp(),
                });

                console.log('Place poll created successfully');
            }
        } catch (error) {
            console.error('Error launching poll:', error);
        }
    };

    const handleVote = async (option) => {
        if (!poll?.id || !userProfile) return;

        const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);

        try {
            if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
                const newVotes = { ...poll.activityPoll.votes };
                newVotes[user.uid] = option;
                await updateDoc(pollRef, { 'activityPoll.votes': newVotes });
                console.log(`Activity vote cast: ${userProfile?.username || 'Unknown user'} voted for ${option}`);
            } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
                const newVotes = { ...poll.placePoll.votes };
                newVotes[user.uid] = option;
                await updateDoc(pollRef, { 'placePoll.votes': newVotes });
                console.log(`Place vote cast: ${userProfile?.username || 'Unknown user'} voted for ${option}`);
            }
        } catch (error) {
            console.error('Error casting vote:', error);
        }
    };

    const handleAddOption = async (optionText, pollType) => {
        if (!poll?.id || !userProfile) return;

        const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);

        try {
            if (pollType === 'activity' && currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
                // Check if deadline has passed
                const deadline = poll.activityPoll.deadline.toDate();
                if (new Date() > deadline) {
                    console.warn('Cannot add option: Activity poll deadline has passed');
                    return;
                }

                const newOptions = [...poll.activityPoll.options, { text: optionText }];
                await updateDoc(pollRef, { 'activityPoll.options': newOptions });

                // Add system message to chat about new option
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `➕ ${userProfile?.username || 'Someone'} added a new activity option: "${optionText}"`,
                    timeStamp: serverTimestamp(),
                });

                console.log(`Activity option added: ${optionText} by ${userProfile?.username || 'Unknown user'}`);
            } else if (pollType === 'place' && currentStage === PLANNING_STAGES.PLANNING_PLACE) {
                // Check if deadline has passed
                const deadline = poll.placePoll.deadline.toDate();
                if (new Date() > deadline) {
                    console.warn('Cannot add option: Place poll deadline has passed');
                    return;
                }

                const newOptions = [...poll.placePoll.options, { text: optionText }];
                await updateDoc(pollRef, { 'placePoll.options': newOptions });

                // Add system message to chat about new option
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `➕ ${userProfile?.username || 'Someone'} added a new place option: "${optionText}"`,
                    timeStamp: serverTimestamp(),
                });

                console.log(`Place option added: ${optionText} by ${userProfile?.username || 'Unknown user'}`);
            }
        } catch (error) {
            console.error('Error adding option:', error);
        }
    };

    const handleFinishVoting = async () => {
        if (!poll?.id) return;

        const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);

        try {
            if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY) {
                const winningOption = getWinningOption(poll.activityPoll.votes);
                if (!winningOption) {
                    console.warn('No votes cast for activity poll');
                    return;
                }

                await updateDoc(pollRef, {
                    stage: PLANNING_STAGES.ACTIVITY_POLL_CLOSED,
                    winningActivity: winningOption,
                });

                // Add system message to chat about activity selection
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `📊 Activity poll closed! "${winningOption}" won.`,
                    timeStamp: serverTimestamp(),
                });

                console.log(`Activity poll finished. Winner: ${winningOption}`);

            } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
                const winningOption = getWinningOption(poll.placePoll.votes);
                if (!winningOption) {
                    console.warn('No votes cast for place poll');
                    return;
                }

                await updateDoc(pollRef, {
                    stage: PLANNING_STAGES.PLACE_POLL_CLOSED,
                    winningPlace: winningOption,
                });

                // Add system message to chat about place selection
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `📍 Place poll closed! "${winningOption}" won.`,
                    timeStamp: serverTimestamp(),
                });

                console.log(`Place poll finished. Winner: ${winningOption}`);
            }
        } catch (error) {
            console.error('Error finishing voting:', error);
        }
    };

    const getWinningOption = (votes) => {
        if (!votes || Object.keys(votes).length === 0) {
            console.warn('No votes to count');
            return null;
        }

        const voteCounts = Object.values(votes).reduce((acc, option) => {
            if (option && typeof option === 'string') {
                acc[option] = (acc[option] || 0) + 1;
            }
            return acc;
        }, {});

        console.log('Vote counts:', voteCounts);

        const options = Object.keys(voteCounts);
        if (options.length === 0) {
            console.warn('No valid votes found');
            return null;
        }

        const winner = options.reduce((a, b) =>
            voteCounts[a] > voteCounts[b] ? a : b
        );

        console.log('Winning option:', winner, 'with', voteCounts[winner], 'votes');
        return winner;
    };

    const handleRsvp = async (status) => {
        if (!poll?.id || !userProfile) return;

        const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);
        const newRsvps = { ...poll.rsvps || {} };
        const previousRsvp = newRsvps[user.uid];
        newRsvps[user.uid] = status;

        try {
            await updateDoc(pollRef, { rsvps: newRsvps });

            // Add system message for RSVP changes (only if it's a new RSVP or change)
            if (previousRsvp !== status) {
                const chatRef = collection(db, 'circles', circleId, 'chat');
                const statusEmoji = status === 'yes' ? '✅' : status === 'maybe' ? '❓' : '❌';
                const statusText = status === 'yes' ? 'is going' : status === 'maybe' ? 'might go' : 'can\'t make it';

                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `${statusEmoji} ${userProfile?.username || 'Someone'} ${statusText}`,
                    timeStamp: serverTimestamp(),
                });
            }

            console.log(`RSVP updated: ${userProfile?.username || 'Unknown user'} - ${status}`);
        } catch (error) {
            console.error('Error updating RSVP:', error);
        }
    };

    const handleReply = (message) => {
        setReplyingTo(message);
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleDismiss = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPinVisible(false);
    };

    const handleShow = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPinVisible(true);
    };

    const handlePollNextStep = async () => {
        if (!poll?.id) return;

        const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);

        try {
            if (currentStage === PLANNING_STAGES.ACTIVITY_POLL_CLOSED) {
                // Move to place polling
                setPollType('place');
                setPollModalVisible(true);
            } else if (currentStage === PLANNING_STAGES.PLACE_POLL_CLOSED) {
                // Finalize event and enable RSVPs
                await updateDoc(pollRef, {
                    stage: PLANNING_STAGES.EVENT_CONFIRMED,
                    rsvps: {}, // Initialize empty RSVP object
                });

                // Add system message about event confirmation
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `🎉 Event confirmed! ${poll.winningPlace} for ${poll.winningActivity}. Please RSVP above!`,
                    timeStamp: serverTimestamp(),
                });

                console.log('Event confirmed and RSVPs enabled');
            }
        } catch (error) {
            console.error('Error proceeding to next step:', error);
        }
    };

    const handleStartNewPoll = async () => {
        try {
            // Archive the current poll and start fresh
            if (poll?.id) {
                const pollRef = doc(db, 'circles', circleId, 'polls', poll.id);
                await updateDoc(pollRef, {
                    archived: true,
                    archivedAt: serverTimestamp(),
                });

                // Add system message about starting new planning
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: '🆕 Starting new event planning!',
                    timeStamp: serverTimestamp(),
                });

                console.log('Poll archived and new planning started');
            }

            // Reset local state
            setCurrentStage(PLANNING_STAGES.IDLE);
            setPoll(null);
            setPollType(null);
        } catch (error) {
            console.error('Error starting new poll:', error);
        }
    };

    const getShowPlanButtonText = () => {
        if (currentStage === PLANNING_STAGES.PLANNING_ACTIVITY || currentStage === PLANNING_STAGES.PLANNING_PLACE) {
            return "View Poll";
        }
        if (currentStage === PLANNING_STAGES.ACTIVITY_POLL_CLOSED || currentStage === PLANNING_STAGES.PLACE_POLL_CLOSED) {
            return "View Results";
        }
        if (currentStage === PLANNING_STAGES.EVENT_CONFIRMED) {
            return "View Event Details";
        }
        if (currentStage === PLANNING_STAGES.IDLE) {
            return "Show Planning";
        }
        return null;
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.innerContainer}>
                    <CircleHeader
                        name={circle?.circleName || circle?.name}
                        circleId={circleId}
                        circle={circle}
                    />
                    {isPinVisible ? (
                        <ContextualPin
                            currentStage={currentStage}
                            onStartPoll={handleStartPoll}
                            activityPollData={poll?.activityPoll}
                            placePollData={poll?.placePoll}
                            onFinishVoting={handleFinishVoting}
                            onVote={handleVote}
                            onAddOption={handleAddOption}
                            eventData={{
                                winningActivity: poll?.winningActivity,
                                winningPlace: poll?.winningPlace,
                                rsvps: poll?.rsvps || {},
                                currentUser: { id: user?.uid, rsvp: poll?.rsvps?.[user?.uid] },
                            }}
                            onRsvp={handleRsvp}
                            onStartNewPoll={handleStartNewPoll}
                            onPollNextStep={handlePollNextStep}
                            onDismiss={handleDismiss}
                        />
                    ) : (
                        getShowPlanButtonText() && (
                            <View style={styles.showPlanButtonContainer}>
                                <Pressable style={styles.showPlanButton} onPress={handleShow}>
                                    <Text style={styles.showPlanButtonText}>{getShowPlanButtonText()}</Text>
                                </Pressable>
                            </View>
                        )
                    )}
                    <View style={styles.chatFeedContainer}>
                        <ChatFeed circleId={circleId} onReply={handleReply} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
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
                    onClose={() => setPollModalVisible(false)}
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
    innerContainer: {
        flex: 1,
    },
    chatFeedContainer: {
        flex: 1,
    },
    showPlanButtonContainer: {
        position: 'absolute',
        top: 85,
        right: 15,
        zIndex: 1,
    },
    showPlanButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
    },
    showPlanButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CircleScreen;

