import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import BottomNavBar from '../../components/BottomNavBar';
import SettingsHeader from './components/SettingsHeader';
import SettingsSection from './components/SettingsSection';
import ToggleOption from './components/ToggleOption';
import SelectOption from './components/SelectOption';
import MyPlan from './components/MyPlan';

const SettingsScreen = ({ navigation }) => {
    const { theme, toggleTheme, colors } = useTheme();
    const [isPrivateProfile, setIsPrivateProfile] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const languageOptions = ['English', 'Arabic'];
    const themeOptions = ['Dark', 'Light'];

    const handleThemeChange = (newTheme) => {
        const themeKey = newTheme.toLowerCase();
        toggleTheme(themeKey);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* <SettingsHeader navigation={navigation} /> */}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SettingsSection title="Privacy">
                    <ToggleOption
                        title="Private Profile"
                        description="Only approved followers can see your profile"
                        value={isPrivateProfile}
                        onToggle={setIsPrivateProfile}
                    />
                </SettingsSection>

                <SettingsSection title="Language">
                    <SelectOption
                        title="App Language"
                        options={languageOptions}
                        selectedValue={selectedLanguage}
                        onSelect={setSelectedLanguage}
                    />
                </SettingsSection>

                <SettingsSection title="Appearance">
                    <SelectOption
                        title="Theme"
                        options={themeOptions}
                        selectedValue={theme.charAt(0).toUpperCase() + theme.slice(1)}
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
