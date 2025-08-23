import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, RADII } from '../../../constants/constants';
import { useTheme } from '../../../context/ThemeContext';

const SettingsSection = ({ title, children }) => {
    const { colors } = useTheme();

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.glass }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: FONTS.heading,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionContent: {
        borderRadius: RADII.rounded,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
});

export default SettingsSection;