import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS, FONTS } from '../../../constants/constants';

const ProfileActions = ({ isFollowed, onFollow, buttonScale }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const styles = getStyles(width, isLandscape);

    return (
        <View style={styles.buttonsContainer}>
            {/* Enhanced Follow/Connect Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={[
                        styles.followButton,
                        isFollowed ? styles.followedButton : styles.unfollowedButton
                    ]}
                    onPress={onFollow}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name={isFollowed ? "person-remove" : "person-add"}
                        size={isLandscape ? 18 : 20}
                        color={COLORS.light}
                        style={styles.buttonIcon}
                    />
                    <Text style={[styles.buttonText, isLandscape && styles.buttonTextLandscape]}>
                        {isFollowed ? 'Connected' : 'Connect'}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Message Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={[styles.messageButton, styles.glassmorphicButton]}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name="message"
                        size={isLandscape ? 18 : 20}
                        color={COLORS.primary}
                        style={styles.buttonIcon}
                    />
                    <Text style={[styles.messageButtonText, isLandscape && styles.buttonTextLandscape]}>
                        Message
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* More Options Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={[styles.moreButton, styles.glassmorphicButton]}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name="more-horiz"
                        size={isLandscape ? 20 : 24}
                        color={COLORS.text}
                    />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const getStyles = (width, isLandscape) => StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        width: width * 0.9,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isLandscape ? 15 : 20,
        paddingHorizontal: 20,
    },
    followButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isLandscape ? 10 : 12,
        paddingHorizontal: isLandscape ? 16 : 20,
        borderRadius: RADII.pill,
        flex: 1,
        marginRight: 10,
        borderWidth: 2,
    },
    unfollowedButton: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOWS.btnPrimary,
    },
    followedButton: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
        ...SHADOWS.btnSecondaryHover,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isLandscape ? 10 : 12,
        paddingHorizontal: isLandscape ? 16 : 20,
        borderRadius: RADII.pill,
        flex: 1,
        marginRight: 10,
    },
    moreButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isLandscape ? 10 : 12,
        paddingHorizontal: isLandscape ? 12 : 14,
        borderRadius: RADII.circle,
        width: isLandscape ? 44 : 48,
        height: isLandscape ? 44 : 48,
    },
    glassmorphicButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...SHADOWS.card,
    },
    buttonIcon: {
        marginRight: 6,
    },
    buttonText: {
        color: COLORS.light,
        fontSize: isLandscape ? 14 : 16,
        fontFamily: FONTS.body,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    buttonTextLandscape: {
        fontSize: 14,
    },
    messageButtonText: {
        color: COLORS.primary,
        fontSize: isLandscape ? 14 : 16,
        fontFamily: FONTS.body,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default ProfileActions;
