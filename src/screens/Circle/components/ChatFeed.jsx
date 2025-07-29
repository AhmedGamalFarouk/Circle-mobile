import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import useAuth from '../../../hooks/useAuth';
import { COLORS, RADII, FONTS } from '../../../constants/constants';

const ChatFeed = ({ circleId }) => {
    const [messages, setMessages] = useState([]);
    const { user } = useAuth();
    const scrollViewRef = useRef();

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

            return (
                <View key={message.id} style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessageContainer : styles.otherUserMessageContainer]}>
                    {!isCurrentUser && showSenderInfo && (
                        <View style={styles.senderInfoContainer}>
                            {message.user.imageurl && <Image source={{ uri: message.user.imageurl }} style={styles.avatar} />}
                            <Text style={styles.senderName}>{message.user.userName}</Text>
                        </View>
                    )}
                    <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
                        <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                </View>
            );
        });
    };

    return (
        <ScrollView
            style={styles.container}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
            {renderMessages()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
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