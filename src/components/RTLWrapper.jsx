import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const RTLWrapper = ({ children, style, ...props }) => {
    const { isRTLMode } = useLanguage();

    const rtlStyle = isRTLMode ? { transform: [{ scaleX: -1 }] } : {};

    return (
        <View style={[styles.container, rtlStyle, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default RTLWrapper; 