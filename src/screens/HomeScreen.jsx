import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import Header from '../components/Header';
import PrivateGroupPollCard from '../components/PrivateGroupPollCard';
import DiscoveryConnectionCard from '../components/DiscoveryConnectionCard';
import UnreadChatMessageCard from '../components/UnreadChatMessageCard';
import MemoryPromptCard from '../components/MemoryPromptCard';
import EmptyState from '../components/EmptyState';
import BottomNavBar from '../components/BottomNavBar';

const HomeScreen = () => {
  const userName = "User"; // Placeholder for user's name

  return (
    <View style={styles.container}>
      {/* <Header /> */}
      <ScrollView style={styles.feedContainer}>
        {/* Render cards based on logic, for now, just placeholders */}
        <PrivateGroupPollCard />
        <DiscoveryConnectionCard />
        <UnreadChatMessageCard />
        <MemoryPromptCard />
        <EmptyState userName={userName} />
        <MemoryPromptCard />

      </ScrollView>
      {/* <BottomNavBar /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  feedContainer: {
    flex: 1,
    padding: 10,
  },
});

export default HomeScreen;