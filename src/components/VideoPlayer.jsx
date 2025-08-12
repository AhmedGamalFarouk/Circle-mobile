import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII } from '../constants/constants';

const VideoPlayer = ({ videoUrl, width, height, aspectRatio, style }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const videoRef = useRef(null);

    const handlePlayPause = async () => {
        try {
            if (videoRef.current) {
                if (isPlaying) {
                    await videoRef.current.pauseAsync();
                } else {
                    await videoRef.current.playAsync();
                }
                setIsPlaying(!isPlaying);
            }
        } catch (error) {
            console.error('Error controlling video playback:', error);
            Alert.alert('Error', 'Failed to play video');
        }
    };

    const handleVideoPress = () => {
        setShowControls(!showControls);
        setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={styles.videoContainer}
                onPress={handleVideoPress}
                activeOpacity={0.9}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: videoUrl }}
                    style={[
                        styles.video,
                        {
                            width: width || '100%',
                            height: height || 200,
                            aspectRatio: typeof aspectRatio === 'number' ? aspectRatio : 16 / 9,
                        }
                    ]}
                    resizeMode="cover"
                    shouldPlay={false}
                    isLooping={false}
                    onPlaybackStatusUpdate={(status) => {
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                            setShowControls(true);
                        }
                    }}
                />

                {showControls && (
                    <View style={styles.controlsOverlay}>
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={handlePlayPause}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={40}
                                color="rgba(255, 255, 255, 0.9)"
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        borderRadius: RADII.medium,
        overflow: 'hidden',
        backgroundColor: COLORS.darker,
    },
    videoContainer: {
        position: 'relative',
    },
    video: {
        borderRadius: RADII.medium,
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 30,
        padding: 10,
    },
});

export default VideoPlayer;