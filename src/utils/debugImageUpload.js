// Debug utility for image upload functionality
import { IMAGE_UPLOAD_SETTINGS } from '../constants/cloudinaryConfig';

export const debugImageUploadConfig = () => {
    console.log('=== Image Upload Debug Info ===');
    console.log('IMAGE_UPLOAD_SETTINGS:', IMAGE_UPLOAD_SETTINGS);
    console.log('MAX_FILE_SIZE:', IMAGE_UPLOAD_SETTINGS?.MAX_FILE_SIZE);
    console.log('ALLOWED_FORMATS:', IMAGE_UPLOAD_SETTINGS?.ALLOWED_FORMATS);
    console.log('FOLDER:', IMAGE_UPLOAD_SETTINGS?.FOLDER);
    console.log('RESOURCE_TYPE:', IMAGE_UPLOAD_SETTINGS?.RESOURCE_TYPE);
    console.log('TRANSFORMATIONS:', IMAGE_UPLOAD_SETTINGS?.TRANSFORMATIONS);
    console.log('===============================');
};

export const testImageValidation = (fileUri, imageType) => {
    console.log('=== Testing Image Validation ===');
    console.log('File URI:', fileUri);
    console.log('Image Type:', imageType);

    try {
        const extension = fileUri?.split('.').pop()?.toLowerCase();
        console.log('Extracted extension:', extension);

        const allowedFormats = IMAGE_UPLOAD_SETTINGS?.ALLOWED_FORMATS || ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        console.log('Allowed formats:', allowedFormats);
        console.log('Is valid format:', allowedFormats.includes(extension));

        return {
            extension,
            allowedFormats,
            isValid: allowedFormats.includes(extension)
        };
    } catch (error) {
        console.error('Validation test error:', error);
        return { error: error.message };
    }
};

export default {
    debugImageUploadConfig,
    testImageValidation
};