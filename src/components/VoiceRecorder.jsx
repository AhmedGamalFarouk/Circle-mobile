import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    Alert,
    Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS } from '../constants/constants';

const VoiceRecorder = ({ onRecordingComplete, onCancel, isVisible }) => {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef(null);

    useEffect(() => {
        if (isVisible) {
            // Animate in
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 300,
                friction: 6,
                useNativeDriver: true,
            }).start();
        } else {
            // Animate out
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    useEffect(() => {
        if (isRecording) {
            // Start pulse animation
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
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

            onRecordingComplete({ uri, duration });
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
        onCancel();
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isVisible) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.content}>
                {!isRecording ? (
                    <>
                        <Text style={styles.title}>Voice Message</Text>
                        <TouchableOpacity
                            style={styles.recordButton}
                            onPress={startRecording}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="mic" size={32} color={COLORS.light} />
                        </TouchableOpacity>
                        <Text style={styles.instruction}>Tap to start recording</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.recordingText}>Recording...</Text>
                        <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
                            <View style={styles.recordingDot} />
                        </Animated.View>
                        <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>
                        <View style={styles.recordingControls}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={cancelRecording}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.stopButton}
                                onPress={stopRecording}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="stop" size={24} color={COLORS.light} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    content: {
        backgroundColor: COLORS.dark,
        borderRadius: RADII.rounded,
        padding: 30,
        alignItems: 'center',
        minWidth: 280,
        ...SHADOWS.glassCard,
    },
    title: {
        color: COLORS.light,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        ...SHADOWS.btnPrimary,
    },
    instruction: {
        color: COLORS.text,
        fontSize: 14,
        textAlign: 'center',
    },
    recordingText: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    recordingIndicator: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.darker,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    recordingDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
    },
    duration: {
        color: COLORS.light,
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    recordingControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    cancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: RADII.pill,
        backgroundColor: COLORS.darker,
        borderWidth: 1,
        borderColor: COLORS.text,
    },
    cancelText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    stopButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.btnPrimary,
    },
});

export default VoiceRecorder;