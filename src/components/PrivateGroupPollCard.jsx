import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const PrivateGroupPollCard = () => (
  <View style={[styles.card, styles.pollCard]}>
    <View style={styles.cardHeader}>
      <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.groupProfilePic} />
      <Text style={styles.cardHeaderText}>The Weekend Crew has a new poll.</Text>
    </View>
    <Text style={styles.pollQuestion}>What should we do this Saturday?</Text>
    <Text style={styles.pollInitiator}>Started by Maria • Ends in 12 hours</Text>
    <View style={styles.pollOptions}>
      <TouchableOpacity style={styles.pollOptionButton}><Text>Dinner</Text></TouchableOpacity>
      <TouchableOpacity style={styles.pollOptionButton}><Text>Bowling</Text></TouchableOpacity>
      <TouchableOpacity style={styles.pollOptionButton}><Text>Hike</Text></TouchableOpacity>
    </View>
    <Text style={styles.aiSuggestion}>AI Suggestion</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  cardHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  pollCard: {
    borderTopWidth: 5,
    borderTopColor: '#4CAF50', // Example accent color
  },
  pollQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pollInitiator: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  pollOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  pollOptionButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  aiSuggestion: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'right',
  },
});

export default PrivateGroupPollCard;