import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/constants';
import BottomNavBar from '../../components/BottomNavBar';
import SettingsHeader from './components/SettingsHeader';
import SettingsSection from './components/SettingsSection';
import ToggleOption from './components/ToggleOption';
import SelectOption from './components/SelectOption';
import MyPlan from './components/MyPlan';

const SettingsScreen = ({ navigation }) => {
    const [isPrivateProfile, setIsPrivateProfile] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [selectedTheme, setSelectedTheme] = useState('Dark');

    const languageOptions = ['English', 'Arabic'];
    const themeOptions = ['Dark', 'Light'];

    return (
        <View style={styles.container}>
            <SettingsHeader navigation={navigation} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SettingsSection title="Privacy">
                    <ToggleOption
                        title="Private Profile"
                        description="Only approved followers can see your posts"
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
                        selectedValue={selectedTheme}
                        onSelect={setSelectedTheme}
                    />
                </SettingsSection>

                <MyPlan />
            </ScrollView>

            <BottomNavBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
});

export default SettingsScreen;
