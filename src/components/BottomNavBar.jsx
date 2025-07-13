import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNavBar = () => (
  <View style={styles.bottomNavBar}>
    <Ionicons name="home" size={24} color="blue" />
    <Ionicons name="people" size={24} color="gray" />
    <Ionicons name="add-circle" size={24} color="gray" />
    <Ionicons name="notifications" size={24} color="gray" />
    <Ionicons name="person" size={24} color="gray" />
  </View>
);

const styles = StyleSheet.create({
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
});

export default BottomNavBar;