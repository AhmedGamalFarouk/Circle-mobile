import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
    <View style={{ alignItems: 'center', marginBottom: 20 }}>
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

export const DateOfBirthInput = ({ value, onChange, placeholder = "Date of Birth" }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || value;
        setShowPicker(Platform.OS === 'ios');
        onChange(currentDate);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <View style={{ width: '100%', marginBottom: 12 }}>
            <TouchableOpacity
                style={[styles.inputContainer, isFocused && styles.inputFocused]}
                onPress={() => {
                    setShowPicker(true);
                    setIsFocused(true);
                }}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.text}
                    style={{ marginRight: 12 }}
                />
                <Text style={[styles.input, { paddingVertical: 18 }]}>
                    {value ? formatDate(value) : placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={COLORS.text}
                />
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    testID="datePicker"
                    value={value || new Date(new Date().setFullYear(new Date().getFullYear() - 18))} // Default to 18 years ago
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))} // Allow up to 100 years old
                    onTouchCancel={() => setIsFocused(false)}
                />
            )}
        </View>
    );
};

export const LocationInput = ({
    value,
    onChangeText,
    onGetLocation,
    isLoading,
    placeholder = "Location"
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={{ width: '100%', marginBottom: 12 }}>
            <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
                <Ionicons
                    name="location-outline"
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.text}
                    style={{ marginRight: 12 }}
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.text}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={onGetLocation}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <>
                            <Ionicons
                                name="navigate"
                                size={16}
                                color={COLORS.primary}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={styles.locationButtonText}>Get Location</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const BottomLink = ({ text, linkText, onPress }) => (
    <View style={styles.bottomSection}>
        <Text style={styles.signUpText}>
            {text} <Text style={styles.signUpLink} onPress={onPress}>{linkText}</Text>
        </Text>
    </View>
);