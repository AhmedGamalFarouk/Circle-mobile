import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, KeyboardAvoidingView, Platform, LayoutAnimation, Pressable, Text, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, collection, onSnapshot, addDoc, updateDoc, serverTimestamp, Timestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ContextualPin from './components/ContextualPin/ContextualPin';
import ChatFeed from './components/ChatFeed';
import ChatInputBar from './components/ChatInputBar';
import CircleHeader from './components/CircleHeader';
import { COLORS } from '../../constants/constants';
import SimplePollCreation from './components/PollCreation/SimplePollCreation';
import useAuth from '../../hooks/useAuth';
import useUserProfile from '../../hooks/useUserProfile';
import useCircleMembers from '../../hooks/useCircleMembers';
import { useTheme } from '../../context/ThemeContext';

const PLANNING_STAGES = {
    IDLE: 'Idle',
    PLANNING_ACTIVITY: 'Planning the Activity',
    ACTIVITY_POLL_CLOSED: 'Activity Poll Closed',
    PLANNING_PLACE: 'Planning the Place',
    PLACE_POLL_CLOSED: 'Place Poll Closed',
    PENDING_CONFIRMATION: 'Pending Confirmation',
    EVENT_CONFIRMED: 'Event Confirmed',
};

const CircleScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { circleId, openPollModal } = route.params;
    const { user } = useAuth();
    const { profile: userProfile } = useUserProfile(user?.uid);
    const { memberCount } = useCircleMembers(circleId);
    const [circle, setCircle] = useState(null);
    const [poll, setPoll] = useState(null);
    const [event, setEvent] = useState(null);
    const [currentStage, setCurrentStage] = useState(PLANNING_STAGES.IDLE);
    const [isPollModalVisible, setPollModalVisible] = useState(false);
    const [pollType, setPollType] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [isPinVisible, setPinVisible] = useState(true);
    const [isMember, setIsMember] = useState(true);
    const [membershipChecked, setMembershipChecked] = useState(false);
    

    useEffect(() => {
        const fetchCircleData = async () => {
            const docRef = doc(db, "circles", circleId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const circleData = { id: docSnap.id, ...docSnap.data() };
                setCircle(circleData);
            } else {
                // No such document, handle accordingly (e.g., navigate back or show error)
            }
        };

        const checkMembership = async () => {
            if (!user?.uid || !circleId) return;

            try {
                const membersRef = collection(db, 'circles', circleId, 'members');
                const q = query(membersRef, where('userId', '==', user.uid));
                const memberSnapshot = await getDocs(q);

                const isUserMember = !memberSnapshot.empty;
                setIsMember(isUserMember);
                setMembershipChecked(true);

                if (!isUserMember) {
                    Alert.alert(
                        "Access Denied",
                        "You are no longer a member of this circle.",
                        [
                            {
                                text: "OK",
                                onPress: () => navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Home' }],
                                })
                            }
                        ]
                    );
                }
            } catch (error) {
                console.error('Error checking membership:', error);
                setMembershipChecked(true);
            }
        };

        fetchCircleData();
        checkMembership();

        let unsubscribeMembership;
        let unsubscribePolls;

        if (user?.uid && circleId) {
            const membersRef = collection(db, 'circles', circleId, 'members');
            const membershipQuery = query(membersRef, where('userId', '==', user?.uid));
            unsubscribeMembership = onSnapshot(membershipQuery, (snapshot) => {
                const isUserMember = !snapshot.empty;
                setIsMember(isUserMember);

                if (membershipChecked && !isUserMember) {
                    Alert.alert(
                        "Removed from Circle",
                        "You have been removed from this circle.",
                        [
                            {
                                text: "OK",
                                onPress: () => navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Home' }],
                                })
                            }
                        ]
                    );
                }
            }, (error) => {
                console.error('Error listening to membership:', error);
            });
        }

        if (circleId) {
            const pollQuery = collection(db, 'circles', circleId, 'polls');
            unsubscribePolls = onSnapshot(pollQuery, (snapshot) => {
                // Filter out archived polls
                const activePoll = snapshot.docs.find(doc => !doc.data().archived);
                if (activePoll) {
                    const currentPoll = activePoll.data();
                    setPoll({ id: activePoll.id, ...currentPoll });
                    setCurrentStage(currentPoll.stage);
                } else {
                    setPoll(null);
                    setCurrentStage(PLANNING_STAGES.IDLE);
                }
            }, (error) => {
                console.error('Error listening to polls:', error);
            });
        }

        const eventsQuery = query(collection(db, 'circles', circleId, 'events'), where('status', '==', 'confirmed'));
        const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
            // Only consider upcoming confirmed events
            const todayStr = new Date().toISOString().split('T')[0];
            const upcomingConfirmed = snapshot.docs
                .filter((doc) => {
                    const data = doc.data();
                    return typeof data.day === 'string' && data.day >= todayStr;
                })
                .sort((a, b) => {
                    const dayA = a.data().day || '';
                    const dayB = b.data().day || '';
                    return dayA.localeCompare(dayB);
                });

            if (upcomingConfirmed.length > 0) {
                const confirmedEvent = upcomingConfirmed[0];
                setEvent({ id: confirmedEvent.id, ...confirmedEvent.data() });
                // If there is an upcoming confirmed event, show Event Confirmed state
                setCurrentStage(PLANNING_STAGES.EVENT_CONFIRMED);
            } else {
                // No upcoming confirmed events; clear event reference
                setEvent(null);
                // Do not override currentStage here; poll listener will set to Idle when appropriate
            }
        });

        return () => {
            if (unsubscribePolls) unsubscribePolls();
            if (unsubscribeMembership) unsubscribeMembership();
            if (unsubscribeEvents) unsubscribeEvents();
        };
    }, [circleId, user?.uid, poll?.stage]);

    // Handle opening poll modal from navigation params
    useEffect(() => {
        if (openPollModal) {
            setPollType('activity');
            setPollModalVisible(true);
        }
    }, [openPollModal]);

    const handleStartPoll = () => {
        console.log('CircleScreen: handleStartPoll called');
        console.log('CircleScreen: Current isPollModalVisible:', isPollModalVisible);
        setPollType('activity');
        setPollModalVisible(true);
        console.log('CircleScreen: Set isPollModalVisible to true');
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
            } else if (currentStage === PLANNING_STAGES.PLANNING_PLACE) {
                const newVotes = { ...poll.placePoll.votes };
                newVotes[user.uid] = option;
                await updateDoc(pollRef, { 'placePoll.votes': newVotes });
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

        const options = Object.keys(voteCounts);
        if (options.length === 0) {
            console.warn('No valid votes found');
            return null;
        }

        const winner = options.reduce((a, b) =>
            voteCounts[a] > voteCounts[b] ? a : b
        );

        return winner;
    };

    const handleRsvp = async (status) => {
        if (!event?.id || !userProfile) return;

        const eventRef = doc(db, 'circles', circleId, 'events', event.id);
        const newRsvps = { ...event.rsvps || {} };
        const previousRsvp = newRsvps[user.uid];
        newRsvps[user.uid] = status;

        try {
            await updateDoc(eventRef, { rsvps: newRsvps });

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
                // Create a pending event
                const eventsRef = collection(db, 'circles', circleId, 'events');
                await addDoc(eventsRef, {
                    title: poll.winningActivity,
                    location: poll.winningPlace,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    createdBy: user.uid,
                });

                // Update the poll stage
                await updateDoc(pollRef, {
                    stage: PLANNING_STAGES.PENDING_CONFIRMATION,
                });

                // Add a system message
                const chatRef = collection(db, 'circles', circleId, 'chat');
                await addDoc(chatRef, {
                    messageType: 'system',
                    text: `📝 Event "${poll.winningActivity}" is pending confirmation by admins.`,
                    timeStamp: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error('Error proceeding to next step:', error);
        }
    };

    const handleStartNewPoll = async () => {
        try {
            // Delete past events from database
            const eventsQuery = query(collection(db, 'circles', circleId, 'events'));
            const eventsSnapshot = await getDocs(eventsQuery);
            
            const deletePromises = eventsSnapshot.docs.map(eventDoc => {
                return deleteDoc(eventDoc.ref);
            });
            
            await Promise.all(deletePromises);
            console.log('Past events deleted successfully');

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
            }

            // Reset local state
            setCurrentStage(PLANNING_STAGES.IDLE);
            setPoll(null);
            setPollType(null);
            setEvent(null); // Clear the current event
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

    // Don't render circle content if user is not a member
    if (!membershipChecked) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!isMember) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.errorText, { color: colors.text }]}>You are not a member of this circle.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={[styles.keyboardContainer, { backgroundColor: colors.background }]}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <View style={[styles.innerContainer, { backgroundColor: colors.background }]}>
                    <CircleHeader
                        name={circle?.circleName || circle?.name}
                        circleId={circleId}
                        circle={circle}
                        colors={colors}
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
                            eventData={event}
                            pollData={poll ? { ...poll, memberCount } : null}
                            onRsvp={handleRsvp}
                            onStartNewPoll={handleStartNewPoll}
                            onPollNextStep={handlePollNextStep}
                            onDismiss={handleDismiss}
                        />
                    ) : (
                        getShowPlanButtonText() && (
                            <View style={[styles.showPlanButtonContainer, { backgroundColor: colors.background }]}>
                                <Pressable style={[styles.showPlanButton, { backgroundColor: colors.primary }]} onPress={handleShow}>
                                    <Text style={[styles.showPlanButtonText, { color: colors.text }]}>{getShowPlanButtonText()}</Text>
                                </Pressable>
                            </View>
                        )
                    )}
                    <View style={[styles.chatFeedContainer, { backgroundColor: colors.background }]}>
                        <ChatFeed circleId={circleId} onReply={handleReply} colors={colors} />
                    </View>
                </View>
                <ChatInputBar circleId={circleId} replyingTo={replyingTo} onCancelReply={handleCancelReply} colors={colors} />
                </KeyboardAvoidingView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPollModalVisible}
                onRequestClose={() => setPollModalVisible(false)}
            >
                <SimplePollCreation
                    onLaunchPoll={handleLaunchPoll}
                    pollType={pollType}
                    onClose={() => setPollModalVisible(false)}
                    colors={colors}
                    circle={circle}
                />
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
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
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
    },
    showPlanButtonText: {
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default CircleScreen;
