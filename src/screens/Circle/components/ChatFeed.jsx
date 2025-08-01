import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Animated, PanResponder, Keyboard, Alert } from 'react-native';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import useAuth from '../../../hooks/useAuth';
import { COLORS, RADII, FONTS } from '../../../constants/constants';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
// import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';


const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const ChatFeed = ({ circleId, onReply }) => {
    const [messages, setMessages] = useState([]);
    const { user } = useAuth();
    const scrollViewRef = useRef();
    const swipeableRefs = useRef({});
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showEmojis, setShowEmojis] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const scale = useRef(new Animated.Value(0)).current;
    const optionsScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!circleId) return;

        const q = query(collection(db, 'circles', circleId, 'chat'), orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = [];
            querySnapshot.forEach((doc) => {
                messagesData.push({ id: doc.id, ...doc.data() });
            });
            setMessages(messagesData);
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



    const handleLongPress = (message) => {
        setSelectedMessage(message);
        const isCurrentUser = message.user.userId === user.uid;

        if (isCurrentUser) {
            // Show options menu for current user's messages
            setShowOptions(true);
            Animated.spring(optionsScale, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }).start();
        } else {
            // Show emoji reactions for other users' messages
            setShowEmojis(true);
            Animated.spring(scale, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }).start();
        }
    };

    const handleSelectEmoji = async (emoji) => {
        if (!selectedMessage) return;

        const messageRef = doc(db, 'circles', circleId, 'chat', selectedMessage.id);
        const reaction = {
            emoji,
            userId: user.uid,
            userName: user.displayName,
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
        setShowEmojis(false);
        setSelectedMessage(null);
    };

    const handleEditMessage = () => {
        // TODO: Implement edit functionality
        // For now, just close the options menu
        setShowOptions(false);
        setSelectedMessage(null);
        Alert.alert('Edit Message', 'Edit functionality will be implemented soon');
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessage) return;

        Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        setShowOptions(false);
                        setSelectedMessage(null);
                    }
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'circles', circleId, 'chat', selectedMessage.id));
                            setShowOptions(false);
                            setSelectedMessage(null);
                        } catch (error) {
                            console.error('Error deleting message:', error);
                            Alert.alert('Error', 'Failed to delete message');
                        }
                    }
                }
            ]
        );
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderRelease: () => {
                setShowEmojis(false);
                setShowOptions(false);
                setSelectedMessage(null);
            },
        })
    ).current;

    const renderMessages = () => {
        let lastSender = null;
        return messages.map((message) => {
            if (message.type === 'system') {
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
                const scale = dragX.interpolate({
                    inputRange: [0, 80],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                });
                return (
                    <View style={styles.replyAction}>
                        <Animated.Text style={[styles.actionText, { transform: [{ scale }], fontSize: 18 }]}>
                            ↩️
                        </Animated.Text>
                    </View>
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
                    onSwipeableLeftOpen={() => {
                        onReply(message);
                        if (swipeableRefs.current[message.id]) {
                            swipeableRefs.current[message.id].close();
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
                        <TouchableOpacity onLongPress={() => handleLongPress(message)} delayLongPress={200}>
                            <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
                                {message.replyingTo && (
                                    <View style={styles.replyContainer}>
                                        <Text style={styles.replyUser}>{message.replyingTo.userName}</Text>
                                        <Text style={styles.replyText} numberOfLines={1}>{message.replyingTo.text}</Text>
                                    </View>
                                )}
                                <Text style={styles.messageText}>{message.text}</Text>
                                {message.reactions && message.reactions.length > 0 && (
                                    <View style={styles.reactionsContainer}>
                                        {message.reactions.map((reaction, index) => (
                                            <Text key={index} style={styles.reactionText}>
                                                {reaction.emoji}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </Swipeable>
            );
        });
    };

    return (
        <>
            <ScrollView
                style={styles.container}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                onLayout={() => scrollViewRef.current.scrollToEnd({ animated: false })}>
                {renderMessages()}
            </ScrollView>
            {showEmojis && selectedMessage && (
                <View style={styles.emojiPickerContainer} {...panResponder.panHandlers}>
                    <Animated.View style={[styles.emojiPicker, { transform: [{ scale }] }]}>
                        {EMOJI_OPTIONS.map((emoji) => (
                            <TouchableOpacity key={emoji} onPress={() => handleSelectEmoji(emoji)}>
                                <Text style={styles.emoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </View>
            )}
            {showOptions && selectedMessage && (
                <View style={styles.optionsContainer} {...panResponder.panHandlers}>
                    <Animated.View style={[styles.optionsMenu, { transform: [{ scale: optionsScale }] }]}>
                        <TouchableOpacity style={styles.optionButton} onPress={handleEditMessage}>
                            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.optionText}>Edit</Text>
                        </TouchableOpacity>
                        <View style={styles.optionSeparator} />
                        <TouchableOpacity style={styles.optionButton} onPress={handleDeleteMessage}>
                            <Ionicons name="trash-outline" size={24} color="#FF4444" />
                            <Text style={[styles.optionText, { color: '#FF4444' || '#FF4444' }]}>Delete</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    emojiPickerContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    emojiPicker: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        elevation: 10,
    },
    emoji: {
        fontSize: 30,
        marginHorizontal: 5,
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
    replyText: {
        color: COLORS.light,
    },
    replyAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        marginHorizontal: 20,
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
        marginTop: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 5,
        alignSelf: 'flex-start',
    },
    reactionText: {
        marginRight: 5,
        fontSize: 16,
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
    optionsContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    optionsMenu: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        minWidth: 120,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionText: {
        marginLeft: 12,
        fontSize: 16,
        fontFamily: FONTS.body,
        color: COLORS.text,
    },
    optionSeparator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 8,
    },
});

export default ChatFeed;