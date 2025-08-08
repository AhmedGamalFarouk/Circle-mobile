import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoadingSpinner = ({ message = 'Loading...', size = 'large' }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={colors.primary} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
    },
    message: {
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
});

export default LoadingSpinner;