import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../context/ThemeContext';

import PrivateGroupPollCard from '../components/PrivateGroupPollCard';
import DiscoveryConnectionCard from '../components/DiscoveryConnectionCard';
import UnreadChatMessageCard from '../components/UnreadChatMessageCard';
import MemoryPromptCard from '../components/MemoryPromptCard';
import EmptyState from '../components/EmptyState';
import StandardHeader from '../components/StandardHeader';

const HomeScreen = () => {
  const userName = "User"; // Placeholder for user's name
  const navigation = useNavigation();
  const { t } = useLocalization();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        title={t('navigation.home')}
        navigation={navigation}
      />
      <ScrollView style={styles.feedContainer}>
        {/* Render cards based on logic, for now, just placeholders */}
        <EmptyState userName={userName} />
        <PrivateGroupPollCard />
        <DiscoveryConnectionCard />
        <UnreadChatMessageCard />
        <MemoryPromptCard />

        <TouchableOpacity
          style={[styles.createCircleButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreationForm')}
        >
          <Text style={[styles.createCircleButtonText, { color: colors.onPrimary }]}>
            {t('circles.createCircle')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity
        style={[styles.circleScreenButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CircleScreen')}
      >
        <Text style={[styles.circleScreenButtonText, { color: colors.onPrimary }]}>
          {t('navigation.circles')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedContainer: {
    flex: 1,
    padding: 10,
  },
  createCircleButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  createCircleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  circleScreenButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  circleScreenButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;