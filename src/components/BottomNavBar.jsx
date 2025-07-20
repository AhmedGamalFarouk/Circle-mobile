import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/constants';

const BottomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const getIconColor = (screenName) => {
    return route.name === screenName ? COLORS.primary : COLORS.text;
  };

  return (
    <View style={styles.bottomNavBar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home" size={24} color={getIconColor('Home')} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Circle')}>
        <Ionicons name="people" size={24} color={getIconColor('Circle')} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Add pressed')}>
        <Ionicons name="add-circle" size={24} color={getIconColor('Add')} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Notifications pressed')}>
        <Ionicons
          name="notifications"
          size={24}
          color={getIconColor('Notifications')}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="person" size={24} color={getIconColor('Profile')} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark,
    backgroundColor: COLORS.darker,
  },
});

export default BottomNavBar;