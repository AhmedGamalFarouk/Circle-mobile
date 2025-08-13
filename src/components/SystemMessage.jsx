import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLocalization } from '../hooks/useLocalization';
import { COLORS, RADII } from '../constants/constants';

const SystemMessage = ({ message }) => {
    const { colors } = useTheme();
    const { t } = useLocalization();
    const styles = getStyles(colors);

    const getSystemMessageText = () => {
        switch (message.systemMessageType) {
            case 'user_joined':
                return t('systemMessages.userJoined', { username: message.username });
            case 'user_left':
                return t('systemMessages.userLeft', { username: message.username });
            case 'user_invited':
                return t('systemMessages.userInvited', {
                    username: message.username,
                    inviter: message.inviterName
                });
            case 'welcome':
                return t('systemMessages.welcomeToCircle', { circleName: message.circleName });
            default:
                return message.message || 'System message';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInMinutes = (now - messageDate) / (1000 * 60);

        if (diffInMinutes < 1) {
            return 'now';
        } else if (diffInMinutes < 60) {
            return `${Math.floor(diffInMinutes)}m`;
        } else if (diffInMinutes < 1440) { // 24 hours
            return `${Math.floor(diffInMinutes / 60)}h`;
        } else {
            return messageDate.toLocaleDateString();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.messageContainer}>
                <Text style={styles.messageText}>
                    {getSystemMessageText()}
                </Text>
                <Text style={styles.timestamp}>
                    {formatTimestamp(message.timestamp)}
                </Text>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    messageContainer: {
        backgroundColor: colors.surface || COLORS.glass,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADII.rounded,
        maxWidth: '80%',
        alignItems: 'center',
    },
    messageText: {
        color: colors.textSecondary || COLORS.text,
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 18,
    },
    timestamp: {
        color: colors.textSecondary || COLORS.text,
        fontSize: 11,
        marginTop: 2,
        opacity: 0.7,
    },
});

export default SystemMessage;