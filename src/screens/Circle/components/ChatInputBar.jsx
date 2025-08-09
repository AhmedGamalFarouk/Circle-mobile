import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform,
    Alert,
    Animated,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";
import useAuth from "../../../hooks/useAuth";
import { COLORS, RADII } from "../../../constants/constants";
import useUserProfile from "../../../hooks/useUserProfile";
import { uploadAudioToCloudinary } from "../../../utils/cloudinaryUpload";

const ChatInputBar = ({ circleId, replyingTo, onCancelReply }) => {
    const [message, setMessage] = useState("");
    const [inputHeight, setInputHeight] = useState(40);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isUploadingVoice, setIsUploadingVoice] = useState(false);
    const [recording, setRecording] = useState(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    const { user } = useAuth();
    const { profile: userProfile } = useUserProfile(user?.uid);
    const textInputRef = useRef(null);
    const timerRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const insets = useSafeAreaInsets();

    // Auto-focus when replying
    useEffect(() => {
        if (replyingTo && textInputRef.current && !isRecording) {
            textInputRef.current.focus();
        }
    }, [replyingTo, isRecording]);

    // Handle recording animation and timer
    useEffect(() => {
        if (isRecording) {
            // Start pulse animation
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            return () => {
                pulseAnimation.stop();
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        } else {
            pulseAnim.setValue(1);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    }, [isRecording]);

    const handleSend = async () => {
        if (message.trim() === "" || !userProfile) return;

        const messageData = {
            messageType: "text",
            text: message,
            timeStamp: serverTimestamp(),
            user: {
                userId: user.uid,
                userName: userProfile.username,
                imageurl: userProfile.avatarPhoto || null,
            },
            replyTo: replyingTo ? {
                messageId: replyingTo.id,
                text: replyingTo.text,
                userName: replyingTo.user.userName,
            } : null,
        };

        try {
            await addDoc(collection(db, "circles", circleId, "chat"), messageData);
            setMessage("");
            if (replyingTo) {
                onCancelReply();
            }
            // Keep focus on input after sending
            textInputRef.current?.focus();
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    const startRecording = async () => {
        try {
            if (permissionResponse?.status !== 'granted') {
                const permission = await requestPermission();
                if (permission.status !== 'granted') {
                    Alert.alert('Permission Required', 'Please grant microphone permission to record voice messages.');
                    return;
                }
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            setRecordingDuration(0);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            const uri = recording.getURI();
            const duration = recordingDuration;

            setRecording(null);
            setRecordingDuration(0);

            // Upload and send voice message
            await handleVoiceUpload(uri, duration);
        } catch (error) {
            console.error('Failed to stop recording', error);
            Alert.alert('Error', 'Failed to save recording. Please try again.');
        }
    };

    const cancelRecording = async () => {
        if (recording) {
            try {
                setIsRecording(false);
                await recording.stopAndUnloadAsync();
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                });
            } catch (error) {
                console.error('Failed to cancel recording', error);
            }
        }

        setRecording(null);
        setRecordingDuration(0);
    };

    const handleVoiceUpload = async (uri, duration) => {
        if (!userProfile) return;

        setIsUploadingVoice(true);

        try {
            // Upload audio to Cloudinary
            const uploadResult = await uploadAudioToCloudinary(uri);

            if (!uploadResult.success) {
                throw new Error(uploadResult.error);
            }

            const messageData = {
                messageType: "audio",
                audioUrl: uploadResult.url,
                duration: duration,
                timeStamp: serverTimestamp(),
                user: {
                    userId: user.uid,
                    userName: userProfile.username,
                    imageurl: userProfile.avatarPhoto || null,
                },
                replyTo: replyingTo ? {
                    messageId: replyingTo.id,
                    text: replyingTo.text || "Voice message",
                    userName: replyingTo.user.userName,
                } : null,
            };

            await addDoc(collection(db, "circles", circleId, "chat"), messageData);

            if (replyingTo) {
                onCancelReply();
            }
        } catch (error) {
            console.error("Error sending voice message: ", error);
            Alert.alert("Error", "Failed to send voice message. Please try again.");
        } finally {
            setIsUploadingVoice(false);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {replyingTo && (
                <View style={styles.replyingToContainer}>
                    <View style={styles.replyingToContent}>
                        <Text style={styles.replyingToUser}>{replyingTo.user.userName}</Text>
                        <Text style={styles.replyingToText} numberOfLines={1}>{replyingTo.text}</Text>
                    </View>
                    <TouchableOpacity onPress={onCancelReply}>
                        <Text style={styles.cancelReply}>×</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.container}>
                {isRecording ? (
                    // Recording Mode UI
                    <>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={cancelRecording}
                        >
                            <Ionicons name="trash-outline" size={20} color={COLORS.text} />
                        </TouchableOpacity>

                        <View style={styles.recordingContainer}>
                            <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
                                <View style={styles.recordingDot} />
                            </Animated.View>
                            <Text style={styles.recordingText}>Recording...</Text>
                            <Text style={styles.recordingTimer}>{formatDuration(recordingDuration)}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.sendVoiceButton}
                            onPress={stopRecording}
                        >
                            <Ionicons name="send" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    // Normal Mode UI
                    <>
                        <TouchableOpacity
                            style={styles.voiceButton}
                            onPress={startRecording}
                            disabled={isUploadingVoice}
                        >
                            <Ionicons
                                name={isUploadingVoice ? "ellipsis-horizontal" : "mic"}
                                size={20}
                                color={isUploadingVoice ? COLORS.text : COLORS.primary}
                                style={isUploadingVoice && styles.disabledIcon}
                            />
                        </TouchableOpacity>
                        <TextInput
                            ref={textInputRef}
                            style={[styles.input, { height: Math.max(40, inputHeight) }]}
                            placeholder="Type your message"
                            placeholderTextColor={COLORS.text}
                            value={message}
                            onChangeText={setMessage}
                            multiline={true}
                            maxLength={500}
                            returnKeyType="send"
                            onSubmitEditing={handleSend}
                            blurOnSubmit={false}
                            onContentSizeChange={(event) => {
                                setInputHeight(event.nativeEvent.contentSize.height);
                            }}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !message.trim() && styles.disabledButton]}
                            disabled={!message.trim()}
                            onPress={handleSend}
                        >
                            <Text style={[styles.sendText, !message.trim() && styles.disabledText]}>Send</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: COLORS.dark,
        borderTopWidth: 1,
        borderTopColor: COLORS.glass,
    },
    replyingToContainer: {
        backgroundColor: COLORS.darker,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    replyingToContent: {
        flex: 1,
    },
    replyingToUser: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 2,
    },
    replyingToText: {
        color: COLORS.text,
        fontSize: 14,
    },
    cancelReply: {
        color: COLORS.text,
        fontSize: 20,
        marginLeft: 15,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: COLORS.dark,
    },
    voiceButton: {
        padding: 8,
        marginBottom: 2,
    },
    voiceIcon: {
        fontSize: 20,
        color: COLORS.primary,
    },
    disabledIcon: {
        opacity: 0.5,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: COLORS.darker,
        borderRadius: RADII.pill,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: COLORS.light,
        marginHorizontal: 10,
        fontSize: 16,
        textAlignVertical: Platform.OS === 'android' ? 'top' : 'center',
    },
    sendButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 2,
    },
    sendText: {
        color: COLORS.primary,
        fontWeight: "600",
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        color: COLORS.text,
    },
    // Recording Mode Styles
    deleteButton: {
        padding: 8,
        marginBottom: 2,
    },

    recordingContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.darker,
        borderRadius: RADII.pill,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 10,
        minHeight: 40,
    },
    recordingIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        marginRight: 12,
    },
    recordingDot: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
    recordingText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
        marginRight: 12,
    },
    recordingTimer: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginLeft: 'auto',
    },
    sendVoiceButton: {
        padding: 8,
        marginBottom: 2,
    },

});

export default ChatInputBar;