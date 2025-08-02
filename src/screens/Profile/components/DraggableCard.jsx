import React from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, RADII, SHADOWS } from '../../../constants/constants';

const DraggableCard = ({ children, pan, panResponder, screenHeight }) => {
    const { width: screenWidth, height } = useWindowDimensions();
    const isLandscape = screenWidth > height;
    const styles = getStyles(screenHeight || height, screenWidth, isLandscape);

    // Enhanced card shadow based on drag position
    const cardElevation = pan.y.interpolate({
        inputRange: [-screenHeight * 0.5, -screenHeight * 0.08],
        outputRange: [25, 10],
        extrapolate: 'clamp',
    });

    const cardOpacity = pan.y.interpolate({
        inputRange: [-screenHeight * 0.55, -screenHeight * 0.08],
        outputRange: [0.95, 1],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View
            style={[
                styles.profileCard,
                {
                    marginTop: pan.y,
                    shadowRadius: cardElevation,
                    opacity: cardOpacity,
                },
            ]}
        >
            {/* Enhanced Draggable Handle */}
            <View style={styles.draggableHandle} {...panResponder.panHandlers}>
                <View style={styles.dragIndicator} />
                <View style={styles.dragHint} />
            </View>

            {/* Glassmorphic Background */}
            <View style={styles.glassmorphicBackground} />

            {/* Content Container */}
            <View style={styles.container}>
                {children}
            </View>
        </Animated.View>
    );
};

const getStyles = (height, width, isLandscape) => StyleSheet.create({
    profileCard: {
        flex: 1,
        backgroundColor: COLORS.dark,
        borderTopLeftRadius: RADII.largeRounded,
        borderTopRightRadius: RADII.largeRounded,
        marginTop: -RADII.largeRounded,
        paddingTop: 20,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...SHADOWS.glassCard,
        // Enhanced glassmorphism
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomWidth: 0,
    },
    glassmorphicBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(18, 19, 26, 0.85)',
        backdropFilter: 'blur(20px)', // Note: Limited support in React Native
    },
    draggableHandle: {
        width: '100%',
        paddingVertical: isLandscape ? 12 : 15,
        alignItems: 'center',
        borderTopLeftRadius: RADII.largeRounded,
        borderTopRightRadius: RADII.largeRounded,
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        zIndex: 20,
    },
    dragIndicator: {
        width: isLandscape ? 35 : 40,
        height: isLandscape ? 4 : 5,
        backgroundColor: COLORS.text,
        borderRadius: RADII.rounded,
        opacity: 0.6,
        marginBottom: 4,
    },
    dragHint: {
        width: isLandscape ? 20 : 25,
        height: 2,
        backgroundColor: COLORS.primary,
        borderRadius: 1,
        opacity: 0.4,
    },
    container: {
        flex: 1,
        width: '100%',
        marginTop: isLandscape ? 35 : 40,
        paddingBottom: isLandscape ? 30 : 40,
        alignItems: 'center',
        zIndex: 10,
    },
});

export default DraggableCard;