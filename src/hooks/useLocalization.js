import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export const useLocalization = () => {
    const { t, i18n } = useTranslation();
    const {
        currentLanguage,
        isRTLMode,
        switchLanguage,
        getLanguageName,
        getLanguageOptions,
        supportedLanguages
    } = useLanguage();

    return {
        // Translation functions
        t,
        i18n,

        // Language state
        currentLanguage,
        isRTLMode,

        // Language functions
        switchLanguage,
        getLanguageName,
        getLanguageOptions,
        supportedLanguages,

        // Helper functions
        isArabic: currentLanguage === 'ar',
        isEnglish: currentLanguage === 'en',
    };
}; 