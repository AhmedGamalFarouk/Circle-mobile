import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImageToCloudinary, deleteImageFromCloudinary, getOptimizedImageUrl } from '../utils/cloudinaryUpload';

const PLACEHOLDER_AVATAR_URL = 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_avatar.png';
const PLACEHOLDER_COVER_URL = 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_cover.png';

export const useProfileImages = (userId) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadImage = useCallback(async (imageData, imageType) => {
        if (!userId) {
            throw new Error('User ID is required');
        }

        if (!imageData || !imageData.base64) {
            throw new Error('Invalid image data');
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            // Simulate upload progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            console.log(`Uploading ${imageType} image to Cloudinary...`);
            const result = await uploadImageToCloudinary(userId, imageData.base64, imageType);

            clearInterval(progressInterval);
            setUploadProgress(100);

            console.log(`${imageType} image uploaded successfully:`, result.imageUrl);

            // Get optimized URL for better performance
            const optimizedUrl = getOptimizedImageUrl(result.publicId, imageType) || result.imageUrl;

            // Prepare data for Firestore
            const updateData = {};
            if (imageType === 'avatar') {
                updateData.avatarPhoto = optimizedUrl;
                updateData.avatarPhotoPublicId = result.publicId;
            } else if (imageType === 'cover') {
                updateData.coverPhoto = optimizedUrl;
                updateData.coverPhotoPublicId = result.publicId;
            }

            // Update Firestore
            await setDoc(doc(db, 'users', userId), updateData, { merge: true });

            return {
                success: true,
                imageUrl: optimizedUrl,
                publicId: result.publicId,
                originalResult: result
            };
        } catch (error) {
            console.error(`Error uploading ${imageType} image:`, error);
            throw new Error(`Failed to upload ${imageType} image: ${error.message}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [userId]);

    const deleteImage = useCallback(async (imageType, currentPublicId = null) => {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            setIsUploading(true);

            // Try to delete from Cloudinary using the stored public_id
            if (currentPublicId) {
                try {
                    await deleteImageFromCloudinary(currentPublicId, imageType);
                } catch (cloudinaryError) {
                    console.warn('Cloudinary deletion failed, but continuing with local cleanup:', cloudinaryError);
                }
            } else {
                console.warn('No public_id provided, skipping Cloudinary deletion');
            }

            // Prepare data for Firestore
            const updateData = {};
            if (imageType === 'avatar') {
                updateData.avatarPhoto = PLACEHOLDER_AVATAR_URL;
                updateData.avatarPhotoPublicId = null;
            } else if (imageType === 'cover') {
                updateData.coverPhoto = PLACEHOLDER_COVER_URL;
                updateData.coverPhotoPublicId = null;
            }

            // Update Firestore
            await setDoc(doc(db, 'users', userId), updateData, { merge: true });

            return {
                success: true,
                placeholderUrl: imageType === 'avatar' ? PLACEHOLDER_AVATAR_URL : PLACEHOLDER_COVER_URL
            };
        } catch (error) {
            console.error(`Error deleting ${imageType} image:`, error);
            throw new Error(`Failed to delete ${imageType} image: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    }, [userId]);

    const getImageUrl = useCallback((publicId, imageType, fallbackUrl) => {
        if (!publicId) {
            return fallbackUrl || (imageType === 'avatar' ? PLACEHOLDER_AVATAR_URL : PLACEHOLDER_COVER_URL);
        }

        return getOptimizedImageUrl(publicId, imageType) || fallbackUrl;
    }, []);

    return {
        isUploading,
        uploadProgress,
        uploadImage,
        deleteImage,
        getImageUrl,
        PLACEHOLDER_AVATAR_URL,
        PLACEHOLDER_COVER_URL
    };
};

export default useProfileImages;