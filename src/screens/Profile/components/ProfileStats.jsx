import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FONTS, RADII, SHADOWS } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

const ProfileStats = ({
    connections,
    circles,
    location = "Obour, Cairo",
    shimmerAnimation,
    loading,
    onConnectionsPress,
    onCirclesPress,
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
            <View style={[styles.container, dynamicStyles.container]}>
                <View style={styles.statsContainer}>
                    {[1, 2].map((item) => (
                        <View key={item} style={styles.statItem}>
                            <View style={[styles.statNumberSkeleton, dynamicStyles.statNumberSkeleton]}>
                                <Animated.View
                                    style={[
                                        styles.shimmerOverlay,
                                        { transform: [{ translateX: shimmerTranslate }] },
                                    ]}
                                />
                            </View>
                            <View style={[styles.statLabelSkeleton, dynamicStyles.statLabelSkeleton]}>
                                <Animated.View
                                    style={[
                                        styles.shimmerOverlay,
                                        { transform: [{ translateX: shimmerTranslate }] },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>
                <View style={[styles.locationSkeleton, dynamicStyles.locationSkeleton]}>
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
        <View style={[styles.container, dynamicStyles.container]}>
            {/* Enhanced Stats Container */}
            <View style={styles.statsContainer}>
                <TouchableOpacity
                    style={[styles.statItem, styles.glassmorphicStat]}
                    onPress={onConnectionsPress}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
                        {connections || 0}
                    </Text>
                    <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
                        Connections
                    </Text>
                    <View style={styles.statIndicator} />
                </TouchableOpacity>

                <View style={styles.statDivider} />

                <TouchableOpacity
                    style={[styles.statItem, styles.glassmorphicStat]}
                    onPress={onCirclesPress}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
                        {circles || 0}
                    </Text>
                    <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
                        Circles
                    </Text>
                    <View style={styles.statIndicator} />
                </TouchableOpacity>

            </View>

            {/* Enhanced Location Container */}
            <View style={[styles.locationContainer, dynamicStyles.locationContainer]}>
                <View style={styles.locationIconContainer}>
                    <MaterialIcons
                        name="location-on"
                        size={isLandscape ? 16 : 18}
                        color={colors.primary}
                    />
                </View>
                <Text style={[styles.locationText, dynamicStyles.locationText]}>
                    {location}
                </Text>
            </View>


        </View>
    );
};

const getResponsiveStyles = (isLandscape) => ({
    container: {
        marginBottom: isLandscape ? 15 : 20,
    },
    statNumber: {
        fontSize: isLandscape ? 18 : 22,
    },
    statLabel: {
        fontSize: isLandscape ? 10 : 11,
    },
    locationContainer: {
        marginBottom: isLandscape ? 8 : 12,
    },
    locationText: {
        fontSize: isLandscape ? 14 : 16,
    },

    statNumberSkeleton: {
        width: isLandscape ? 35 : 40,
        height: isLandscape ? 20 : 24,
    },
    statLabelSkeleton: {
        width: isLandscape ? 50 : 60,
        height: isLandscape ? 14 : 16,
    },
    locationSkeleton: {
        width: isLandscape ? 100 : 120,
        height: isLandscape ? 18 : 20,
    },
});

const getStyles = (colors) => StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        position: 'relative',
    },
    glassmorphicStat: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: RADII.rounded,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 8,
    },
    statNumber: {
        color: colors.text,
        fontFamily: FONTS.heading,
        fontWeight: '700',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    statLabel: {
        color: colors.textSecondary,
        fontFamily: FONTS.body,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.2,
        opacity: 0.8,
        fontSize: 11,
    },
    statIndicator: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        width: 30,
        height: 2,
        backgroundColor: colors.primary,
        borderRadius: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: RADII.pill,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    locationIconContainer: {
        marginRight: 8,
        padding: 2,
    },
    locationText: {
        color: colors.textSecondary,
        fontFamily: FONTS.body,
        fontWeight: '500',
        opacity: 0.9,
    },

    // Skeleton styles
    statNumberSkeleton: {
        backgroundColor: colors.surface,
        borderRadius: RADII.small,
        marginBottom: 5,
        overflow: 'hidden',
    },
    statLabelSkeleton: {
        backgroundColor: colors.surface,
        borderRadius: RADII.small,
        overflow: 'hidden',
    },
    locationSkeleton: {
        backgroundColor: colors.surface,
        borderRadius: RADII.pill,
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

export default ProfileStats;