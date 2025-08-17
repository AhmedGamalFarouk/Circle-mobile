import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Animated, Keyboard, Alert, TextInput, Vibration, BackHandler, Dimensions } from 'react-native';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import useAuth from '../../../hooks/useAuth';
import useUserProfile from '../../../hooks/useUserProfile';
import { COLORS, RADII, FONTS, SHADOWS } from '../../../constants/constants';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import VoicePlayer from '../../../components/VoicePlayer';
import VideoPlayer from '../../../components/VideoPlayer';
import ImageViewer from '../../../components/ImageViewer';
import MessageInfoModal from '../../../components/MessageInfoModal';
// import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';


const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// Animation utility functions
const createBounceAnimation = (animatedValue, toValue = 1, duration = 300) => {
    return Animated.spring(animatedValue, {
        toValue,
        tension: 300,
        friction: 6,
        useNativeDriver: true,
    });
};

const createPulseAnimation = (animatedValue) => {
    return Animated.sequence([
        Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
        }),
    ]);
};

const ChatFeed = ({ circleId, onReply }) => {
    const [messages, setMessages] = useState([]);
    const { user } = useAuth();
    const { profile: userProfile } = useUserProfile(user?.uid);
    const scrollViewRef = useRef();
    const swipeableRefs = useRef({});
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showEmojis, setShowEmojis] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 });
    const scale = useRef(new Animated.Value(0)).current;
    const optionsScale = useRef(new Animated.Value(0)).current;
    const optionsSlideX = useRef(new Animated.Value(-100)).current;
    const optionsOpacity = useRef(new Animated.Value(0)).current;
    const [editingMessage, setEditingMessage] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [showMessageInfo, setShowMessageInfo] = useState(false);
    const [messageInfoData, setMessageInfoData] = useState(null);

    // Enhanced animation refs for reactions
    const emojiScales = useRef(EMOJI_OPTIONS.reduce((acc, emoji) => {
        acc[emoji] = new Animated.Value(1);
        return acc;
    }, {})).current;
    const reactionAnimations = useRef({}).current;
    const [reactionParticles, setReactionParticles] = useState([]);
    const messageBubbleAnimations = useRef({}).current;

    useEffect(() => {
        if (!circleId) return;

        const q = query(collection(db, 'circles', circleId, 'chat'), orderBy('timeStamp', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = [];
            querySnapshot.forEach((doc) => {
                messagesData.push({ id: doc.id, ...doc.data() });
            });

            // Animate new reactions
            setMessages(prevMessages => {
                const newMessages = messagesData;
                newMessages.forEach(newMessage => {
                    const prevMessage = prevMessages.find(m => m.id === newMessage.id);
                    if (prevMessage && newMessage.reactions && prevMessage.reactions) {
                        const newReactions = newMessage.reactions.filter(newReaction =>
                            !prevMessage.reactions.some(prevReaction =>
                                prevReaction.userId === newReaction.userId &&
                                prevReaction.emoji === newReaction.emoji
                            )
                        );

                        // Animate new reactions
                        newReactions.forEach(reaction => {
                            const reactionKey = `${newMessage.id}-${reaction.emoji}`;
                            if (!reactionAnimations[reactionKey]) {
                                reactionAnimations[reactionKey] = new Animated.Value(0);
                                createBounceAnimation(reactionAnimations[reactionKey], 1, 400).start();
                            }
                        });
                    }
                });
                return newMessages;
            });
        });
        //TODO: ADJUST SCROLL TO END WHEN KEYBOARD IS VISIBLE 

        // const keyboardDidShowListener = Keyboard.addListener(
        //     'keyboardDidShow',
        //     () => {
        //         scrollViewRef.current.scrollToEnd({ animated: true });
        //     }
        // );

        return () => {
            unsubscribe();
            //keyboardDidShowListener.remove();
        };
    }, [circleId]);

    // Handle back button press to close options menu
    useEffect(() => {
        const backAction = () => {
            if (showOptions) {
                hideOptionsMenu();
                return true; // Prevent default back action
            }
            if (showEmojis) {
                setShowEmojis(false);
                setSelectedMessage(null);
                return true; // Prevent default back action
            }
            return false; // Allow default back action
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [showOptions, showEmojis]);



    const handleLongPress = (message, event) => {
        setSelectedMessage(message);

        // Enhanced haptic feedback pattern
        Vibration.vibrate([0, 100, 50, 100]);

        const isCurrentUser = message.user.userId === user.uid;

        if (isCurrentUser) {
            // For current user messages: show options menu
            handleShowOptions(message, event);
        } else {
            // For other user messages: show reactions directly
            handleShowReactions(message, event);
        }
    };

    const handleShowReactions = (message, event) => {
        setSelectedMessage(message);
        setShowEmojis(true);
        setShowOptions(false); // Ensure options menu is hidden

        // Enhanced bounce animation with stagger effect
        scale.setValue(0);
        createBounceAnimation(scale, 1, 400).start();

        // Stagger emoji animations
        EMOJI_OPTIONS.forEach((emoji, index) => {
            const emojiScale = emojiScales[emoji];
            emojiScale.setValue(0);
            setTimeout(() => {
                createBounceAnimation(emojiScale, 1, 300).start();
            }, index * 50);
        });
    };

    const handleShowOptions = (message, event) => {
        setSelectedMessage(message);
        const isCurrentUser = message.user.userId === user.uid;

        // Get touch coordinates and measure ScrollView to get relative position
        const { pageX, pageY } = event.nativeEvent;

        // Calculate position for the options menu
        const screenWidth = Dimensions.get('window').width;
        const menuWidth = 150;

        let adjustedX = pageX;
        let adjustedY = pageY - 120; // Position above the message

        // Adjust horizontal position based on user type and screen bounds
        if (isCurrentUser) {
            // For current user (right side), position menu to the left of touch
            adjustedX = Math.max(20, pageX - menuWidth);
        } else {
            // For other users (left side), position menu to the right of touch
            adjustedX = Math.min(screenWidth - menuWidth - 20, pageX);
        }

        // Since the overlay is now positioned relative to the ChatFeed wrapper,
        // we need to adjust the Y coordinate to account for the ContextualPin
        scrollViewRef.current?.measure((x, y, width, height, pageXContainer, pageYContainer) => {
            // Adjust Y coordinate to be relative to the ChatFeed wrapper
            const adjustedYRelative = adjustedY - pageYContainer;

            // Ensure menu stays within the ChatFeed bounds
            let finalY = adjustedYRelative;
            if (finalY < 20) {
                finalY = (pageY - pageYContainer) + 40; // Position below if not enough space above
            } else if (finalY > height - 120) {
                finalY = height - 120;
            }

            setOptionsPosition({
                x: adjustedX,
                y: finalY
            });
        });

        // Reset animation values
        optionsSlideX.setValue(isCurrentUser ? 30 : -30);
        optionsOpacity.setValue(0);
        optionsScale.setValue(0.95);

        setShowOptions(true);
        setShowEmojis(false); // Hide emoji picker when showing options

        // Add haptic feedback
        Vibration.vibrate(50);

        // Animate options menu in with smooth effect
        Animated.parallel([
            Animated.timing(optionsSlideX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(optionsOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(optionsScale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleSelectEmoji = async (emoji) => {
        if (!selectedMessage || !userProfile) return;

        // Enhanced haptic feedback
        Vibration.vibrate([10, 50, 10]);

        // Animate emoji selection
        const emojiScale = emojiScales[emoji];
        createPulseAnimation(emojiScale).start();

        // Create particle effect
        const particleId = Date.now();
        const particleOpacity = new Animated.Value(1);
        const particleScale = new Animated.Value(1);
        const particleY = new Animated.Value(0);

        setReactionParticles(prev => [...prev, {
            id: particleId,
            emoji,
            x: Math.random() * 200 + 50,
            y: Math.random() * 100 + 100,
            opacity: particleOpacity,
            scale: particleScale,
            translateY: particleY
        }]);

        // Animate particle
        Animated.parallel([
            Animated.timing(particleOpacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(particleScale, {
                toValue: 1.5,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(particleY, {
                toValue: -50,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();

        // Remove particle after animation
        setTimeout(() => {
            setReactionParticles(prev => prev.filter(p => p.id !== particleId));
        }, 800);

        const messageRef = doc(db, 'circles', circleId, 'chat', selectedMessage.id);
        const reaction = {
            emoji,
            userId: user.uid,
            userName: userProfile?.username || 'Unknown user',
        };

        const existingReaction = selectedMessage.reactions?.find(
            (r) => r.userId === user.uid && r.emoji === emoji
        );

        if (existingReaction) {
            await updateDoc(messageRef, {
                reactions: arrayRemove(existingReaction),
            });
        } else {
            const userPreviousReaction = selectedMessage.reactions?.find(
                (r) => r.userId === user.uid
            );
            if (userPreviousReaction) {
                await updateDoc(messageRef, {
                    reactions: arrayRemove(userPreviousReaction),
                });
            }
            await updateDoc(messageRef, {
                reactions: arrayUnion(reaction),
            });
        }

        // Smooth close animation
        Animated.timing(scale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setShowEmojis(false);
            setSelectedMessage(null);
        });
    };

    const handleEditMessage = () => {
        if (!selectedMessage) return;

        const now = new Date();
        const messageTime = selectedMessage.timeStamp.toDate();
        const diffInMinutes = (now - messageTime) / (1000 * 60);

        if (diffInMinutes > 15) {
            Alert.alert("Can't Edit", "You can only edit messages for 15 minutes after sending.");
            hideOptionsMenu();
            return;
        }

        setEditingMessage(selectedMessage);
        setEditedText(selectedMessage.text);
        hideOptionsMenu();
    };

    const hideOptionsMenu = () => {
        Animated.parallel([
            Animated.timing(optionsOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(optionsScale, {
                toValue: 0.95,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start(() => {
            setShowOptions(false);
            setSelectedMessage(null);
        });
    };

    const handleUpdateMessage = async () => {
        if (!editingMessage) return;

        const messageRef = doc(db, 'circles', circleId, 'chat', editingMessage.id);
        await updateDoc(messageRef, {
            text: editedText,
            editedAt: new Date(),
        });

        setEditingMessage(null);
        setEditedText('');
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
        setEditedText('');
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessage) return;

        Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message for everyone?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: hideOptionsMenu
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'circles', circleId, 'chat', selectedMessage.id));
                            hideOptionsMenu();
                        } catch (error) {
                            console.error('Error deleting message:', error);
                            Alert.alert('Error', 'Failed to delete message');
                            hideOptionsMenu();
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteForMe = async () => {
        if (!selectedMessage) return;

        Alert.alert(
            'Delete for Me',
            'This message will only be hidden for you. Others will still see it.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: hideOptionsMenu
                },
                {
                    text: 'Delete for Me',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const messageRef = doc(db, 'circles', circleId, 'chat', selectedMessage.id);
                            const hiddenBy = selectedMessage.hiddenBy || [];

                            if (!hiddenBy.includes(user.uid)) {
                                await updateDoc(messageRef, {
                                    hiddenBy: arrayUnion(user.uid)
                                });
                            }
                            hideOptionsMenu();
                        } catch (error) {
                            console.error('Error hiding message:', error);
                            Alert.alert('Error', 'Failed to hide message');
                            hideOptionsMenu();
                        }
                    }
                }
            ]
        );
    };

    const handleShowMessageInfo = () => {
        if (!selectedMessage) return;

        setMessageInfoData(selectedMessage);
        setShowMessageInfo(true);
        hideOptionsMenu();
    };

    // Group reactions by emoji with enhanced display
    const groupReactions = (reactions) => {
        if (!reactions || reactions.length === 0) return [];

        const grouped = reactions.reduce((acc, reaction) => {
            if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = {
                    emoji: reaction.emoji,
                    count: 0,
                    users: [],
                    hasCurrentUser: false
                };
            }
            acc[reaction.emoji].count++;
            acc[reaction.emoji].users.push(reaction.userName);
            if (reaction.userId === user.uid) {
                acc[reaction.emoji].hasCurrentUser = true;
            }
            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => b.count - a.count);
    };

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const isToday = messageDate.toDateString() === now.toDateString();
        const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === messageDate.toDateString();

        if (isToday) {
            // Show time for today's messages (e.g., "2:30 PM")
            return messageDate.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } else if (isYesterday) {
            // Show "Yesterday" with time for yesterday's messages
            const time = messageDate.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            return `Yesterday ${time}`;
        } else {
            // Show date and time for older messages (e.g., "Jan 15, 2:30 PM")
            return messageDate.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    };

    // Handle reaction press with animation
    const handleReactionPress = async (message, emoji) => {
        if (!userProfile) return;

        // Create reaction animation
        const reactionKey = `${message.id}-${emoji}`;
        if (!reactionAnimations[reactionKey]) {
            reactionAnimations[reactionKey] = new Animated.Value(1);
        }

        createPulseAnimation(reactionAnimations[reactionKey]).start();

        const messageRef = doc(db, 'circles', circleId, 'chat', message.id);
        const reaction = {
            emoji,
            userId: user.uid,
            userName: userProfile?.username || 'Unknown user',
        };

        const existingReaction = message.reactions?.find(
            (r) => r.userId === user.uid && r.emoji === emoji
        );

        if (existingReaction) {
            await updateDoc(messageRef, {
                reactions: arrayRemove(existingReaction),
            });
        } else {
            const userPreviousReaction = message.reactions?.find(
                (r) => r.userId === user.uid
            );
            if (userPreviousReaction) {
                await updateDoc(messageRef, {
                    reactions: arrayRemove(userPreviousReaction),
                });
            }
            await updateDoc(messageRef, {
                reactions: arrayUnion(reaction),
            });
        }

        // Haptic feedback
        Vibration.vibrate(30);

        // Animate message bubble
        const bubbleKey = `bubble-${message.id}`;
        if (!messageBubbleAnimations[bubbleKey]) {
            messageBubbleAnimations[bubbleKey] = new Animated.Value(1);
        }
        createPulseAnimation(messageBubbleAnimations[bubbleKey]).start();
    };



    const renderMessages = () => {
        let lastSender = null;
        return messages
            .filter(message => !message.hiddenBy?.includes(user.uid)) // Filter out messages hidden by current user
            .map((message) => {
                if (message.messageType === 'system') {
                    return (
                        <View key={message.id} style={styles.systemMessageContainer}>
                            <Text style={styles.systemMessageText}>{message.text}</Text>
                        </View>
                    );
                }

                const isCurrentUser = message.user.userId === user.uid;
                const showSenderInfo = message.user.userId !== lastSender;
                lastSender = message.user.userId;

                const renderLeftActions = (progress, dragX) => {
                    const opacity = dragX.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 0.6],
                        extrapolate: 'clamp',
                    });

                    const translateX = dragX.interpolate({
                        inputRange: [0, 80],
                        outputRange: [-20, 0],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View style={[
                            styles.replyAction,
                            {
                                opacity,
                                transform: [{ translateX }]
                            }
                        ]}>
                            <Ionicons
                                name="arrow-undo"
                                size={20}
                                color="rgba(255, 255, 255, 0.8)"
                            />
                        </Animated.View>
                    );
                };

                return (
                    <Swipeable
                        key={message.id}
                        ref={(ref) => {
                            if (ref && message.id) {
                                swipeableRefs.current[message.id] = ref;
                            }
                        }}
                        renderLeftActions={renderLeftActions}
                        leftThreshold={60}
                        friction={2}
                        overshootFriction={8}
                        onSwipeableWillOpen={() => {
                            // Subtle haptic feedback when swipe threshold is reached
                            Vibration.vibrate(25);
                        }}
                        onSwipeableLeftOpen={() => {
                            onReply(message);
                            // Smooth close animation
                            if (swipeableRefs.current[message.id]) {
                                setTimeout(() => {
                                    swipeableRefs.current[message.id].close();
                                }, 100);
                            }
                        }}
                    >
                        <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessageContainer : styles.otherUserMessageContainer]}>
                            {!isCurrentUser && showSenderInfo && (
                                <View style={styles.senderInfoContainer}>
                                    {message.user.imageurl && <Image source={{ uri: message.user.imageurl }} style={styles.avatar} />}
                                    <Text style={styles.senderName}>{message.user.userName}</Text>
                                </View>
                            )}
                            <TouchableOpacity onLongPress={(event) => handleLongPress(message, event)} delayLongPress={200}>
                                <Animated.View
                                    style={[
                                        styles.messageBubble,
                                        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
                                        {
                                            transform: [{
                                                scale: messageBubbleAnimations[`bubble-${message.id}`] || 1
                                            }]
                                        }
                                    ]}
                                >
                                    {message.replyTo && (
                                        <View style={styles.replyContainer}>
                                            <Text style={styles.replyUser}>{message.replyTo.userName}</Text>
                                            <View style={styles.replyTextContainer}>
                                                {!message.replyTo.text && (
                                                    <Ionicons name="mic" size={12} color={COLORS.text} style={styles.voiceReplyIcon} />
                                                )}
                                                <Text style={styles.replyText} numberOfLines={1}>
                                                    {message.replyTo.text ||
                                                        (message.replyTo.messageType === 'image' ? 'Photo' :
                                                            message.replyTo.messageType === 'video' ? 'Video' : 'Voice message')}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                    {editingMessage?.id === message.id ? (
                                        <View>
                                            <TextInput
                                                value={editedText}
                                                onChangeText={setEditedText}
                                                style={styles.editInput}
                                                autoFocus
                                            />
                                            <View style={styles.editButtons}>
                                                <TouchableOpacity onPress={handleUpdateMessage} style={styles.saveButton}>
                                                    <Text style={styles.buttonText}>Save</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                                                    <Text style={styles.buttonText}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <>
                                            {(message.messageType === 'audio' || message.messageType === 'voice') ? (
                                                <VoicePlayer
                                                    audioUrl={message.audioUrl}
                                                    duration={message.duration}
                                                    isCurrentUser={isCurrentUser}
                                                    timestamp={message.timeStamp}
                                                />
                                            ) : message.messageType === 'image' ? (
                                                <View style={styles.mediaMessageContainer}>
                                                    <ImageViewer
                                                        imageUrl={message.mediaUrl}
                                                        imageStyle={[
                                                            styles.messageImage,
                                                            {
                                                                aspectRatio: message.mediaWidth && message.mediaHeight
                                                                    ? message.mediaWidth / message.mediaHeight
                                                                    : 1
                                                            }
                                                        ]}
                                                    />
                                                    <Text style={[
                                                        styles.mediaTimestamp,
                                                        isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
                                                    ]}>
                                                        {formatTimestamp(message.timeStamp)}
                                                    </Text>
                                                </View>
                                            ) : message.messageType === 'video' ? (
                                                <View style={styles.mediaMessageContainer}>
                                                    <VideoPlayer
                                                        videoUrl={message.mediaUrl}
                                                        aspectRatio={message.mediaWidth && message.mediaHeight && typeof message.mediaWidth === 'number' && typeof message.mediaHeight === 'number'
                                                            ? message.mediaWidth / message.mediaHeight
                                                            : 16 / 9}
                                                        style={styles.videoPlayerContainer}
                                                    />
                                                    <Text style={[
                                                        styles.mediaTimestamp,
                                                        isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
                                                    ]}>
                                                        {formatTimestamp(message.timeStamp)}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View>
                                                    <Text style={styles.messageText}>{message.text}</Text>
                                                    <Text style={[
                                                        styles.messageTimestamp,
                                                        isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
                                                    ]}>
                                                        {formatTimestamp(message.timeStamp)}
                                                    </Text>
                                                </View>
                                            )}
                                        </>
                                    )}
                                    {message.editedAt && <Text style={styles.editedText}>(edited)</Text>}
                                    {message.reactions && message.reactions.length > 0 && (
                                        <View style={styles.reactionsContainer}>
                                            {groupReactions(message.reactions).map((reactionGroup, index) => {
                                                const reactionKey = `${message.id}-${reactionGroup.emoji}`;
                                                const animatedValue = reactionAnimations[reactionKey] || new Animated.Value(1);
                                                if (!reactionAnimations[reactionKey]) {
                                                    reactionAnimations[reactionKey] = animatedValue;
                                                }

                                                return (
                                                    <TouchableOpacity
                                                        key={`${reactionGroup.emoji}-${index}`}
                                                        onPress={() => handleReactionPress(message, reactionGroup.emoji)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Animated.View
                                                            style={[
                                                                styles.reactionBubble,
                                                                reactionGroup.hasCurrentUser && styles.userReactionBubble,
                                                                { transform: [{ scale: animatedValue }] }
                                                            ]}
                                                        >
                                                            <Text style={styles.reactionEmoji}>
                                                                {reactionGroup.emoji}
                                                            </Text>
                                                            {reactionGroup.count > 1 && (
                                                                <Text style={[
                                                                    styles.reactionCount,
                                                                    reactionGroup.hasCurrentUser && styles.userReactionCount
                                                                ]}>
                                                                    {reactionGroup.count}
                                                                </Text>
                                                            )}
                                                        </Animated.View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                    </Swipeable>
                );
            });
    };

    return (
        <View style={styles.chatFeedWrapper}>
            <ScrollView
                style={styles.container}
                ref={scrollViewRef}>
                {renderMessages()}
            </ScrollView>
            {showEmojis && selectedMessage && (
                <TouchableOpacity
                    style={styles.emojiPickerContainer}
                    activeOpacity={1}
                    onPress={() => {
                        Animated.timing(scale, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }).start(() => {
                            setShowEmojis(false);
                            setSelectedMessage(null);
                        });
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Animated.View style={[styles.emojiPickerWithOptions, { transform: [{ scale }] }]}>
                            <View style={styles.emojiPicker}>
                                {EMOJI_OPTIONS.map((emoji, index) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        onPress={() => handleSelectEmoji(emoji)}
                                        activeOpacity={0.7}
                                    >
                                        <Animated.Text
                                            style={[
                                                styles.emoji,
                                                { transform: [{ scale: emojiScales[emoji] }] }
                                            ]}
                                        >
                                            {emoji}
                                        </Animated.Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Particle Effects */}
                    {reactionParticles.map((particle) => (
                        <Animated.View
                            key={particle.id}
                            style={[
                                styles.reactionParticle,
                                {
                                    left: particle.x,
                                    top: particle.y,
                                    opacity: particle.opacity,
                                    transform: [
                                        { scale: particle.scale },
                                        { translateY: particle.translateY }
                                    ]
                                }
                            ]}
                        >
                            <Text style={styles.particleEmoji}>{particle.emoji}</Text>
                        </Animated.View>
                    ))}
                </TouchableOpacity>
            )}
            {showOptions && selectedMessage && (() => {
                const now = new Date();
                const messageTime = selectedMessage.timeStamp.toDate();
                const diffInMinutes = (now - messageTime) / (1000 * 60);
                const isEditable = diffInMinutes <= 15;
                const isCurrentUser = selectedMessage.user.userId === user.uid;

                return (
                    <TouchableOpacity
                        style={styles.optionsOverlay}
                        activeOpacity={1}
                        onPress={hideOptionsMenu}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <Animated.View
                                style={[
                                    styles.optionsMenu,
                                    {
                                        position: 'absolute',
                                        left: optionsPosition.x,
                                        top: optionsPosition.y,
                                        transform: [
                                            { translateX: optionsSlideX },
                                            { scale: optionsScale }
                                        ],
                                        opacity: optionsOpacity,
                                    }
                                ]}
                            >
                                <View style={styles.optionsArrow} />

                                {/* Info option - available for all messages */}
                                <TouchableOpacity
                                    style={[styles.optionButton, { backgroundColor: COLORS.primary + '15' }]}
                                    onPress={handleShowMessageInfo}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
                                    <Text style={[styles.optionText, { color: COLORS.primary }]}>Info</Text>
                                </TouchableOpacity>



                                {/* Current user options */}
                                {isCurrentUser && (
                                    <>
                                        <View style={styles.optionSeparator} />
                                        <TouchableOpacity
                                            style={[styles.optionButton, { backgroundColor: COLORS.primary + '15' }]}
                                            onPress={() => {
                                                hideOptionsMenu();
                                                onReply(selectedMessage);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="arrow-undo-outline" size={18} color={COLORS.primary} />
                                            <Text style={[styles.optionText, { color: COLORS.primary }]}>Reply</Text>
                                        </TouchableOpacity>
                                        <View style={styles.optionSeparator} />
                                        <TouchableOpacity
                                            style={[
                                                styles.optionButton,
                                                !isEditable && styles.disabledOptionButton,
                                                { backgroundColor: isEditable ? COLORS.primary + '15' : 'transparent' }
                                            ]}
                                            onPress={handleEditMessage}
                                            disabled={!isEditable}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="create-outline" size={18} color={isEditable ? COLORS.primary : '#666'} />
                                            <Text style={[styles.optionText, { color: isEditable ? COLORS.primary : '#666' }]}>Edit</Text>
                                        </TouchableOpacity>
                                        <View style={styles.optionSeparator} />
                                        <TouchableOpacity
                                            style={[styles.optionButton, { backgroundColor: '#FFA50015' }]}
                                            onPress={handleDeleteForMe}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="eye-off-outline" size={18} color="#FFA500" />
                                            <Text style={[styles.optionText, { color: '#FFA500' }]}>Delete for Me</Text>
                                        </TouchableOpacity>
                                        <View style={styles.optionSeparator} />
                                        <TouchableOpacity
                                            style={[styles.optionButton, { backgroundColor: '#FF444415' }]}
                                            onPress={handleDeleteMessage}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#FF4444" />
                                            <Text style={[styles.optionText, { color: '#FF4444' }]}>Delete for Everyone</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* Delete for Me option - available for all messages */}
                                {!isCurrentUser && (
                                    <>
                                        <View style={styles.optionSeparator} />
                                        <TouchableOpacity
                                            style={[styles.optionButton, { backgroundColor: '#FFA50015' }]}
                                            onPress={handleDeleteForMe}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="eye-off-outline" size={18} color="#FFA500" />
                                            <Text style={[styles.optionText, { color: '#FFA500' }]}>Delete for Me</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                );
            })()}

            {/* Message Info Modal */}
            <MessageInfoModal
                visible={showMessageInfo}
                onClose={() => setShowMessageInfo(false)}
                message={messageInfoData}
                circleId={circleId}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    chatFeedWrapper: {
        flex: 1,
        position: 'relative',
    },
    emojiPickerContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)',
    },
    emojiPickerWithOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.dark,
        borderRadius: 30,
        padding: 15,
        ...SHADOWS.glassCard,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        justifyContent: 'center',
    },
    emojiPicker: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionsIconButton: {
        marginLeft: 15,
        padding: 10,
        borderRadius: 20,
        backgroundColor: COLORS.darker,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    emoji: {
        fontSize: 32,
        marginHorizontal: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    replyContainer: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: RADII.rounded,
        padding: 8,
        marginBottom: 5,
    },
    replyUser: {
        fontWeight: 'bold',
        color: COLORS.light,
    },
    replyTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    voiceReplyIcon: {
        marginRight: 4,
    },
    replyText: {
        color: COLORS.light,
        flex: 1,
    },
    replyAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        padding: 10,
    },
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        alignSelf: 'flex-start',
        gap: 6,
    },
    reactionBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.darker,
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.text + '20',
        minHeight: 28,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userReactionBubble: {
        backgroundColor: COLORS.primary + '20',
        borderColor: COLORS.primary + '60',
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    reactionEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    reactionCount: {
        fontSize: 12,
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontWeight: '600',
        minWidth: 12,
        textAlign: 'center',
    },
    userReactionCount: {
        color: COLORS.primary,
    },
    reactionParticle: {
        position: 'absolute',
        zIndex: 1000,
        pointerEvents: 'none',
    },
    particleEmoji: {
        fontSize: 24,
        textShadowColor: COLORS.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    messageContainer: {
        marginVertical: 5,
        marginBottom: 15,
        maxWidth: '80%',
    },
    currentUserMessageContainer: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    otherUserMessageContainer: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    senderInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    senderName: {
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 12,
    },
    messageBubble: {
        padding: 15,
        borderRadius: RADII.rounded,
        ...SHADOWS.card,
    },
    currentUserBubble: {
        backgroundColor: COLORS.accent,
    },
    otherUserBubble: {
        backgroundColor: '#333',
    },
    messageText: {
        color: COLORS.light,
        fontFamily: FONTS.body,
    },
    messageTimestamp: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    currentUserTimestamp: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    otherUserTimestamp: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    systemMessageContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    systemMessageText: {
        color: COLORS.text,
        fontSize: 12,
        fontStyle: 'italic',
        fontFamily: FONTS.body,
    },
    optionsOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        zIndex: 1000,
        elevation: 20,
        backdropFilter: 'blur(1px)',
    },
    optionsMenu: {
        backgroundColor: COLORS.dark,
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 4,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        minWidth: 100,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    optionsArrow: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        marginLeft: -6,
        width: 0,
        height: 0,
        borderTopWidth: 6,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopColor: COLORS.dark,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    optionsArrowLeft: {
        // Arrow pointing down - same for both sides since menu is above
    },
    optionsArrowRight: {
        // Arrow pointing down - same for both sides since menu is above
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    disabledOptionButton: {
        opacity: 0.5,
    },
    optionText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.light,
        fontWeight: '500',
    },
    disabledOptionText: {
        color: '#ccc',
    },
    optionSeparator: {
        height: 1,
        backgroundColor: COLORS.text + '30',
        marginHorizontal: 8,
        marginVertical: 4,
    },
    editInput: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        color: '#000',
        marginBottom: 10,
    },
    editButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',

    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 8,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
    },
    editedText: {
        color: '#aaa',
        fontSize: 10,
        fontStyle: 'italic',
        alignSelf: 'flex-start',
        marginTop: 2,
    },

    // Media Message Styles
    mediaMessageContainer: {
        position: 'relative',
    },
    messageImage: {
        maxWidth: 250,
        borderRadius: RADII.medium,
        marginBottom: 4,
    },
    videoPlayerContainer: {
        maxWidth: 250,
        minWidth: 150,
        minHeight: 100,
    },
    mediaTimestamp: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
});

export default ChatFeed;