import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADII, SHADOWS } from '../../../constants/constants';

const SettingsSection = ({ title, children }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>
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
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: '600',
        fontFamily: FONTS.heading,
        marginBottom: 15,
    },
    sectionContent: {
        backgroundColor: COLORS.glass,
        borderRadius: RADII.rounded,
        padding: 20,
        ...SHADOWS.glassCard,
    },
});

export default SettingsSection;