import React from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { RADII, SHADOWS } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

const DraggableCard = ({ children, pan, panResponder, screenHeight }) => {
    const { colors } = useTheme();
    const { width: screenWidth, height } = useWindowDimensions();
    const isLandscape = screenWidth > height;
    const styles = getStyles(screenHeight || height, screenWidth, isLandscape, colors);

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

const getStyles = (height, width, isLandscape, colors) => StyleSheet.create({
    profileCard: {
        backgroundColor: colors.background,
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
        borderColor: colors.border,
        borderBottomWidth: 0,
    },
    glassmorphicBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.glassmorphic,
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
        backgroundColor: colors.text,
        borderRadius: RADII.rounded,
        opacity: 0.6,
        marginBottom: 4,
    },
    dragHint: {
        width: isLandscape ? 20 : 25,
        height: 2,
        backgroundColor: colors.primary,
        borderRadius: 1,
        opacity: 0.4,
    },
    container: {
        width: '100%',
        marginTop: isLandscape ? 35 : 40,
        paddingBottom: isLandscape ? 30 : 40,
        alignItems: 'center',
        zIndex: 10,
    },
});

export default DraggableCard;