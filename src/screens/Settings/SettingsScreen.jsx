import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';
import BottomNavBar from '../../components/BottomNavBar';
import SettingsHeader from './components/SettingsHeader';
import SettingsSection from './components/SettingsSection';
import ToggleOption from './components/ToggleOption';
import SelectOption from './components/SelectOption';
import MyPlan from './components/MyPlan';

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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* <SettingsHeader navigation={navigation} /> */}

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
