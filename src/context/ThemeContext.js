import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from '../constants/constants';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [colors, setColors] = useState(THEMES.dark);

    // Load saved theme from AsyncStorage on app start
    useEffect(() => {
        loadTheme();
    }, []);

    // Update colors when theme changes
    useEffect(() => {
        setColors(THEMES[theme]);
    }, [theme]);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('userTheme');
            if (savedTheme && THEMES[savedTheme]) {
                setTheme(savedTheme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const toggleTheme = async (newTheme) => {
        try {
            await AsyncStorage.setItem('userTheme', newTheme);
            setTheme(newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const value = {
        theme,
        colors,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}; 