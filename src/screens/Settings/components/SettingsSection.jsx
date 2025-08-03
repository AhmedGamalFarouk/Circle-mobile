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
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: FONTS.heading,
        marginBottom: 15,
    },
    sectionContent: {
        borderRadius: RADII.rounded,
        padding: 20,
        // ...SHADOWS.glassCard,
    },
});

export default SettingsSection;