import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const UnreadChatMessageCard = () => (
  <View style={[styles.card, styles.chatCard]}>
    <View style={styles.cardHeader}>
      <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.groupProfilePic} />
      <Text style={styles.cardHeaderText}>Board Game Geeks</Text>
      <View style={styles.unreadDot} />
    </View>
    <View style={styles.messageSnippet}>
      <Image source={{ uri: 'https://via.placeholder.com/20' }} style={styles.senderAvatar} />
      <Text style={styles.senderName}>David:</Text>
      <Text>That was a great game last night!</Text>
    </View>
    <View style={styles.messageSnippet}>
      <Image source={{ uri: 'https://via.placeholder.com/20' }} style={styles.senderAvatar} />
      <Text style={styles.senderName}>Maya:</Text>
      <Text>Totally! We have to play Catan again soon.</Text>
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
  chatCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#ADD8E6', // Light blue for unread
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'blue',
    marginLeft: 'auto',
  },
  messageSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  senderAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  senderName: {
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export default UnreadChatMessageCard;