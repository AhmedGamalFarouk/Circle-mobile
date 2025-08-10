import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    Platform,
    Vibration
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { RADII } from '../../constants/constants';
import { validateImageFile, IMAGE_UPLOAD_SETTINGS } from '../../utils/cloudinaryUpload';

const ImagePickerModal = ({
    visible,
    onClose,
    onImageSelected,
    imageType = 'avatar',
    title = 'Select Image'
}) => {
    const { colors } = useTheme();

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera roll permissions to select images.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const pickImageFromLibrary = async () => {
        try {
            console.log('Starting image picker from library...');
            console.log('IMAGE_UPLOAD_SETTINGS:', IMAGE_UPLOAD_SETTINGS);

            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            // Haptic feedback
            if (Platform.OS === 'ios') {
                Vibration.vibrate(10);
            } else {
                Vibration.vibrate(30);
            }

            const aspectRatio = imageType === 'avatar' ? [1, 1] : [16, 9];

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: aspectRatio,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                console.log('Selected asset:', {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    fileSize: asset.fileSize
                });

                // Validate file
                const validation = validateImageFile(asset.uri, imageType);
                console.log('Validation result:', validation);

                if (!validation.valid) {
                    Alert.alert('Invalid File', validation.error);
                    return;
                }

                // Check file size (if available)
                const maxFileSize = IMAGE_UPLOAD_SETTINGS?.MAX_FILE_SIZE || 5 * 1024 * 1024; // 5MB default
                console.log('File size check:', { fileSize: asset.fileSize, maxFileSize });

                if (asset.fileSize && asset.fileSize > maxFileSize) {
                    Alert.alert(
                        'File Too Large',
                        `Please select an image smaller than ${maxFileSize / (1024 * 1024)}MB`
                    );
                    return;
                }

                console.log('Image validation passed, calling onImageSelected');
                onImageSelected({
                    uri: asset.uri,
                    base64: asset.base64,
                    width: asset.width,
                    height: asset.height,
                    fileSize: asset.fileSize
                });
                onClose();
            }
        } catch (error) {
            console.error('Error picking image from library:', error);
            Alert.alert('Error', `Failed to select image from library: ${error.message}`);
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Sorry, we need camera permissions to take photos.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Haptic feedback
            if (Platform.OS === 'ios') {
                Vibration.vibrate(10);
            } else {
                Vibration.vibrate(30);
            }

            const aspectRatio = imageType === 'avatar' ? [1, 1] : [16, 9];

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: aspectRatio,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];

                // Validate file
                const validation = validateImageFile(asset.uri, imageType);
                if (!validation.valid) {
                    Alert.alert('Invalid File', validation.error);
                    return;
                }

                onImageSelected({
                    uri: asset.uri,
                    base64: asset.base64,
                    width: asset.width,
                    height: asset.height,
                    fileSize: asset.fileSize
                });
                onClose();
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const styles = getStyles(colors);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalSubtitle}>
                        {imageType === 'avatar'
                            ? 'Choose a profile picture'
                            : 'Choose a cover image'
                        }
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={pickImageFromLibrary}
                    >
                        <Text style={styles.buttonText}>📷 Choose from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={takePhoto}
                    >
                        <Text style={styles.buttonText}>📸 Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onClose}
                    >
                        <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalView: {
        margin: 20,
        backgroundColor: colors.surface,
        borderRadius: RADII.large,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalSubtitle: {
        marginBottom: 25,
        textAlign: 'center',
        fontSize: 14,
        color: colors.textSecondary,
    },
    button: {
        borderRadius: RADII.medium,
        padding: 15,
        width: '100%',
        marginBottom: 12,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 8,
    },
    buttonText: {
        color: colors.textInverse,
        fontWeight: '600',
        fontSize: 16,
    },
    cancelButtonText: {
        color: colors.text,
    },
});

export default ImagePickerModal;