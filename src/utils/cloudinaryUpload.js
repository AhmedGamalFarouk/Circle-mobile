// Cloudinary upload utility for voice messages
import { CLOUDINARY_CONFIG, UPLOAD_SETTINGS } from '../constants/cloudinaryConfig';

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

