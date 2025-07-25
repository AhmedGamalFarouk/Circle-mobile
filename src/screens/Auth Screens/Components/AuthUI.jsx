import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { COLORS } from '../../../constants/constants';

export const AuthContainer = ({ children }) => (
    <View style={styles.container}>
        <View style={styles.contentContainer}>
            {children}
        </View>
    </View>
);

export const Logo = () => (
    <View style={styles.headerSection}>
        <Image
            source={require('../../../../assets/icon.png')}
            style={styles.logo}
        />
    </View>
);

export const Title = ({ children, subtitle }) => (
    <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={styles.welcomeText}>{children}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
);

export const AuthInput = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    showPassword,
    toggleShowPassword,
    icon
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
            {icon && (
                <Ionicons
                    name={icon}
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.text}
                    style={{ marginRight: 12 }}
                />
            )}
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.text}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {(placeholder === 'Password' || placeholder === 'Confirm Password') && (
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={toggleShowPassword}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={COLORS.text}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export const ForgotPasswordLink = ({ onPress }) => (
    <TouchableOpacity style={styles.forgotPassword} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
    </TouchableOpacity>
);

export const SubmitButton = ({ title, onPress, loading }) => (
    <Pressable
        style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.loginButtonPressed
        ]}
        onPress={onPress}
        disabled={loading}
    >
        <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : title}
        </Text>
    </Pressable>
);

export const OrDivider = () => (
    <View style={styles.dividerSection}>
        <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.line} />
        </View>
    </View>
);

export const SocialButtons = ({ onGooglePress, disabled, loading }) => (
    <View style={styles.socialSection}>
        <View style={styles.socialButtonsContainer}>
            <Pressable
                style={({ pressed }) => [
                    styles.googleButton,
                    pressed && styles.googleButtonPressed,
                    disabled && styles.googleButtonDisabled
                ]}
                onPress={onGooglePress}
                disabled={disabled || loading}
            >
                <View style={styles.googleIcon}>
                    <Image
                        source={require('../../../../assets/google logo.png')}
                        style={styles.googleLogoImage}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.googleButtonText}>
                    {loading ? 'Connecting...' : 'Continue with Google'}
                </Text>
            </Pressable>
        </View>
    </View>
);

export const BottomLink = ({ text, linkText, onPress }) => (
    <View style={styles.bottomSection}>
        <Text style={styles.signUpText}>
            {text} <Text style={styles.signUpLink} onPress={onPress}>{linkText}</Text>
        </Text>
    </View>
);