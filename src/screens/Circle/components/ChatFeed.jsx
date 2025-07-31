import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import useAuth from '../../../hooks/useAuth';
import { COLORS, RADII, FONTS } from '../../../constants/constants';
import { Swipeable } from 'react-native-gesture-handler';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const ChatFeed = ({ circleId, onReply }) => {
    const [messages, setMessages] = useState([]);
    const { user } = useAuth();
    const scrollViewRef = useRef();
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showEmojis, setShowEmojis] = useState(false);
    const scale = useRef(new Animated.Value(0)).current;

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

        return () => unsubscribe();
    }, [circleId]);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);


    const handleLongPress = (message) => {
        setSelectedMessage(message);
        setShowEmojis(true);
        Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
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

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderRelease: () => {
                setShowEmojis(false);
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

            const renderRightActions = (progress, dragX) => {
                const trans = dragX.interpolate({
                    inputRange: [0, 50, 100, 101],
                    outputRange: [0, 0, 0, 1],
                });
                return (
                    <TouchableOpacity onPress={() => onReply(message)} style={styles.replyAction}>
                        <Animated.Text
                            style={[
                                styles.actionText,
                                {
                                    transform: [{ translateX: trans }],
                                },
                            ]}>
                            Reply
                        </Animated.Text>
                    </TouchableOpacity>
                );
            };

            return (
                <Swipeable key={message.id} renderRightActions={renderRightActions}>
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
            <ScrollView style={styles.container} ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
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
});

export default ChatFeed;