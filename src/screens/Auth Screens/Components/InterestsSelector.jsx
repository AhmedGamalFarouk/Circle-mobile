import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, FONTS } from '../../../constants/constants';
import interests from '../../../data/interests';

const InterestsSelector = ({ selectedInterests, onInterestsChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleInterest = (interestValue) => {
        const updatedInterests = selectedInterests.includes(interestValue)
            ? selectedInterests.filter(item => item !== interestValue)
            : [...selectedInterests, interestValue];

        onInterestsChange(updatedInterests);
    };

    const renderInterestItem = (item, index) => {
        const isSelected = selectedInterests.includes(item.value);

        return (
            <TouchableOpacity
                key={item.value}
                style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected
                ]}
                onPress={() => toggleInterest(item.value)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.interestChipText,
                    isSelected && styles.interestChipTextSelected
                ]}>
                    {item.label}
                </Text>
                {isSelected && (
                    <Ionicons
                        name="checkmark"
                        size={16}
                        color={COLORS.light}
                        style={{ marginLeft: 4 }}
                    />
                )}
            </TouchableOpacity>
        );
    };

    const renderInterestsGrid = () => {
        const rows = [];
        for (let i = 0; i < interests.length; i += 2) {
            const leftItem = interests[i];
            const rightItem = interests[i + 1];

            rows.push(
                <View key={i} style={styles.row}>
                    {renderInterestItem(leftItem, i)}
                    {rightItem && renderInterestItem(rightItem, i + 1)}
                    {!rightItem && <View style={styles.interestChip} />}
                </View>
            );
        }
        return rows;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.inputContainer, isExpanded && styles.inputFocused]}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="heart-outline"
                    size={20}
                    color={isExpanded ? COLORS.primary : COLORS.text}
                    style={{ marginRight: 12 }}
                />
                <Text style={[styles.input, { paddingVertical: 18 }]}>
                    {selectedInterests.length > 0
                        ? `${selectedInterests.length} interests selected`
                        : "Select your interests"
                    }
                </Text>
                <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.text}
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.interestsContainer}>
                    <Text style={styles.interestsTitle}>Choose your interests (optional)</Text>
                    <ScrollView
                        style={styles.interestsList}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {renderInterestsGrid()}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = {
    container: {
        width: '100%',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 56,
        backgroundColor: COLORS.glass,
        borderRadius: RADII.rounded,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(197, 198, 199, 0.1)',
    },
    inputFocused: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    input: {
        flex: 1,
        color: COLORS.light,
        fontSize: 16,
        fontFamily: FONTS.body,
        paddingVertical: 0,
    },
    interestsContainer: {
        backgroundColor: COLORS.glass,
        borderRadius: RADII.rounded,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(197, 198, 199, 0.1)',
        maxHeight: 300,
        flex: 0,
    },
    interestsTitle: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: FONTS.body,
        marginBottom: 12,
        textAlign: 'center',
    },
    interestsList: {
        flexGrow: 0,
        flexShrink: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    interestChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(197, 198, 199, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: RADII.small,
        flex: 0.48,
        borderWidth: 1,
        borderColor: 'rgba(197, 198, 199, 0.2)',
    },
    interestChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    interestChipText: {
        color: COLORS.text,
        fontSize: 14,
        fontFamily: FONTS.body,
        textAlign: 'center',
        flex: 1,
    },
    interestChipTextSelected: {
        color: COLORS.light,
        fontWeight: '600',
    },
};

export default InterestsSelector;