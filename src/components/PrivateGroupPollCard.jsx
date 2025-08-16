import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const PrivateGroupPollCard = ({
  poll,
  onVote,
  onAddOption,
  userVote,
  totalVotes = 0,
  isActive = true,
  showResults = false
}) => {
  const { colors } = useTheme();
  const [animatedValues] = useState(
    poll?.options?.map(() => new Animated.Value(0)) || []
  );
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (showResults && poll?.options) {
      poll.options.forEach((option, index) => {
        const percentage = totalVotes > 0 ? (option.votes || 0) / totalVotes : 0;
        Animated.timing(animatedValues[index], {
          toValue: percentage,
          duration: 800,
          delay: index * 100,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [showResults, poll?.options, totalVotes]);

  const getTimeRemaining = () => {
    if (!poll?.deadline) return 'No deadline';

    const now = new Date();
    const deadline = poll.deadline.toDate ? poll.deadline.toDate() : new Date(poll.deadline);
    const diff = deadline - now;

    if (diff <= 0) return 'Poll ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const handleVote = (option) => {
    if (!isActive || userVote === option.text) return;
    onVote?.(option.text);
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.card}>
      <View
        style={[styles.gradientBackground, { backgroundColor: colors.surface }]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.pollIconContainer}>
            <Ionicons name="bar-chart" size={20} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.cardHeaderText}>
              {poll?.type === 'activity' ? 'Activity Poll' : 'Place Poll'}
            </Text>
            <Text style={styles.timeRemaining}>{getTimeRemaining()}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {isActive ? 'Active' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Question */}
        <Text style={styles.pollQuestion}>{poll?.question}</Text>

        {/* Initiator Info */}
        <View style={styles.pollMeta}>
          <Text style={styles.pollInitiator}>
            Started by {poll?.createdBy || 'Admin'}
          </Text>
          <Text style={styles.voteCount}>
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.pollOptions}>
          {poll?.options?.map((option, index) => {
            const isSelected = userVote === option.text;
            const votePercentage = totalVotes > 0 ? (option.votes || 0) / totalVotes : 0;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pollOptionButton,
                  isSelected && styles.selectedOption,
                  !isActive && styles.disabledOption
                ]}
                onPress={() => handleVote(option)}
                disabled={!isActive}
              >
                {showResults && (
                  <Animated.View
                    style={[
                      styles.resultBar,
                      {
                        width: animatedValues[index]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }) || '0%',
                      }
                    ]}
                  />
                )}

                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {option.text}
                  </Text>

                  {showResults && (
                    <View style={styles.resultInfo}>
                      <Text style={styles.votePercentage}>
                        {Math.round(votePercentage * 100)}%
                      </Text>
                      <Text style={styles.voteCount}>
                        {option.votes || 0}
                      </Text>
                    </View>
                  )}

                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Option Button */}
        {isActive && poll?.allowNewOptions && (
          <TouchableOpacity
            style={styles.addOptionButton}
            onPress={() => setShowAddOption(!showAddOption)}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.addOptionText}>Add Option</Text>
          </TouchableOpacity>
        )}

        {/* Footer Actions */}
        <View style={styles.footer}>
          {userVote && (
            <View style={styles.userVoteIndicator}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.userVoteText}>You voted for "{userVote}"</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientBackground: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pollIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  cardHeaderText: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  timeRemaining: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  pollQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  pollMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pollInitiator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  voteCount: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  pollOptions: {
    marginBottom: 16,
  },
  pollOptionButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  disabledOption: {
    opacity: 0.6,
  },
  resultBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary + '20',
    zIndex: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 2,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  resultInfo: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  votePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  userVoteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userVoteText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
});

export default PrivateGroupPollCard;