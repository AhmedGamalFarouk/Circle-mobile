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
    Image,
    Modal,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";
import useAuth from "../../../hooks/useAuth";
import { COLORS, RADII } from "../../../constants/constants";
import useUserProfile from "../../../hooks/useUserProfile";
import { uploadAudioToCloudinary, uploadChatMediaToCloudinary } from "../../../utils/cloudinaryUpload";

const ChatInputBar = ({ circleId, replyingTo, onCancelReply }) => {
    const [message, setMessage] = useState("");
    const [inputHeight, setInputHeight] = useState(40);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isUploadingVoice, setIsUploadingVoice] = useState(false);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [recording, setRecording] = useState(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [showMediaOptions, setShowMediaOptions] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);

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

    // Media attachment functions
    const requestMediaPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant media library permissions to attach photos and videos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const requestCameraPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant camera permissions to take photos and videos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const pickImageFromLibrary = async () => {
        try {
            const hasPermission = await requestMediaPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedMedia({
                    uri: result.assets[0].uri,
                    type: 'image',
                    width: result.assets[0].width,
                    height: result.assets[0].height,
                });
                setShowMediaOptions(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const pickVideoFromLibrary = async () => {
        try {
            const hasPermission = await requestMediaPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                videoMaxDuration: 60, // 60 seconds max
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedMedia({
                    uri: result.assets[0].uri,
                    type: 'video',
                    duration: result.assets[0].duration,
                    width: result.assets[0].width,
                    height: result.assets[0].height,
                });
                setShowMediaOptions(false);
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Alert.alert('Error', 'Failed to pick video. Please try again.');
        }
    };

    const takePhoto = async () => {
        try {
            const hasPermission = await requestCameraPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedMedia({
                    uri: result.assets[0].uri,
                    type: 'image',
                    width: result.assets[0].width,
                    height: result.assets[0].height,
                });
                setShowMediaOptions(false);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const takeVideo = async () => {
        try {
            const hasPermission = await requestCameraPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                videoMaxDuration: 60, // 60 seconds max
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedMedia({
                    uri: result.assets[0].uri,
                    type: 'video',
                    duration: result.assets[0].duration,
                    width: result.assets[0].width,
                    height: result.assets[0].height,
                });
                setShowMediaOptions(false);
            }
        } catch (error) {
            console.error('Error taking video:', error);
            Alert.alert('Error', 'Failed to take video. Please try again.');
        }
    };

    const sendMediaMessage = async () => {
        if (!selectedMedia || !userProfile) return;

        setIsUploadingMedia(true);

        try {
            console.log('Replying to:', replyingTo);
            // Upload media to Cloudinary
            const uploadResult = await uploadChatMediaToCloudinary(selectedMedia.uri, selectedMedia.type, circleId);

            const messageData = {
                messageType: selectedMedia.type,
                mediaUrl: uploadResult.mediaUrl,
                mediaPublicId: uploadResult.publicId,
                mediaWidth: uploadResult.width || selectedMedia.width,
                mediaHeight: uploadResult.height || selectedMedia.height,
                timeStamp: serverTimestamp(),
                user: {
                    userId: user.uid,
                    userName: userProfile.username,
                    imageurl: userProfile.avatarPhoto || null,
                },
                replyTo: replyingTo ? {
                    messageId: replyingTo.id,
                    text: replyingTo.text || `${selectedMedia.type} message`,
                    userName: replyingTo.user.userName,
                } : null,
            };

            // Add duration for videos
            if (selectedMedia.type === 'video') {
                messageData.mediaDuration = uploadResult.duration || selectedMedia.duration;
            }
            console.log('Sending media message data:', messageData);
            await addDoc(collection(db, "circles", circleId, "chat"), messageData);

            // Clear selected media and reply
            setSelectedMedia(null);
            if (replyingTo) {
                onCancelReply();
            }
        } catch (error) {
            console.error("Error sending media message: ", error);
            Alert.alert("Error", "Failed to send media. Please try again.");
        } finally {
            setIsUploadingMedia(false);
        }
    };

    const removeSelectedMedia = () => {
        setSelectedMedia(null);
    };

    return (
        <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {replyingTo && (
                <View style={styles.replyingToContainer}>
                    <View style={styles.replyingToContent}>
                        <Text style={styles.replyingToUser}>{replyingTo.user.userName}</Text>
                        <Text style={styles.replyingToText} numberOfLines={1}>
                            {replyingTo.text ||
                                (replyingTo.messageType === 'image' ? 'Photo' :
                                    replyingTo.messageType === 'video' ? 'Video' :
                                        replyingTo.messageType === 'audio' ? 'Voice message' : 'Message')}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onCancelReply}>
                        <Text style={styles.cancelReply}>×</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Selected Media Preview */}
            {selectedMedia && (
                <View style={styles.mediaPreviewContainer}>
                    <View style={styles.mediaPreview}>
                        {selectedMedia.type === 'image' ? (
                            <Image source={{ uri: selectedMedia.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.videoPreview}>
                                <Ionicons name="videocam" size={40} color={COLORS.primary} />
                                <Text style={styles.videoText}>Video</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.removeMediaButton}
                            onPress={removeSelectedMedia}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={16} color={COLORS.light} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.sendMediaButton, isUploadingMedia && styles.disabledButton]}
                        onPress={sendMediaMessage}
                        disabled={isUploadingMedia}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.sendMediaText}>
                            {isUploadingMedia ? 'Uploading...' : 'Send'}
                        </Text>
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
                            activeOpacity={0.7}
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
                            activeOpacity={0.8}
                        >
                            <Ionicons name="send" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    // Normal Mode UI
                    <>
                        <TouchableOpacity
                            style={styles.attachButton}
                            onPress={() => setShowMediaOptions(true)}
                            disabled={isUploadingVoice || isUploadingMedia || !!selectedMedia}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="attach"
                                size={20}
                                color={(isUploadingVoice || isUploadingMedia || !!selectedMedia) ? COLORS.text : COLORS.primary}
                                style={(isUploadingVoice || isUploadingMedia || !!selectedMedia) && styles.disabledIcon}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.voiceButton}
                            onPress={startRecording}
                            disabled={isUploadingVoice || !!selectedMedia}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isUploadingVoice ? "ellipsis-horizontal" : "mic"}
                                size={20}
                                color={(isUploadingVoice || !!selectedMedia) ? COLORS.text : COLORS.primary}
                                style={(isUploadingVoice || !!selectedMedia) && styles.disabledIcon}
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
                            style={[styles.sendButton, (!message.trim() || !!selectedMedia) && styles.disabledButton]}
                            disabled={!message.trim() || !!selectedMedia}
                            onPress={handleSend}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.sendText, (!message.trim() || !!selectedMedia) && styles.disabledText]}>Send</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Media Options Modal */}
            <Modal
                visible={showMediaOptions}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMediaOptions(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMediaOptions(false)}
                >
                    <View style={styles.mediaOptionsContainer}>
                        <Text style={styles.mediaOptionsTitle}>Attach Media</Text>

                        <TouchableOpacity style={styles.mediaOption} onPress={takePhoto} activeOpacity={0.7}>
                            <Ionicons name="camera" size={24} color={COLORS.primary} />
                            <Text style={styles.mediaOptionText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.mediaOption} onPress={pickImageFromLibrary} activeOpacity={0.7}>
                            <Ionicons name="image" size={24} color={COLORS.primary} />
                            <Text style={styles.mediaOptionText}>Photo Library</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.mediaOption} onPress={takeVideo} activeOpacity={0.7}>
                            <Ionicons name="videocam" size={24} color={COLORS.primary} />
                            <Text style={styles.mediaOptionText}>Take Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.mediaOption} onPress={pickVideoFromLibrary} activeOpacity={0.7}>
                            <Ionicons name="film" size={24} color={COLORS.primary} />
                            <Text style={styles.mediaOptionText}>Video Library</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelOption}
                            onPress={() => setShowMediaOptions(false)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelOptionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    attachButton: {
        padding: 8,
        marginBottom: 2,
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

    // Media Preview Styles
    mediaPreviewContainer: {
        backgroundColor: COLORS.darker,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mediaPreview: {
        position: 'relative',
        marginRight: 12,
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: RADII.small,
    },
    videoPreview: {
        width: 60,
        height: 60,
        borderRadius: RADII.small,
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glass,
    },
    videoText: {
        color: COLORS.text,
        fontSize: 10,
        marginTop: 2,
    },
    removeMediaButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendMediaButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADII.pill,
    },
    sendMediaText: {
        color: COLORS.light,
        fontWeight: '600',
        fontSize: 14,
    },

    // Media Options Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaOptionsContainer: {
        backgroundColor: COLORS.dark,
        borderRadius: RADII.large,
        padding: 20,
        width: '80%',
        maxWidth: 300,
    },
    mediaOptionsTitle: {
        color: COLORS.light,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    mediaOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: RADII.medium,
        marginBottom: 8,
    },
    mediaOptionText: {
        color: COLORS.light,
        fontSize: 16,
        marginLeft: 15,
        fontWeight: '500',
    },
    cancelOption: {
        marginTop: 10,
        paddingVertical: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.glass,
    },
    cancelOptionText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },

});

export default ChatInputBar;