import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { COLORS, RADII, FONTS } from '../../../constants/constants';

const ChatFeed = () => {
    // Dummy data for chat messages
    const messages = [
        { id: 1, type: 'system', text: 'You joined the circle.' },
        { id: 2, sender: 'John Doe', text: 'Hey everyone! What is up?', isCurrentUser: false, avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { id: 3, sender: 'John Doe', text: 'This is a new message from me.', isCurrentUser: false },
        { id: 4, text: 'Hey John! Welcome to the circle.', isCurrentUser: true },
        { id: 5, type: 'system', text: 'Jane Doe joined the circle.' },
        { id: 6, sender: 'Jane Doe', text: 'Hi all!', isCurrentUser: false, avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    ];

    const renderMessages = () => {
        let lastSender = null;
        return messages.map((message, index) => {
            if (message.type === 'system') {
                return (
                    <View key={message.id} style={styles.systemMessageContainer}>
                        <Text style={styles.systemMessageText}>{message.text}</Text>
                    </View>
                );
            }

            const showSenderInfo = message.sender !== lastSender;
            lastSender = message.sender;

            return (
                <View key={message.id} style={[styles.messageContainer, message.isCurrentUser ? styles.currentUserMessageContainer : styles.otherUserMessageContainer]}>
                    {!message.isCurrentUser && showSenderInfo && (
                        <View style={styles.senderInfoContainer}>
                            {message.avatar && <Image source={{ uri: message.avatar }} style={styles.avatar} />}
                            <Text style={styles.senderName}>{message.sender}</Text>
                        </View>
                    )}
                    <View style={[styles.messageBubble, message.isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
                        <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                </View>
            );
        });
    };

    return (
        <ScrollView style={styles.container}>
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