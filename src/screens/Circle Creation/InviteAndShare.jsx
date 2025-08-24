import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const InviteAndShare = ({ navigation, route }) => {
    const { circleName, circleId } = route.params;
    const inviteLink = `https://circle-beta-nine.vercel.app/circles/${circleId}`;

    const copyToClipboard = () => {
        Clipboard.setString(inviteLink);
        alert('Link Copied!');
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `Join my new circle on Circle: ${inviteLink}`,
            });
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Success!</Text>
                <TouchableOpacity onPress={() => navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                })}>
                    <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.mainContent}>
                <Text style={styles.checkmark}>✅</Text>
                <Text style={styles.confirmationMessage}>'{circleName}' has been created.</Text>
                <Text style={styles.subHeadline}>Now, invite your friends!</Text>
            </View>

            <View style={styles.inviteLinkContainer}>
                <Text style={styles.inviteLink}>{inviteLink}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                    <Text style={styles.copyButtonText}>📋 Copy Link</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.socialShareContainer}>
                <TouchableOpacity style={styles.socialButton} onPress={onShare}>
                    <Text>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={onShare}>
                    <Text>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={onShare}>
                    <Text>Telegram</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 40,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    doneButton: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    mainContent: {
        alignItems: 'center',
        marginBottom: 40,
    },
    checkmark: {
        fontSize: 50,
        marginBottom: 20,
    },
    confirmationMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subHeadline: {
        fontSize: 16,
        color: 'gray',
    },
    inviteLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    inviteLink: {
        flex: 1,
        marginRight: 10,
    },
    copyButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
    },
    copyButtonText: {
        color: '#fff',
    },
    socialShareContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    socialButton: {
        alignItems: 'center',
    },
});

export default InviteAndShare;