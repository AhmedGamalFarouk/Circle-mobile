import React from 'react';
import { View, Text, TextInput, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { FONTS, RADII } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

const ProfileInfo = ({
    userName,
    userBio,
    isEditing,
    onUserNameChange,
    onUserBioChange,
    shimmerAnimation,
    loading
}) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isLandscape = screenWidth > screenHeight;
    const dynamicStyles = getResponsiveStyles(isLandscape);

    if (loading) {
        const shimmerTranslate = shimmerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-screenWidth, screenWidth],
        });

        return (
            <View style={[styles.profileInfo, dynamicStyles.profileInfo]}>
                <View style={[styles.userNameSkeleton, dynamicStyles.userNameSkeleton]}>
                    <Animated.View
                        style={[
                            styles.shimmerOverlay,
                            { transform: [{ translateX: shimmerTranslate }] },
                        ]}
                    />
                </View>
                <View style={[styles.userBioSkeleton, dynamicStyles.userBioSkeleton]}>
                    <Animated.View
                        style={[
                            styles.shimmerOverlay,
                            { transform: [{ translateX: shimmerTranslate }] },
                        ]}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.profileInfo, dynamicStyles.profileInfo]}>
            {/* Enhanced Username Display */}
            {isEditing ? (
                <TextInput
                    style={[styles.userNameInput, dynamicStyles.userNameInput]}
                    value={userName}
                    onChangeText={onUserNameChange}
                    autoFocus
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textSecondary}
                    selectionColor={colors.primary}
                />
            ) : (
                <Text style={[styles.userName, dynamicStyles.userName]} numberOfLines={1}>
                    {userName || 'Unknown User'}
                </Text>
            )}

            {/* Enhanced Bio Display */}
            {isEditing ? (
                <TextInput
                    style={[styles.userBioInput, dynamicStyles.userBioInput]}
                    value={userBio}
                    onChangeText={onUserBioChange}
                    multiline
                    numberOfLines={3}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor={colors.textSecondary}
                    selectionColor={colors.primary}
                    textAlignVertical="top"
                />
            ) : (
                <Text style={[styles.userBio, dynamicStyles.userBio]} numberOfLines={3} ellipsizeMode='tail'>
                    {userBio || 'No bio available'}
                </Text>
            )}


        </View>
    );
};

const getResponsiveStyles = (isLandscape) => ({
    profileInfo: {
        paddingTop: isLandscape ? 50 : 60,
    },
    userName: {
        fontSize: isLandscape ? 24 : 28,
    },
    userNameInput: {
        fontSize: isLandscape ? 24 : 28,
    },
    userBio: {
        fontSize: isLandscape ? 14 : 16,
        height: isLandscape ? 50 : 60,
    },
    userBioInput: {
        fontSize: isLandscape ? 14 : 16,
        height: isLandscape ? 50 : 60,
    },
    userNameSkeleton: {
        width: isLandscape ? 120 : 150,
        height: isLandscape ? 28 : 32,
    },
    userBioSkeleton: {
        width: isLandscape ? 160 : 200,
        height: isLandscape ? 50 : 60,
    },

});

const getStyles = (colors) => StyleSheet.create({
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
        width: '100%',
    },
    userName: {
        color: colors.text,
        fontFamily: FONTS.heading,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    userNameInput: {
        color: colors.text,
        fontFamily: FONTS.heading,
        fontWeight: '700',
        marginBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        width: '90%',
        textAlign: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: RADII.small,
    },
    userBio: {
        color: colors.textSecondary,
        fontFamily: FONTS.body,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 12,
        paddingHorizontal: 16,
        opacity: 0.9,
    },
    userBioInput: {
        color: colors.textSecondary,
        fontFamily: FONTS.body,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: RADII.rounded,
        width: '90%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        lineHeight: 20,
    },

    // Skeleton styles
    userNameSkeleton: {
        backgroundColor: colors.surface,
        borderRadius: RADII.small,
        marginBottom: 10,
        overflow: 'hidden',
    },
    userBioSkeleton: {
        backgroundColor: colors.surface,
        borderRadius: RADII.small,
        overflow: 'hidden',
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: [{ skewX: '-20deg' }],
    },
});

export default ProfileInfo;