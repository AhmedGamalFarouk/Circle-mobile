import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { COLORS } from '../../../constants/constants';

export const AuthContainer = ({ children }) => (
    <View style={styles.container}>{children}</View>
);

export const Logo = () => (
    <Image
        source={require('../../../../assets/icon.png')}
        style={styles.logo}
    />
);

export const Title = ({ children }) => (
    <Text style={styles.welcomeText}>{children}</Text>
);

export const AuthInput = ({ placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, showPassword, toggleShowPassword }) => (
    <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.text}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
        />
        {placeholder === 'Password' && (
            <TouchableOpacity style={styles.eyeIcon} onPress={toggleShowPassword}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={COLORS.text} />
            </TouchableOpacity>
        )}
        {placeholder === 'Confirm Password' && (
            <TouchableOpacity style={styles.eyeIcon} onPress={toggleShowPassword}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={COLORS.text} />
            </TouchableOpacity>
        )}
    </View>
);

export const SubmitButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.loginButton} onPress={onPress}>
        <Text style={styles.loginButtonText}>{title}</Text>
    </TouchableOpacity>
);

export const OrDivider = () => (
    <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
    </View>
);

export const SocialButtons = ({ onGooglePress, onFacebookPress, onApplePress, disabled }) => (
    <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={onFacebookPress}>
            <Ionicons name="logo-facebook" size={30} color={COLORS.light} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={onGooglePress} disabled={disabled}>
            <Ionicons name="logo-google" size={30} color={COLORS.light} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={onApplePress}>
            <Ionicons name="logo-apple" size={30} color={COLORS.light} />
        </TouchableOpacity>
    </View>
);

export const BottomLink = ({ text, linkText, onPress }) => (
    <Text style={styles.signUpText}>
        {text} <Text style={styles.signUpLink} onPress={onPress}>{linkText}</Text>
    </Text>
);