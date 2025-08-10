// Cloudinary upload utility for voice messages and images
import { CLOUDINARY_CONFIG, UPLOAD_SETTINGS, IMAGE_UPLOAD_SETTINGS } from '../constants/cloudinaryConfig';

// Re-export for convenience
export { IMAGE_UPLOAD_SETTINGS } from '../constants/cloudinaryConfig';

export const uploadAudioToCloudinary = async (audioUri) => {
    try {
        // Create form data
        const formData = new FormData();

        // Get file info
        const filename = audioUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `audio/${match[1]}` : 'audio/m4a';

        formData.append('file', {
            uri: audioUri,
            type: type,
            name: filename,
        });

        formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
        formData.append('resource_type', UPLOAD_SETTINGS.RESOURCE_TYPE);
        formData.append('folder', UPLOAD_SETTINGS.FOLDER);

        // Debug logging
        console.log('Uploading to Cloudinary with:', {
            cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
            uploadPreset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
            resourceType: UPLOAD_SETTINGS.RESOURCE_TYPE,
            folder: UPLOAD_SETTINGS.FOLDER
        });

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/${UPLOAD_SETTINGS.RESOURCE_TYPE}/upload`,
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
            console.error('Cloudinary error response:', errorText);
            throw new Error(`Upload failed with status: ${response.status}. ${errorText}`);
        }

        const data = await response.json();

        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            duration: data.duration,
            format: data.format,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};


// Upload image to Cloudinary (for profile and cover images)
export const uploadImageToCloudinary = async (userId, base64Data, imageType = 'avatar') => {
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

        // Create unique public_id with timestamp to avoid conflicts
        const timestamp = Date.now();
        const publicId = `${userId}_${imageType}_${timestamp}`;

        formData.append('file', dataUri);
        formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
        formData.append('folder', `profile_images/${userId}`);
        formData.append('public_id', publicId);

        // Debug logging
        console.log('Uploading image to Cloudinary with:', {
            cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
            uploadPreset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
            folder: `profile_images/${userId}`,
            publicId: publicId,
            imageType,
            dataUriLength: dataUri.length
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
            console.error('Cloudinary image upload error response:', errorText);
            throw new Error(`Image upload failed with status: ${response.status}. ${errorText}`);
        }

        const data = await response.json();

        console.log('Image uploaded successfully:', {
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
        console.error('Cloudinary image upload error:', error);
        throw new Error(`Failed to upload ${imageType} image: ${error.message}`);
    }
};

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicIdToDelete, imageType = 'avatar') => {
    try {
        if (!publicIdToDelete) {
            console.warn('No public ID provided for deletion, skipping Cloudinary deletion');
            return {
                success: true,
                result: 'skipped',
                publicId: publicIdToDelete,
            };
        }

        // Validate image type
        if (!['avatar', 'cover'].includes(imageType)) {
            throw new Error('Invalid image type. Must be "avatar" or "cover"');
        }

        // Create form data for deletion
        const formData = new FormData();
        formData.append('public_id', publicIdToDelete);
        formData.append('api_key', CLOUDINARY_CONFIG.API_KEY);

        // For deletion, we need to generate a signature
        // Note: In production, this should be done on the server side for security
        const timestamp = Math.round(new Date().getTime() / 1000);
        formData.append('timestamp', timestamp.toString());

        console.log('Deleting image from Cloudinary:', {
            cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
            publicId: publicIdToDelete,
            imageType
        });

        // Delete from Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/destroy`,
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
            console.error('Cloudinary image deletion error response:', errorText);
            throw new Error(`Image deletion failed with status: ${response.status}. ${errorText}`);
        }

        const data = await response.json();

        console.log('Image deletion response:', data);

        if (data.result === 'ok' || data.result === 'not found') {
            return {
                success: true,
                result: data.result,
                publicId: publicIdToDelete,
            };
        } else {
            throw new Error(`Deletion failed: ${data.result || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Cloudinary image deletion error:', error);
        throw new Error(`Failed to delete ${imageType} image: ${error.message}`);
    }
};

// Fetch optimized image URL with transformations
export const getOptimizedImageUrl = (publicId, imageType = 'avatar') => {
    if (!publicId) {
        return null;
    }

    const cloudName = CLOUDINARY_CONFIG.CLOUD_NAME;

    // Apply transformations based on image type using simple string format
    if (imageType === 'avatar') {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_400,c_fill,g_face,q_auto:good,f_auto/${publicId}`;
    } else if (imageType === 'cover') {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_600,c_fill,g_center,q_auto:good,f_auto/${publicId}`;
    }

    // Fallback to original URL
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};

// Validate image file before upload
export const validateImageFile = (fileUri, imageType = 'avatar') => {
    try {
        if (!fileUri) {
            throw new Error('No file provided');
        }

        // Extract file extension
        const extension = fileUri.split('.').pop()?.toLowerCase();

        // Default allowed formats if IMAGE_UPLOAD_SETTINGS is not available
        const allowedFormats = IMAGE_UPLOAD_SETTINGS?.ALLOWED_FORMATS || ['jpg', 'jpeg', 'png', 'webp', 'gif'];

        if (!extension || !allowedFormats.includes(extension)) {
            throw new Error(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`);
        }

        return {
            valid: true,
            extension,
            imageType
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
};