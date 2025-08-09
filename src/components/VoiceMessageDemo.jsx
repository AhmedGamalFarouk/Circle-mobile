import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS } from '../constants/constants';
// VoiceRecorder is now integrated into ChatInputBar
import VoicePlayer from './VoicePlayer';
import { uploadAudioToCloudinary } from '../utils/cloudinaryUpload';

const VoiceMessageDemo = () => {
    const [showRecorder, setShowRecorder] = useState(false);
    const [voiceMessages, setVoiceMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleRecordingComplete = async ({ uri, duration }) => {
        setShowRecorder(false);
        setIsUploading(true);

        try {
            const uploadResult = await uploadAudioToCloudinary(uri);

            if (uploadResult.success) {
                const newMessage = {
                    id: Date.now().toString(),
                    audioUrl: uploadResult.url,
                    duration: duration,
                    timestamp: new Date(),
                };

                setVoiceMessages(prev => [...prev, newMessage]);
                Alert.alert('Success', 'Voice message uploaded successfully!');
            } else {
                Alert.alert('Error', `Upload failed: ${uploadResult.error}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload voice message');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRecordingCancel = () => {
        setShowRecorder(false);
    };

    const clearMessages = () => {
        setVoiceMessages([]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Voice Message Demo</Text>
            <Text style={styles.subtitle}>Test the voice recording and playback functionality</Text>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.button, styles.recordButton]}
                    onPress={() => setShowRecorder(true)}
                    disabled={isUploading}
                >
                    <View style={styles.buttonContent}>
                        <Ionicons
                            name={isUploading ? "ellipsis-horizontal" : "mic"}
                            size={20}
                            color={COLORS.light}
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>
                            {isUploading ? 'Uploading...' : 'Record Voice Message'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {voiceMessages.length > 0 && (
                    <TouchableOpacity
                        style={[styles.button, styles.clearButton]}
                        onPress={clearMessages}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="trash-outline" size={20} color={COLORS.light} style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Clear Messages</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.messagesContainer}>
                {voiceMessages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No voice messages yet</Text>
                        <Text style={styles.emptySubtext}>Tap the record button to create your first voice message</Text>
                    </View>
                ) : (
                    voiceMessages.map((message, index) => (
                        <View key={message.id} style={styles.messageContainer}>
                            <Text style={styles.messageLabel}>Voice Message #{index + 1}</Text>
                            <VoicePlayer
                                audioUrl={message.audioUrl}
                                duration={message.duration}
                                isCurrentUser={index % 2 === 0} // Alternate styles for demo
                            />
                            <Text style={styles.timestamp}>
                                {message.timestamp.toLocaleTimeString()}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* VoiceRecorder is now integrated into ChatInputBar */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.light,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 30,
    },
    controls: {
        marginBottom: 20,
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: RADII.rounded,
        marginBottom: 10,
        alignItems: 'center',
        ...SHADOWS.card,
    },
    recordButton: {
        backgroundColor: COLORS.primary,
    },
    clearButton: {
        backgroundColor: COLORS.darker,
        borderWidth: 1,
        borderColor: COLORS.text,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '600',
    },
    messagesContainer: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.text,
        textAlign: 'center',
        opacity: 0.7,
    },
    messageContainer: {
        backgroundColor: COLORS.darker,
        borderRadius: RADII.rounded,
        padding: 15,
        marginBottom: 15,
        ...SHADOWS.card,
    },
    messageLabel: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 10,
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.text,
        marginTop: 8,
        textAlign: 'right',
    },
});

export default VoiceMessageDemo;