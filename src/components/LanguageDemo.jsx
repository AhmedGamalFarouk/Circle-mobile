import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../context/ThemeContext';

const LanguageDemo = () => {
    const { t, currentLanguage, switchLanguage, isRTLMode } = useLocalization();
    const { colors } = useTheme();

    const toggleLanguage = () => {
        const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
        switchLanguage(newLanguage);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>
                {t('home.welcome')}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('home.discoverCircles')}
            </Text>

            <View style={[styles.infoContainer, { borderColor: colors.border }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                    {t('common.currentLanguage')}: {currentLanguage === 'en' ? 'English' : 'العربية'}
                </Text>
                <Text style={[styles.infoText, { color: colors.text }]}>
                    {t('common.rtlMode')}: {isRTLMode ? t('common.yes') : t('common.no')}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={toggleLanguage}
            >
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                    {t('common.switchLanguage')}
                </Text>
            </TouchableOpacity>

            <View style={[styles.exampleContainer, { borderColor: colors.border }]}>
                <Text style={[styles.exampleTitle, { color: colors.text }]}>
                    {t('common.examples')}:
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                    • {t('auth.signIn')}
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                    • {t('circles.createCircle')}
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                    • {t('settings.privacy')}
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                    • {t('profile.editProfile')}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    infoContainer: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        width: '100%',
    },
    infoText: {
        fontSize: 14,
        marginBottom: 5,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    exampleContainer: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        width: '100%',
    },
    exampleTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    exampleText: {
        fontSize: 14,
        marginBottom: 5,
    },
});

export default LanguageDemo; 