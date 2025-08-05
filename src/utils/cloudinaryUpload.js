import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dwh8jhaot';
const CLOUDINARY_API_KEY = process.env.REACT_APP_CLOUDINARY_API_KEY || '861252578513848';
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'images';
// Note: For production, API secret should be on server-side only

// Image type configurations for different upload scenarios
const IMAGE_CONFIGS = {
    avatar: {
        transformation: 'c_fill,w_400,h_400,q_auto,f_auto',
        folder: 'users/profiles/avatars'
    },
    cover: {
        transformation: 'c_fill,w_1200,h_400,q_auto,f_auto',
        folder: 'users/profiles/covers'
    },
    circle: {
        transformation: 'c_fill,w_800,h_600,q_auto,f_auto',
        folder: 'circles/images'
    },
    media: {
        transformation: 'c_fill,w_600,h_600,q_auto,f_auto',
        folder: 'users/media'
    }
};

export const uploadImageToCloudinary = async (userId, imageBase64, imageType, options = {}) => {
    try {
        console.log('Starting Cloudinary upload for:', imageType);

        const config = IMAGE_CONFIGS[imageType] || IMAGE_CONFIGS.media;

        // Prepare form data for Cloudinary upload
        const formData = new FormData();
        // Detect MIME type from options or default to jpeg
        const mimeType = options.mimeType || 'image/jpeg';
        formData.append('file', `data:${mimeType};base64,${imageBase64}`);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Use specific folder based on image type
        const folder = options.customFolder || `${config.folder}/${userId}`;
        formData.append('folder', folder);

        // Create unique public_id (overwrite not allowed in unsigned uploads)
        const publicId = options.publicId || `${imageType}_${Date.now()}`;
        formData.append('public_id', publicId);

        // Transformation parameters are now handled by the Cloudinary preset

        console.log('Uploading to Cloudinary with preset:', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const result = await response.json();
        console.log('Cloudinary response:', result);

        if (!response.ok) {
            console.error('Cloudinary error response:', result);

            // Provide more specific error messages
            let errorMessage = 'Unknown error occurred';
            if (result.error?.message?.includes('preset')) {
                errorMessage = `Upload preset "${CLOUDINARY_UPLOAD_PRESET}" not found. Please create this preset in your Cloudinary dashboard or use 'ml_default'.`;
            } else if (result.error?.message?.includes('Overwrite parameter')) {
                errorMessage = 'Overwrite parameter not allowed in unsigned uploads. This has been fixed in the code.';
            } else if (result.error?.message) {
                errorMessage = result.error.message;
            }

            throw new Error(`Cloudinary upload failed: ${errorMessage}`);
        }

        const imageUrl = result.secure_url;
        console.log('Image uploaded successfully to Cloudinary:', imageUrl);

        // Update Firestore only for profile images (avatar/cover)
        if ((imageType === 'avatar' || imageType === 'cover') && !options.skipFirestoreUpdate) {
            const userRef = doc(db, 'users', userId);
            const updateData = {};
            updateData[imageType === 'avatar' ? 'avatarUrl' : 'coverUrl'] = imageUrl;

            await updateDoc(userRef, updateData);
            console.log('Firestore updated successfully with new image URL');
        }

        return { success: true, imageUrl };
    } catch (error) {
        console.error('Error in Cloudinary upload process:', error);
        throw error;
    }
};

// Specific function for uploading circle images
export const uploadCircleImageToCloudinary = async (imageUri, circleId) => {
    try {
        console.log('Starting circle image upload for circle:', circleId);

        // Convert image URI to base64
        const response = await fetch(imageUri);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    // Extract MIME type from data URL
                    const [prefix, base64] = reader.result.split(',');
                    const mimeTypeMatch = prefix.match(/data:(.*);base64/);
                    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

                    const result = await uploadImageToCloudinary(
                        circleId,
                        base64,
                        'circle',
                        {
                            customFolder: 'circles/images',
                            publicId: `circle_${circleId}`,
                            skipFirestoreUpdate: true,
                            mimeType
                        }
                    );

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error uploading circle image:', error);
        throw error;
    }
};

export const deleteImageFromCloudinary = async (userId, imageType) => {
    try {
        console.log('Deleting image from profile:', imageType);

        // Remove the image URL from Firestore
        // Note: Actual Cloudinary deletion requires server-side implementation with API secret
        // For now, we just remove the reference from the user's profile
        const userRef = doc(db, 'users', userId);
        const updateData = {};
        updateData[imageType === 'avatar' ? 'avatarUrl' : 'coverUrl'] = null;

        await updateDoc(userRef, updateData);
        console.log('Image reference removed from Firestore successfully');

        return { success: true };
    } catch (error) {
        console.error('Error deleting image reference:', error);
        throw error;
    }
};