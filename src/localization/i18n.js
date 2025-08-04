import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './translations/en';
import ar from './translations/ar';

const LANGUAGE_DETECTOR = {
    type: 'languageDetector',
    async: true,
    detect: async (callback) => {
        try {
            // Check if user has manually set a language
            const savedLanguage = await AsyncStorage.getItem('user-language');
            if (savedLanguage) {
                return callback(savedLanguage);
            }

            // Default to English for Expo compatibility
            // Users can manually change language in settings
            return callback('en');
        } catch (error) {
            console.log('Error detecting language:', error);
            return callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language) => {
        try {
            await AsyncStorage.setItem('user-language', language);
        } catch (error) {
            console.log('Error saving language:', error);
        }
    },
};

const resources = {
    en: {
        translation: en,
    },
    ar: {
        translation: ar,
    },
};

i18n
    .use(LANGUAGE_DETECTOR)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: __DEV__,

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        react: {
            useSuspense: false, // Disable Suspense for React Native
        },
    });

// Helper function to change language
export const changeLanguage = async (language) => {
    try {
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem('user-language', language);
    } catch (error) {
        console.log('Error changing language:', error);
    }
};

// Helper function to get current language
export const getCurrentLanguage = () => {
    return i18n.language;
};

// Helper function to check if current language is RTL
export const isRTL = () => {
    return i18n.language === 'ar';
};

// Helper function to get supported languages
export const getSupportedLanguages = () => {
    return [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    ];
};

export default i18n; 