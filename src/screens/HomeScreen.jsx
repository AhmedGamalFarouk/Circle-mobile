import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import PrivateGroupPollCard from '../components/PrivateGroupPollCard';
import DiscoveryConnectionCard from '../components/DiscoveryConnectionCard';
import UnreadChatMessageCard from '../components/UnreadChatMessageCard';
import MemoryPromptCard from '../components/MemoryPromptCard';
import EmptyState from '../components/EmptyState';

const HomeScreen = () => {
  const userName = "User"; // Placeholder for user's name
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.feedContainer}>
        {/* Render cards based on logic, for now, just placeholders */}
        <EmptyState userName={userName} />
        <PrivateGroupPollCard />
        <DiscoveryConnectionCard />
        <UnreadChatMessageCard />
        <MemoryPromptCard />



        <TouchableOpacity
          style={styles.createCircleButton}
          onPress={() => navigation.navigate('CreationForm')}
        >
          <Text style={styles.createCircleButtonText}>Create a new circle</Text>
        </TouchableOpacity>
      </ScrollView>
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
  createCircleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  createCircleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;