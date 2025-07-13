import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const EmptyState = ({ userName }) => (
  <View style={styles.emptyStateContainer}>
    <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.emptyStateIllustration} />
    <Text style={styles.welcomeMessage}>Welcome to Circle, {userName}!</Text>
    <TouchableOpacity style={styles.emptyStateActionButton}><Text>Find your friends by syncing your contacts.</Text></TouchableOpacity>
    <TouchableOpacity style={styles.emptyStateActionButton}><Text>Create your first Circle and invite your friends.</Text></TouchableOpacity>
    <TouchableOpacity style={styles.emptyStateActionButton}><Text>Or, explore public events in the Discovery Hub.</Text></TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateIllustration: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  welcomeMessage: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateActionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
});

export default EmptyState;