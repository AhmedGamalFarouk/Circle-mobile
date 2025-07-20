import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const MemoryPromptCard = () => (
  <View style={[styles.card, styles.memoryCard]}>
    <Text style={styles.memoryQuestion}>How was dinner at Mike's Pizzeria?</Text>
    <Text style={styles.memoryCallToAction}>Your event album is ready. Add your photos and see the Story Reel come to life!</Text>
    <TouchableOpacity style={styles.memoryButton}><Text>+ Add Your Photos</Text></TouchableOpacity>
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
  memoryCard: {
    backgroundColor: '#FFF9C4', // Light yellow for memory
  },
  memoryQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memoryCallToAction: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  memoryButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
});

export default MemoryPromptCard;