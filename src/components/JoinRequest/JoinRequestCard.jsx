import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';

const JoinRequestCard = ({ request, onApprove, onDeny }) => {
    const userId = request.requesterId || request.invitedUserId; // Support both old and new field names
    const { data: userProfile, isLoading, error } = useUserProfile(userId);
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { t } = useLocalization();

    const handleViewProfile = () => {
        navigation.navigate('UserProfile', { userId });
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
                <Text style={{ color: theme.colors.text }}>{t('loading')}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
                <Text style={{ color: theme.colors.error }}>{t('errorLoadingUserProfile')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
            <View style={styles.userInfo}>
                <Image source={{ uri: request.requesterPhotoUrl || request.invitedUserPhotoUrl || userProfile?.profilePicture || 'https://via.placeholder.com/50' }} style={styles.profileImage} />
                <View style={styles.userInfoText}>
                    <Text style={[styles.userName, { color: theme.colors.text }]}>{request.requesterUsername || request.invitedUserUsername || userProfile?.username}</Text>
                    <Text style={[styles.message, { color: theme.colors.textMuted }]}>{request.message}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={() => onApprove(request.id)}>
                    <Text style={styles.buttonText}>{t('approve')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.denyButton]} onPress={() => onDeny(request.id)}>
                    <Text style={styles.buttonText}>{t('deny')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.viewProfileButton]} onPress={handleViewProfile}>
                    <Text style={styles.buttonText}>{t('viewProfile')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userInfoText: {
        flex: 1,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    message: {
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    denyButton: {
        backgroundColor: '#F44336',
    },
    viewProfileButton: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default JoinRequestCard;