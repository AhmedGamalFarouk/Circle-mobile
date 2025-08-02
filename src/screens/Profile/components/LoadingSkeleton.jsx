import React from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADII, SHADOWS } from '../../../constants/constants';

const LoadingSkeleton = ({ shimmerAnimation }) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isLandscape = screenWidth > screenHeight;

    const shimmerTranslate = shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenWidth, screenWidth],
    });

    const ShimmerEffect = ({ style }) => (
        <View style={[style, styles.shimmerContainer]}>
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    {
                        transform: [{ translateX: shimmerTranslate }],
                    },
                ]}
            />
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Cover Image Skeleton */}
            <ShimmerEffect
                style={[
                    styles.coverImageSkeleton,
                    { height: isLandscape ? screenHeight * 0.5 : screenHeight * 0.65 }
                ]}
            />

            {/* Profile Card Skeleton */}
            <View style={[styles.profileCard, { marginTop: -30 }]}>
                {/* Profile Image Skeleton */}
                <View style={styles.profileImageContainer}>
                    <ShimmerEffect
                        style={[
                            styles.profileImageSkeleton,
                            {
                                width: isLandscape ? 80 : 100,
                                height: isLandscape ? 80 : 100,
                                borderRadius: isLandscape ? 40 : 50,
                            }
                        ]}
                    />
                </View>

                {/* Profile Info Skeleton */}
                <View style={styles.profileInfoSkeleton}>
                    <ShimmerEffect style={styles.userNameSkeleton} />
                    <ShimmerEffect style={styles.userBioSkeleton} />
                </View>

                {/* Stats Skeleton */}
                <View style={styles.statsSkeleton}>
                    <View style={styles.statItem}>
                        <ShimmerEffect style={styles.statNumberSkeleton} />
                        <ShimmerEffect style={styles.statLabelSkeleton} />
                    </View>
                    <View style={styles.statItem}>
                        <ShimmerEffect style={styles.statNumberSkeleton} />
                        <ShimmerEffect style={styles.statLabelSkeleton} />
                    </View>
                </View>

                {/* Location Skeleton */}
                <ShimmerEffect style={styles.locationSkeleton} />

                {/* Sections Skeleton */}
                <View style={styles.sectionsSkeleton}>
                    <ShimmerEffect style={styles.sectionTitleSkeleton} />
                    <View style={styles.sectionContentSkeleton}>
                        {[1, 2, 3].map((item) => (
                            <ShimmerEffect key={item} style={styles.sectionItemSkeleton} />
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darker,
    },
    shimmerContainer: {
        overflow: 'hidden',
        backgroundColor: COLORS.dark,
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
    coverImageSkeleton: {
        width: '100%',
        backgroundColor: COLORS.dark,
    },
    profileCard: {
        flex: 1,
        backgroundColor: COLORS.dark,
        borderTopLeftRadius: RADII.largeRounded,
        borderTopRightRadius: RADII.largeRounded,
        paddingTop: 60,
        alignItems: 'center',
        ...SHADOWS.card,
    },
    profileImageContainer: {
        position: 'absolute',
        top: -50,
        alignSelf: 'center',
        zIndex: 10,
    },
    profileImageSkeleton: {
        backgroundColor: COLORS.darker,
        borderWidth: 4,
        borderColor: COLORS.dark,
    },
    profileInfoSkeleton: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    userNameSkeleton: {
        width: 150,
        height: 32,
        borderRadius: RADII.small,
        marginBottom: 10,
    },
    userBioSkeleton: {
        width: 200,
        height: 60,
        borderRadius: RADII.small,
    },
    statsSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 40,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumberSkeleton: {
        width: 40,
        height: 24,
        borderRadius: RADII.small,
        marginBottom: 5,
    },
    statLabelSkeleton: {
        width: 60,
        height: 16,
        borderRadius: RADII.small,
    },
    locationSkeleton: {
        width: 120,
        height: 20,
        borderRadius: RADII.small,
        marginBottom: 30,
    },
    sectionsSkeleton: {
        width: '100%',
        paddingHorizontal: 20,
    },
    sectionTitleSkeleton: {
        width: 100,
        height: 24,
        borderRadius: RADII.small,
        marginBottom: 15,
    },
    sectionContentSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    sectionItemSkeleton: {
        width: 80,
        height: 80,
        borderRadius: RADII.rounded,
    },
});

export default LoadingSkeleton;