import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FONTS, RADII, SHADOWS } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

const UserInterests = ({
    interests = [],
    isEditing = false,
    onAddInterest,
    onRemoveInterest,
    isOwnProfile = false
}) => {
    const { colors } = useTheme();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isLandscape = screenWidth > screenHeight;
    const styles = getStyles(colors, isLandscape);

    if (!isOwnProfile && (!interests || interests.length === 0)) {
        return null; // Don't show empty interests section for other users
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Interests</Text>
                {isOwnProfile && isEditing && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={onAddInterest}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons
                            name="add"
                            size={20}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.interestsContainer}>
                {interests.length > 0 ? (
                    interests.map((interest, index) => (
                        <View key={index} style={styles.interestTag}>
                            <Text style={styles.interestText}>
                                {typeof interest === 'string' ? interest : interest.label || interest.value || 'Interest'}
                            </Text>
                            {isEditing && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => onRemoveInterest(index)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={16}
                                        color={colors.text}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {isOwnProfile ? 'Add your interests to help others discover you' : 'No interests added yet'}
                        </Text>
                        {isOwnProfile && isEditing && (
                            <TouchableOpacity
                                style={styles.addFirstButton}
                                onPress={onAddInterest}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.addFirstButtonText}>Add Interest</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const getStyles = (colors, isLandscape) => StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: isLandscape ? 15 : 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: colors.text,
        fontSize: isLandscape ? 16 : 18,
        fontFamily: FONTS.heading,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    addButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: RADII.circle,
        padding: 6,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
    },
    interestTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADII.pill,
        marginBottom: 4,
        ...SHADOWS.card,
    },
    interestText: {
        color: colors.light,
        fontSize: isLandscape ? 12 : 13,
        fontFamily: FONTS.body,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    removeButton: {
        marginLeft: 6,
        padding: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: RADII.rounded,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
        width: '100%',
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: isLandscape ? 13 : 14,
        fontFamily: FONTS.body,
        textAlign: 'center',
        marginBottom: 12,
        opacity: 0.8,
    },
    addFirstButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADII.pill,
        ...SHADOWS.btnPrimary,
    },
    addFirstButtonText: {
        color: colors.light,
        fontSize: isLandscape ? 12 : 13,
        fontFamily: FONTS.body,
        fontWeight: '600',
    },
});

export default UserInterests;