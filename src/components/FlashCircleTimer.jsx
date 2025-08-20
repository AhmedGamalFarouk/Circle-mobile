import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADII, SHADOWS } from '../constants/constants';
import { Ionicons } from '@expo/vector-icons';

const FlashCircleTimer = ({ expiresAt, style, compact = false }) => {
    const { colors } = useTheme();
    const [timeLeft, setTimeLeft] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!expiresAt) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiration = expiresAt.seconds ? expiresAt.seconds * 1000 : new Date(expiresAt).getTime();
            const difference = expiration - now;

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft(null);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
            setIsExpired(false);
        };

        // Calculate immediately
        calculateTimeLeft();

        // Update every second
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!expiresAt) return null;

    const styles = getStyles(colors);

    if (isExpired) {
        return (
            <View style={[styles.container, styles.expiredContainer, style]}>
                <Ionicons name="time-outline" size={compact ? 14 : 16} color={colors.error} />
                <Text style={[styles.expiredText, compact && styles.compactText]}>Expired</Text>
            </View>
        );
    }

    if (!timeLeft) return null;

    const formatTime = (time) => {
        if (compact) {
            if (time.days > 0) {
                return `${time.days}d ${time.hours}h`;
            } else if (time.hours > 0) {
                return `${time.hours}h ${time.minutes}m`;
            } else {
                return `${time.minutes}m ${time.seconds}s`;
            }
        } else {
            const parts = [];
            if (time.days > 0) parts.push(`${time.days} day${time.days !== 1 ? 's' : ''}`);
            if (time.hours > 0) parts.push(`${time.hours} hour${time.hours !== 1 ? 's' : ''}`);
            if (time.days === 0 && time.minutes > 0) parts.push(`${time.minutes} min${time.minutes !== 1 ? 's' : ''}`);
            if (time.days === 0 && time.hours === 0 && time.seconds > 0) parts.push(`${time.seconds} sec${time.seconds !== 1 ? 's' : ''}`);
            
            return parts.slice(0, 2).join(', ');
        }
    };

    const getUrgencyColor = () => {
        if (timeLeft.days === 0 && timeLeft.hours < 1) {
            return colors.error; // Critical - less than 1 hour
        } else if (timeLeft.days === 0 && timeLeft.hours < 24) {
            return colors.warning; // Warning - less than 24 hours
        } else if (timeLeft.days < 3) {
            return colors.accent; // Caution - less than 3 days
        }
        return colors.primary; // Normal
    };

    const urgencyColor = getUrgencyColor();

    return (
        <View style={[styles.container, { borderColor: urgencyColor }, style]}>
            <Ionicons name="flash" size={compact ? 14 : 16} color={urgencyColor} />
            <Text style={[styles.timerText, { color: urgencyColor }, compact && styles.compactText]}>
                {formatTime(timeLeft)}
            </Text>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADII.pill,
        borderWidth: 1,
        backgroundColor: colors.surface,
        gap: 6,
        ...SHADOWS.medium,
    },
    expiredContainer: {
        backgroundColor: colors.error + '20',
        borderColor: colors.error,
    },
    timerText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins',
    },
    expiredText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins',
        color: colors.error,
    },
    compactText: {
        fontSize: 12,
    },
});

export default FlashCircleTimer;