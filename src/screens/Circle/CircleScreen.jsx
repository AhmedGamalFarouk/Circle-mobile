import React from 'react';
import { View, StyleSheet } from 'react-native';
import CircleHeader from './components/CircleHeader';
import ContextualPin from './components/ContextualPin';
import ChatFeed from './components/ChatFeed';
import ChatInputBar from './components/ChatInputBar';
import { COLORS } from '../../constants/constants';

const CircleScreen = () => {
    return (
        <View style={styles.container}>
            <CircleHeader />
            <ContextualPin state="active-poll" />
            <View style={styles.chatFeedContainer}>
                <ChatFeed />
            </View>
            <ChatInputBar />
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