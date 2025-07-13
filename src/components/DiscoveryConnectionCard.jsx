import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const DiscoveryConnectionCard = () => (
  <View style={[styles.card, styles.discoveryCard]}>
    <Text style={styles.discoveryHeadline}>Your Connection, Alex, just joined an event!</Text>
    <Text style={styles.eventTitle}>Public Event: Sunset Yoga in the Park</Text>
    <Text style={styles.eventDateTime}>This Friday at 6:30 PM</Text>
    <View style={styles.hostContainer}>
      <Image source={{ uri: 'https://via.placeholder.com/20' }} style={styles.hostAvatar} />
      <Text style={styles.hostName}>Hosted by Sarah</Text>
    </View>
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionButton}><Text>View Event Details</Text></TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}><Text>Join Them!</Text></TouchableOpacity>
    </View>
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
  discoveryCard: {
    backgroundColor: '#e0f7fa', // Light blue gradient effect
  },
  discoveryHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#00796B',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hostAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  hostName: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default DiscoveryConnectionCard;