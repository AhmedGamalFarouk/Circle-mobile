import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../../../constants/constants';

const DefaultState = ({ onStartPoll }) => {
    const { colors } = useTheme();
    const [pulseAnim] = useState(new Animated.Value(1));
    const [scaleAnim] = useState(new Animated.Value(1));

    React.useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    const handlePress = () => {
        console.log('DefaultState: handlePress called');
        console.log('DefaultState: onStartPoll type:', typeof onStartPoll);

        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        if (onStartPoll) {
            console.log('DefaultState: Calling onStartPoll');
            onStartPoll();
        } else {
            console.error('DefaultState: onStartPoll is not defined');
        }
    };

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            {/* Illustration */}
            <Animated.View
                style={[
                    styles.illustrationContainer,
                    { transform: [{ scale: pulseAnim }] }
                ]}
            >
                <View
                    style={[styles.illustrationGradient, { backgroundColor: colors.primary + '20' }]}
                >
                    <Ionicons name="people" size={48} color={colors.primary} />
                </View>
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Ready to Plan Something Fun?</Text>
                <Text style={styles.subtitle}>
                    Start a poll to decide what your circle wants to do together
                </Text>
            </View>

            {/* Action Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity style={styles.button} onPress={handlePress}>
                    <View
                        style={[styles.buttonGradient, { backgroundColor: colors.primary }]}
                    >
                        <Ionicons name="add-circle" size={24} color={colors.background} />
                        <Text style={styles.buttonText}>Start Planning</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Quick Tips */}
            <View style={styles.tipsContainer}>
                <View style={styles.tip}>
                    <Ionicons name="bulb" size={16} color={colors.warning} />
                    <Text style={styles.tipText}>Polls help everyone have a say</Text>
                </View>
                <View style={styles.tip}>
                    <Ionicons name="time" size={16} color={colors.success} />
                    <Text style={styles.tipText}>Set deadlines to keep things moving</Text>
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    illustrationContainer: {
        marginBottom: 24,
    },
    illustrationGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 30,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
    },
    button: {
        borderRadius: RADII.large,
        overflow: 'hidden',
        marginBottom: 24,
        ...SHADOWS.medium,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        gap: 12,
    },
    buttonText: {
        color: colors.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
    tipsContainer: {
        gap: 12,
        alignItems: 'center',
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface + '60',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADII.medium,
        gap: 8,
    },
    tipText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});

export default DefaultState;