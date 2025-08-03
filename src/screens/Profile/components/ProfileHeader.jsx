import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, useWindowDimensions, Platform, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADII, SHADOWS } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

const ProfileHeader = ({ navigation, isOwnProfile, isEditing, onSave, onEdit, buttonScale }) => {
    const { colors } = useTheme()
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isLandscape = width > height;

    const handleBackPress = () => {
        // Haptic feedback
        if (Platform.OS === 'ios') {
            Vibration.vibrate(10);
        } else {
            Vibration.vibrate(30);
        }
        navigation.goBack();
    };

    const handleSettingsPress = () => {
        // Haptic feedback
        if (Platform.OS === 'ios') {
            Vibration.vibrate(10);
        } else {
            Vibration.vibrate(30);
        }
        navigation.navigate('Settings');
    };

    const handleEditSavePress = () => {
        // Enhanced haptic feedback for save/edit
        if (Platform.OS === 'ios') {
            Vibration.vibrate(isEditing ? [10, 50, 10] : 10);
        } else {
            Vibration.vibrate(isEditing ? 100 : 30);
        }
        isEditing ? onSave() : onEdit();
    };

    const styles = getStyles(insets, isLandscape);

    return (
        <View style={styles.headerIcons}>
            {/* Enhanced Back Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    onPress={handleBackPress}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                >
                    <View style={[styles.glassmorphicIcon, { backgroundColor: colors.background }]}>
                        <Ionicons
                            name="arrow-back"
                            size={isLandscape ? 20 : 24}
                            color={colors.text}
                        />
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Enhanced Right Icons */}
            <View style={styles.rightIcons}>
                {isOwnProfile && (
                    <>
                        {/* Settings Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                onPress={handleSettingsPress}
                                style={styles.iconButton}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.glassmorphicIcon, { backgroundColor: colors.background }]}>
                                    <Ionicons
                                        name="settings-outline"
                                        size={isLandscape ? 20 : 24}
                                        color={colors.text}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Edit/Save Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                onPress={handleEditSavePress}
                                style={styles.iconButton}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.glassmorphicIcon,
                                    isEditing && styles.saveButtonActive,
                                    { backgroundColor: colors.background }
                                ]}>
                                    <Ionicons
                                        name={isEditing ? "checkmark-circle-outline" : "create-outline"}
                                        size={isLandscape ? 20 : 24}
                                        color={isEditing ? colors.accent : colors.text}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Share Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.glassmorphicIcon, { backgroundColor: colors.background }]}>
                                    <Ionicons
                                        name="share-outline"
                                        size={isLandscape ? 20 : 24}
                                        color={colors.text}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </>
                )}
            </View>
        </View>
    );
};

const getStyles = (insets, isLandscape) => StyleSheet.create({
    headerIcons: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: isLandscape ? 10 : 12,
    },
    glassmorphicIcon: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: RADII.circle,
        padding: isLandscape ? 8 : 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...SHADOWS.card,
        // Enhanced glassmorphism effect
        backdropFilter: 'blur(10px)',
    },
    saveButtonActive: {
        backgroundColor: 'rgba(0, 201, 177, 0.2)',
        borderColor: COLORS.accent,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default ProfileHeader;