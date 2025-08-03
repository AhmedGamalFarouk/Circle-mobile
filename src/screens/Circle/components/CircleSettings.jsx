import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADII } from '../../../constants/constants';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import useAuth from '../../../hooks/useAuth';

const CircleSettings = ({ visible, onClose, circleId }) => {
    const { user } = useAuth();
    const [isClearing, setIsClearing] = useState(false);

    const handleClearChat = async () => {
        Alert.alert(
            'Clear Chat',
            'This will clear all chat messages for you only. Other members will still see their messages. This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Clear Chat',
                    style: 'destructive',
                    onPress: async () => {
                        setIsClearing(true);
                        try {
                            // Get all chat messages for this circle
                            const chatRef = collection(db, 'circles', circleId, 'chat');
                            const chatQuery = query(chatRef);
                            const chatSnapshot = await getDocs(chatQuery);

                            if (chatSnapshot.empty) {
                                Alert.alert('Info', 'No messages to clear.');
                                setIsClearing(false);
                                return;
                            }

                            // Use batch to update all messages
                            const batch = writeBatch(db);

                            chatSnapshot.docs.forEach((messageDoc) => {
                                const messageData = messageDoc.data();
                                const hiddenBy = messageData.hiddenBy || [];

                                // Only add user to hiddenBy if not already there
                                if (!hiddenBy.includes(user.uid)) {
                                    const messageRef = doc(db, 'circles', circleId, 'chat', messageDoc.id);
                                    batch.update(messageRef, {
                                        hiddenBy: [...hiddenBy, user.uid]
                                    });
                                }
                            });

                            await batch.commit();

                            Alert.alert('Success', 'Chat cleared successfully for you.');
                            onClose();
                        } catch (error) {
                            console.error('Error clearing chat:', error);
                            Alert.alert('Error', 'Failed to clear chat. Please try again.');
                        } finally {
                            setIsClearing(false);
                        }
                    },
                },
            ]
        );
    };

    const settingsOptions = [
        {
            id: 'clearChat',
            title: 'Clear Chat',
            subtitle: 'Clear all messages for you only',
            icon: 'trash-outline',
            onPress: handleClearChat,
            disabled: isClearing,
        },
        // Add more settings options here in the future
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={COLORS.light} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Circle Settings</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.content}>
                    {settingsOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.settingItem, option.disabled && styles.disabledItem]}
                            onPress={option.onPress}
                            disabled={option.disabled}
                        >
                            <View style={styles.settingIcon}>
                                <Ionicons
                                    name={option.icon}
                                    size={24}
                                    color={option.disabled ? COLORS.secondary : COLORS.light}
                                />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={[styles.settingTitle, option.disabled && styles.disabledText]}>
                                    {option.title}
                                </Text>
                                <Text style={[styles.settingSubtitle, option.disabled && styles.disabledText]}>
                                    {option.subtitle}
                                </Text>
                            </View>
                            {option.disabled && (
                                <View style={styles.loadingContainer}>
                                    <Ionicons name="hourglass-outline" size={20} color={COLORS.secondary} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darker,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.light,
    },
    placeholder: {
        width: 34, // Same width as close button to center the title
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    disabledItem: {
        opacity: 0.6,
    },
    settingIcon: {
        width: 40,
        alignItems: 'center',
    },
    settingContent: {
        flex: 1,
        marginLeft: 15,
    },
    settingTitle: {
        fontSize: 16,
        fontFamily: FONTS.body,
        color: COLORS.light,
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.secondary,
    },
    disabledText: {
        color: COLORS.secondary,
    },
    loadingContainer: {
        marginLeft: 10,
    },
});

export default CircleSettings;