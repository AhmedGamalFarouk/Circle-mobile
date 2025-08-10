import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useProfileImages } from '../hooks/useProfileImages';
import ImagePickerModal from './ImagePicker/ImagePickerModal';
import { useTheme } from '../context/ThemeContext';
import { RADII } from '../constants/constants';

/**
 * Test component to demonstrate profile image functionality
 * This can be used for testing or as a reference implementation
 */
const ProfileImageTest = ({ userId = 'test-user' }) => {
    const { colors } = useTheme();
    const {
        isUploading,
        uploadProgress,
        uploadImage,
        deleteImage,
        PLACEHOLDER_AVATAR_URL,
        PLACEHOLDER_COVER_URL
    } = useProfileImages(userId);

    const [showImagePicker, setShowImagePicker] = useState(false);
    const [currentImageType, setCurrentImageType] = useState('avatar');
    const [avatarUrl, setAvatarUrl] = useState(PLACEHOLDER_AVATAR_URL);
    const [coverUrl, setCoverUrl] = useState(PLACEHOLDER_COVER_URL);

    const handleImageSelected = async (imageData) => {
        try {
            const result = await uploadImage(imageData, currentImageType);

            if (currentImageType === 'avatar') {
                setAvatarUrl(result.imageUrl);
            } else {
                setCoverUrl(result.imageUrl);
            }

            Alert.alert('Success', `${currentImageType} image uploaded successfully!`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDeleteImage = async (imageType) => {
        Alert.alert(
            'Delete Image',
            `Are you sure you want to delete the ${imageType} image?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await deleteImage(imageType);

                            if (imageType === 'avatar') {
                                setAvatarUrl(result.placeholderUrl);
                            } else {
                                setCoverUrl(result.placeholderUrl);
                            }

                            Alert.alert('Success', `${imageType} image deleted successfully!`);
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const openImagePicker = (imageType) => {
        setCurrentImageType(imageType);
        setShowImagePicker(true);
    };

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile Image Test</Text>

            {/* Cover Image Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cover Image</Text>
                <View style={styles.coverImageContainer}>
                    <Image source={{ uri: coverUrl }} style={styles.coverImage} />
                    {isUploading && currentImageType === 'cover' && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.progressText}>{uploadProgress}%</Text>
                        </View>
                    )}
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={() => openImagePicker('cover')}
                        disabled={isUploading}
                    >
                        <Text style={styles.buttonText}>Upload Cover</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.dangerButton]}
                        onPress={() => handleDeleteImage('cover')}
                        disabled={isUploading}
                    >
                        <Text style={styles.buttonText}>Delete Cover</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Avatar Image Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Picture</Text>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                    {isUploading && currentImageType === 'avatar' && (
                        <View style={styles.avatarLoadingOverlay}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    )}
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={() => openImagePicker('avatar')}
                        disabled={isUploading}
                    >
                        <Text style={styles.buttonText}>Upload Avatar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.dangerButton]}
                        onPress={() => handleDeleteImage('avatar')}
                        disabled={isUploading}
                    >
                        <Text style={styles.buttonText}>Delete Avatar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Section */}
            <View style={styles.statusSection}>
                <Text style={styles.statusText}>
                    Status: {isUploading ? `Uploading ${currentImageType}... ${uploadProgress}%` : 'Ready'}
                </Text>
            </View>

            <ImagePickerModal
                visible={showImagePicker}
                onClose={() => setShowImagePicker(false)}
                onImageSelected={handleImageSelected}
                imageType={currentImageType}
                title={`Select ${currentImageType === 'avatar' ? 'Profile Picture' : 'Cover Image'}`}
            />
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 30,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 15,
    },
    coverImageContainer: {
        width: '100%',
        height: 200,
        borderRadius: RADII.medium,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 15,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
    },
    avatarContainer: {
        alignSelf: 'center',
        position: 'relative',
        marginBottom: 15,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: colors.border,
    },
    avatarLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: RADII.medium,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    dangerButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    statusSection: {
        marginTop: 20,
        padding: 15,
        backgroundColor: colors.surface,
        borderRadius: RADII.medium,
    },
    statusText: {
        color: colors.text,
        textAlign: 'center',
        fontSize: 16,
    },
});

export default ProfileImageTest;