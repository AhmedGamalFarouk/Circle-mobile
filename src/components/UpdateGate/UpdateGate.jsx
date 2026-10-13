import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../../firebase/config';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { RADII } from '../../constants/constants';
import { isOlderVersion } from '../../utils/version.mjs';

const APP_VERSION = Constants.expoConfig?.version;
const ANDROID_STORE_URL = 'market://details?id=com.ahmedgamal.Circlemobile';

// Blocks the app when it is older than config/mobile.minVersion (SPEC C8, E31), so
// old builds stop writing legacy data once the rules tighten. Checked when the user
// signs in and whenever the app returns to the foreground. Fails open: a missing
// doc, a bad value or no network never locks anyone out.
// config/mobile: { minVersion: "1.1.0", updateUrl?: { android?: string, ios?: string } }
const UpdateGate = ({ children }) => {
    const { user } = useAuth();
    const [blockedConfig, setBlockedConfig] = useState(null);

    const check = useCallback(async () => {
        if (!user) return;
        try {
            const snap = await getDoc(doc(db, 'config', 'mobile'));
            const config = snap.data() || {};
            setBlockedConfig(isOlderVersion(APP_VERSION, config.minVersion) ? config : null);
        } catch (error) {
            console.warn('Version check skipped:', error.message);
        }
    }, [user]);

    useEffect(() => {
        check();
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') check();
        });
        return () => sub.remove();
    }, [check]);

    if (!blockedConfig) return children;
    return <UpdateScreen updateUrl={blockedConfig.updateUrl?.[Platform.OS] || (Platform.OS === 'android' ? ANDROID_STORE_URL : null)} />;
};

const UpdateScreen = ({ updateUrl }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Ionicons name="cloud-download-outline" size={72} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
                {t('update.title')}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>{t('update.body')}</Text>
            {updateUrl && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => Linking.openURL(updateUrl).catch(() => {})}
                    accessibilityRole="button"
                >
                    <Text style={[styles.buttonText, { color: colors.background }]}>{t('update.button')}</Text>
                </TouchableOpacity>
            )}
            <Text style={[styles.version, { color: colors.textSecondary || colors.text }]}>
                {t('update.currentVersion', { version: APP_VERSION || '?' })}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    button: {
        minHeight: 44,
        paddingHorizontal: 28,
        justifyContent: 'center',
        borderRadius: RADII.rounded,
        marginTop: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        fontSize: 13,
        marginTop: 8,
    },
});

export default UpdateGate;
