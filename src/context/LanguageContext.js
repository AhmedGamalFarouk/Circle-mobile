import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, isRTL, getSupportedLanguages } from '../localization/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
    const [isRTLMode, setIsRTLMode] = useState(isRTL());

    const switchLanguage = async (languageCode) => {
        try {
            await changeLanguage(languageCode);
            setCurrentLanguage(languageCode);

            // Handle RTL layout
            const shouldBeRTL = languageCode === 'ar';
            if (shouldBeRTL !== isRTLMode) {
                setIsRTLMode(shouldBeRTL);
                // Force RTL layout change
                I18nManager.forceRTL(shouldBeRTL);
                // Note: You might need to restart the app for RTL changes to take full effect
            }
        } catch (error) {
            console.error('Error switching language:', error);
        }
    };

    const getLanguageName = (languageCode) => {
        const languages = getSupportedLanguages();
        const language = languages.find(lang => lang.code === languageCode);
        return language ? language.nativeName : languageCode;
    };

    const getLanguageOptions = () => {
        return getSupportedLanguages().map(lang => ({
            value: lang.code,
            label: lang.nativeName,
        }));
    };

    useEffect(() => {
        // Update RTL mode when language changes
        setIsRTLMode(isRTL());
    }, [currentLanguage]);

    const value = {
        currentLanguage,
        isRTLMode,
        switchLanguage,
        getLanguageName,
        getLanguageOptions,
        supportedLanguages: getSupportedLanguages(),
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}; 