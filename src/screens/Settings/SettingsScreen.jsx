import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';
import { auth } from '../../firebase/config';
import SettingsSection from './components/SettingsSection';
import ToggleOption from './components/ToggleOption';
import SelectOption from './components/SelectOption';
import ActionButton from './components/ActionButton';
import MyPlan from './components/MyPlan';
import StandardHeader from '../../components/StandardHeader';

const SettingsScreen = ({ navigation }) => {
    const { theme, toggleTheme, colors } = useTheme();
    const { t, currentLanguage, switchLanguage, getLanguageOptions } = useLocalization();
    const [isPrivateProfile, setIsPrivateProfile] = useState(false);

    const languageOptions = getLanguageOptions();
    const themeOptions = [
        { value: 'light', label: t('settings.light') },
        { value: 'dark', label: t('settings.dark') },
        { value: 'system', label: t('settings.system') }
    ];

    const handleThemeChange = (newTheme) => {
        const themeKey = newTheme.toLowerCase();
        toggleTheme(themeKey);
    };

    const handleLanguageChange = (languageCode) => {
        switchLanguage(languageCode);
    };

    const getCurrentThemeLabel = () => {
        const currentTheme = theme.charAt(0).toUpperCase() + theme.slice(1);
        return t(`settings.${currentTheme.toLowerCase()}`);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StandardHeader
                title={t('settings.settings')}
                navigation={navigation}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SettingsSection title={t('settings.privacy')}>
                    <ToggleOption
                        title={t('settings.privateProfile')}
                        description={t('settings.privateProfileDescription')}
                        value={isPrivateProfile}
                        onToggle={setIsPrivateProfile}
                    />
                </SettingsSection>

                <SettingsSection title={t('settings.language')}>
                    <SelectOption
                        title={t('settings.appLanguage')}
                        options={languageOptions}
                        selectedValue={currentLanguage}
                        onSelect={handleLanguageChange}
                    />
                </SettingsSection>

                <SettingsSection title={t('settings.appearance')}>
                    <SelectOption
                        title={t('settings.theme')}
                        options={themeOptions}
                        selectedValue={getCurrentThemeLabel()}
                        onSelect={handleThemeChange}
                    />
                </SettingsSection>

                <MyPlan />

                <SettingsSection title={t('settings.account')}>
                    <ActionButton
                        title={t('settings.logout')}
                        description={t('settings.logoutDescription')}
                        icon="log-out-outline"
                        variant="danger"
                        confirmMessage={t('settings.areYouSureLogout')}
                        onPress={handleLogout}
                    />
                </SettingsSection>
            </ScrollView>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
});

export default SettingsScreen;
