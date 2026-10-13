// Account deletion (SPEC C1). Confirms the password, then calls the web app's
// /api/delete-account, which deletes everything including the sign-in. Circles
// you own go to an admin (else the longest-standing member), or are deleted
// when you're alone. A failed step is named and Retry resumes it.
// With `finish`, this is the "Finish deleting your account" screen shown to a
// signed-in user whose profile is already gone (DynamicNativeStack).
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { RADII } from '../../constants/constants';
import { DEMO_EMAIL } from '../../utils/demoAccount';
import StandardHeader from '../../components/StandardHeader';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://circle-seven-tau.vercel.app';
const DANGER = '#FF3B30';

const DeleteAccountScreen = ({ navigation, finish = false }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const user = auth.currentUser;
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null); // { message, retry }

    const runDeletion = async () => {
        setBusy(true);
        setError(null);
        let result;
        try {
            const token = await user.getIdToken(true);
            const res = await fetch(`${API_URL}/api/delete-account`, {
                method: 'POST',
                headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
                body: '{}',
            });
            result = await res.json().catch(() => ({ ok: false }));
        } catch {
            result = { ok: false };
        }
        if (result.ok) {
            await signOut(auth).catch(() => {});
            // On the finish screen the stack swaps itself back once signed out.
            if (navigation) navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
            return;
        }
        setBusy(false);
        if (result.error === 'reauth') {
            setError({ message: t('deleteAccount.reauth') });
        } else if (result.failedStep) {
            setError({ message: t('deleteAccount.failedStep', { step: t(`deleteAccount.steps.${result.failedStep}`) }), retry: true });
        } else {
            setError({ message: t('deleteAccount.network'), retry: true });
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        setError(null);
        try {
            await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
        } catch (e) {
            setBusy(false);
            const wrong = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential';
            setError({ message: t(wrong ? 'deleteAccount.wrongPassword' : 'deleteAccount.reauthFailed') });
            return;
        }
        await runDeletion();
    };

    if (!user) return null;
    const isDemo = user.email === DEMO_EMAIL;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {!finish && <StandardHeader title={t('deleteAccount.title')} navigation={navigation} />}
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {finish && (
                    <Text style={[styles.heading, { color: colors.text }]} accessibilityRole="header">
                        {t('deleteAccount.finishTitle')}
                    </Text>
                )}
                <Text style={[styles.body, { color: colors.text }]}>
                    {t(finish ? 'deleteAccount.finishBody' : 'deleteAccount.body')}
                </Text>

                {isDemo ? (
                    <Text style={[styles.note, { color: colors.text, borderColor: colors.primary }]}>
                        {t('deleteAccount.demo')}
                    </Text>
                ) : (
                    <>
                        <Text style={[styles.label, { color: colors.text }]}>{t('deleteAccount.password')}</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                            textContentType="password"
                            editable={!busy}
                            accessibilityLabel={t('deleteAccount.password')}
                            style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                        />

                        {error && (
                            <View style={styles.errorBox} accessibilityRole="alert">
                                <Text style={[styles.errorText, { color: colors.text }]}>{error.message}</Text>
                                {error.retry && (
                                    <TouchableOpacity onPress={runDeletion} disabled={busy} accessibilityRole="button"
                                        style={[styles.retry, { borderColor: colors.primary }]}>
                                        <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('deleteAccount.retry')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleDelete}
                            disabled={busy || !password}
                            accessibilityRole="button"
                            accessibilityState={{ busy, disabled: busy || !password }}
                            style={[styles.deleteButton, (busy || !password) && styles.disabled]}
                        >
                            {busy
                                ? <ActivityIndicator color="#FFFFFF" />
                                : <Text style={styles.deleteText}>{t('deleteAccount.confirm')}</Text>}
                        </TouchableOpacity>

                        {finish && (
                            <TouchableOpacity onPress={() => signOut(auth)} accessibilityRole="button" style={styles.signOut}>
                                <Text style={{ color: colors.primary }}>{t('deleteAccount.signOut')}</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    content: { padding: 20, gap: 14 },
    heading: { fontSize: 22, fontWeight: 'bold', marginTop: 40 },
    body: { fontSize: 15, lineHeight: 22 },
    note: { borderWidth: 1, borderRadius: RADII.medium || 12, padding: 14, fontSize: 15 },
    label: { fontSize: 14, fontWeight: '600', marginTop: 6 },
    input: { borderWidth: 1, borderRadius: 12, minHeight: 44, paddingHorizontal: 12, fontSize: 16 },
    errorBox: { borderWidth: 1, borderColor: DANGER, borderRadius: 12, padding: 12, gap: 10 },
    errorText: { fontSize: 14 },
    retry: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: RADII.rounded, minHeight: 44, paddingHorizontal: 18, justifyContent: 'center' },
    deleteButton: { backgroundColor: DANGER, borderRadius: RADII.rounded, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    disabled: { opacity: 0.5 },
    deleteText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    signOut: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
});

export default DeleteAccountScreen;
