import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, RADII } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

const ActionButton = ({ title, description, icon, onPress, variant = 'default', confirmMessage }) => {
    const { colors } = useTheme();

    const handlePress = () => {
        if (confirmMessage) {
            Alert.alert(
                'Confirm',
                confirmMessage,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: onPress, style: variant === 'danger' ? 'destructive' : 'default' }
                ]
            );
        } else {
            onPress();
        }
    };

    const getButtonStyle = () => {
        switch (variant) {
            case 'danger':
                return { backgroundColor: '#FF3B30' };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'danger':
                return '#FFFFFF';
            default:
                return colors.surface;
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    {description && <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>}
                </View>
                <View style={[styles.button, getButtonStyle()]}>
                    {icon && <Ionicons name={icon} size={20} color={getTextColor()} />}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: FONTS.body,
        marginBottom: 2,
    },
    description: {
        fontSize: 14,
        fontFamily: FONTS.body,
        lineHeight: 18,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: RADII.circle,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ActionButton;