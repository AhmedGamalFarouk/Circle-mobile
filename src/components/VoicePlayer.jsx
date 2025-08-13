import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS } from '../constants/constants';

const VoicePlayer = ({ audioUrl, duration, isCurrentUser, timestamp, onPlaybackStatusUpdate }) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(duration * 1000 || 0);
    const [audioModeSet, setAudioModeSet] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

    const speedOptions = [1.0, 1.25, 1.5, 2.0];

    const waveformAnim = useRef(new Animated.Value(0)).current;
    const playButtonScale = useRef(new Animated.Value(1)).current;

    // Set up audio mode on component mount
    useEffect(() => {
        const setupAudioMode = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
                setAudioModeSet(true);
            } catch (error) {
                console.error('Error setting audio mode:', error);
                setAudioModeSet(true); // Continue anyway
            }
        };

        setupAudioMode();
    }, []);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync().catch(error => {
                    console.error('Error unloading sound:', error);
                });
            }
            : undefined;
    }, [sound]);

    useEffect(() => {
        if (isPlaying) {
            // Simple pulsing animation for the play button
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(waveformAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(waveformAnim, {
                        toValue: 0.7,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();

            return () => pulseAnimation.stop();
        } else {
            waveformAnim.setValue(1);
        }
    }, [isPlaying]);



    const playSound = async () => {
        if (!audioModeSet) {
            return;
        }

        try {
            setIsLoading(true);

            // Animate button press
            Animated.sequence([
                Animated.timing(playButtonScale, {
                    toValue: 0.9,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(playButtonScale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            if (sound) {
                // Check if sound is loaded before trying to play/pause
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    if (isPlaying) {
                        await sound.pauseAsync();
                        setIsPlaying(false);
                    } else {
                        // If at the end or finished, reset to beginning for replay
                        if (status.positionMillis >= status.durationMillis - 100 || status.didJustFinish) {
                            await resetAndPlay(sound);
                        } else {
                            await sound.playAsync();
                            setIsPlaying(true);
                        }
                    }
                } else {
                    // Sound exists but not loaded, recreate it
                    try {
                        await sound.unloadAsync();
                    } catch (unloadError) {
                        console.error('Error unloading sound:', unloadError);
                    }
                    setSound(null);
                    // Recursively call playSound to create new sound
                    setIsLoading(false);
                    return playSound();
                }
            } else {
                // Create new sound
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    {
                        shouldPlay: false,
                        rate: playbackSpeed,
                        shouldCorrectPitch: true,
                    }, // Don't auto-play, wait for load
                    (status) => {
                        if (status.isLoaded) {
                            setPlaybackPosition(status.positionMillis || 0);
                            setPlaybackDuration(status.durationMillis || duration * 1000);

                            if (status.didJustFinish) {
                                setIsPlaying(false);
                                // Reset position to beginning for next play
                                setTimeout(() => {
                                    setPlaybackPosition(0);
                                }, 100);
                            }
                        }
                    }
                );

                setSound(newSound);

                // Wait for the sound to be loaded before playing
                let attempts = 0;
                const maxAttempts = 10;

                while (attempts < maxAttempts) {
                    const status = await newSound.getStatusAsync();
                    if (status.isLoaded) {
                        // Use resetAndPlay to ensure proper initialization
                        await resetAndPlay(newSound);
                        break;
                    }

                    // Wait a bit before checking again
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                if (attempts >= maxAttempts) {
                    throw new Error('Sound failed to load after multiple attempts');
                }
            }
        } catch (error) {
            console.error('Error playing sound:', error);
            Alert.alert('Error', 'Failed to play voice message. Please check your internet connection and try again.');
            setIsPlaying(false);

            // Clean up failed sound
            if (sound) {
                try {
                    await sound.unloadAsync();
                } catch (cleanupError) {
                    console.error('Error cleaning up sound:', cleanupError);
                }
                setSound(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInMinutes = (now - messageDate) / (1000 * 60);
        const diffInHours = diffInMinutes / 60;
        const diffInDays = diffInHours / 24;

        if (diffInMinutes < 1) {
            return 'now';
        } else if (diffInMinutes < 60) {
            return `${Math.floor(diffInMinutes)}m`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h`;
        } else if (diffInDays < 7) {
            return `${Math.floor(diffInDays)}d`;
        } else {
            return messageDate.toLocaleDateString();
        }
    };

    const getProgressPercentage = () => {
        if (playbackDuration === 0) return 0;
        return (playbackPosition / playbackDuration) * 100;
    };

    const cyclePlaybackSpeed = async () => {
        const currentIndex = speedOptions.indexOf(playbackSpeed);
        const nextIndex = (currentIndex + 1) % speedOptions.length;
        const newSpeed = speedOptions[nextIndex];

        setPlaybackSpeed(newSpeed);

        // If sound is loaded, update its playback rate
        if (sound) {
            try {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    await sound.setRateAsync(newSpeed, true); // true = shouldCorrectPitch
                }
            } catch (error) {
                console.error('Error changing playback speed:', error);
            }
        }
    };

    const resetAndPlay = async (soundInstance) => {
        try {
            await soundInstance.setPositionAsync(0);
            setPlaybackPosition(0);
            await soundInstance.setRateAsync(playbackSpeed, true);
            await soundInstance.playAsync();
            setIsPlaying(true);
        } catch (error) {
            console.error('Error resetting and playing:', error);
            throw error;
        }
    };

    const renderWaveform = () => {
        const bars = Array.from({ length: 20 }, (_, index) => {
            const baseHeight = Math.random() * 20 + 10;
            const isActive = index / 20 <= getProgressPercentage() / 100;

            return (
                <View
                    key={index}
                    style={[
                        styles.waveformBar,
                        {
                            height: isPlaying ? baseHeight : baseHeight * 0.3,
                            backgroundColor: isActive ? (isCurrentUser ? 'rgba(255, 255, 255, 0.9)' : COLORS.primary) : 'rgba(255, 255, 255, 0.4)',
                            opacity: isPlaying ? (isActive ? 1 : 0.6) : 0.4,
                        },
                    ]}
                />
            );
        });

        return <View style={styles.waveform}>{bars}</View>;
    };

    return (
        <View style={[
            styles.container,
            isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
        ]}>
            <Animated.View style={{
                transform: [{ scale: playButtonScale }],
                opacity: isPlaying ? waveformAnim : 1
            }}>
                <TouchableOpacity
                    style={[
                        styles.playButton,
                        isCurrentUser ? styles.currentUserPlayButton : styles.otherUserPlayButton,
                        isLoading && styles.loadingButton
                    ]}
                    onPress={playSound}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isLoading ? 'ellipsis-horizontal' : isPlaying ? 'pause' : 'play'}
                        size={16}
                        color={isCurrentUser ? COLORS.light : COLORS.light}
                    />
                </TouchableOpacity>
            </Animated.View>

            <View style={styles.audioInfo}>
                {renderWaveform()}
                <View style={styles.controlsContainer}>
                    <Text style={[
                        styles.timeText,
                        isCurrentUser ? styles.currentUserTimeText : styles.otherUserTimeText
                    ]}>
                        {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
                    </Text>
                    <TouchableOpacity
                        style={styles.speedButton}
                        onPress={cyclePlaybackSpeed}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.speedText,
                            isCurrentUser ? styles.currentUserSpeedText : styles.otherUserSpeedText
                        ]}>
                            {playbackSpeed}x
                        </Text>
                    </TouchableOpacity>
                </View>

                {timestamp && (
                    <Text style={[
                        styles.timestampText,
                        isCurrentUser ? styles.currentUserTimestampText : styles.otherUserTimestampText
                    ]}>
                        {formatTimestamp(timestamp)}
                    </Text>
                )}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: RADII.rounded,
        minWidth: 200,
        maxWidth: 280,
        ...SHADOWS.card,
    },
    currentUserContainer: {
        backgroundColor: COLORS.accent,
    },
    otherUserContainer: {
        backgroundColor: '#333',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    currentUserPlayButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    otherUserPlayButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    loadingButton: {
        opacity: 0.7,
    },

    audioInfo: {
        flex: 1,
    },
    waveform: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        marginBottom: 4,
    },
    waveformBar: {
        width: 2,
        marginHorizontal: 1,
        borderRadius: 1,
        opacity: 0.8,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 11,
        fontWeight: '500',
        flex: 1,
    },
    currentUserTimeText: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    otherUserTimeText: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    speedButton: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginLeft: 8,
    },
    speedText: {
        fontSize: 10,
        fontWeight: '600',
    },
    currentUserSpeedText: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    otherUserSpeedText: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    timestampText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    currentUserTimestampText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    otherUserTimestampText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
});

export default VoicePlayer;