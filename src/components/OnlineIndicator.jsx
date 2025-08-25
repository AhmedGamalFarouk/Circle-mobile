import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useOnlinePresence from '../hooks/useOnlinePresence';

const OnlineIndicator = ({ userId, showText = false, size = 12 }) => {
    const { colors } = useTheme();
    const { isUserOnline, getLastSeenText } = useOnlinePresence();
    const isOnline = isUserOnline(userId);
    
    const styles = getStyles(colors, size);
    
    if (showText) {
        return (
            <View style={styles.textContainer}>
                <View style={[styles.indicator, isOnline ? styles.online : styles.offline]} />
                <Text style={styles.statusText}>
                    {getLastSeenText(userId)}
                </Text>
            </View>
        );
    }
    
    return (
        <View style={[styles.indicator, isOnline ? styles.online : styles.offline]} />
    );
};

const getStyles = (colors, size) => StyleSheet.create({
    indicator: {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: colors.background,
    },
    online: {
        backgroundColor: '#4CAF50',
    },
    offline: {
        backgroundColor: '#9E9E9E',
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});

export default OnlineIndicator;