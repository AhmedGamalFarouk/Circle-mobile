import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageViewer = ({ imageUrl, style, imageStyle, children }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const openFullScreen = () => {
        setIsFullScreen(true);
    };

    const closeFullScreen = () => {
        setIsFullScreen(false);
    };

    return (
        <>
            <TouchableOpacity
                style={style}
                onPress={openFullScreen}
                activeOpacity={0.9}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={imageStyle}
                    resizeMode="contain"
                />
                {children}
            </TouchableOpacity>

            <Modal
                visible={isFullScreen}
                transparent={true}
                animationType="fade"
                onRequestClose={closeFullScreen}
            >
                <StatusBar hidden />
                <SafeAreaView style={styles.fullScreenContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeFullScreen}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={30} color={COLORS.light} />
                    </TouchableOpacity>

                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth,
        height: screenHeight,
    },
    fullScreenImage: {
        width: screenWidth,
        height: screenHeight,
    },
});

export default ImageViewer;