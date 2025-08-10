// Simple Cloudinary upload without transformations
import { CLOUDINARY_CONFIG, IMAGE_UPLOAD_SETTINGS } from '../constants/cloudinaryConfig';

export const simpleUploadImageToCloudinary = async (userId, base64Data, imageType = 'avatar') => {
    try {
        if (!base64Data) {
            throw new Error('No image data provided');
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        // Validate image type
        if (!['avatar', 'cover'].includes(imageType)) {
            throw new Error('Invalid image type. Must be "avatar" or "cover"');
        }

        // Create form data
        const formData = new FormData();

        // Convert base64 to data URI if it's not already
        const dataUri = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`;

        formData.append('file', dataUri);
        formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
        formData.append('resource_type', 'image');
        formData.append('folder', `profile_images/${userId}`);
        formData.append('public_id', `${userId}_${imageType}`);
        formData.append('overwrite', 'true');
        formData.append('invalidate', 'true');

        console.log('Simple upload to Cloudinary:', {
            cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
            uploadPreset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
            folder: `profile_images/${userId}`,
            publicId: `${userId}_${imageType}`,
            imageType
        });

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cloudinary simple upload error:', errorText);
            throw new Error(`Simple upload failed with status: ${response.status}. ${errorText}`);
        }

        const data = await response.json();

        console.log('Simple upload successful:', {
            publicId: data.public_id,
            secureUrl: data.secure_url,
            format: data.format,
            width: data.width,
            height: data.height
        });

        return {
            success: true,
            imageUrl: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height,
        };
    } catch (error) {
        console.error('Simple Cloudinary upload error:', error);
        throw new Error(`Failed to upload ${imageType} image: ${error.message}`);
    }
};

// Generate optimized URL after upload
export const getSimpleOptimizedUrl = (publicId, imageType = 'avatar') => {
    if (!publicId) {
        return null;
    }

    const cloudName = CLOUDINARY_CONFIG.CLOUD_NAME;

    // Apply transformations based on image type
    if (imageType === 'avatar') {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_400,c_fill,g_face,q_auto:good,f_auto/${publicId}`;
    } else if (imageType === 'cover') {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_600,c_fill,g_center,q_auto:good,f_auto/${publicId}`;
    }

    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};