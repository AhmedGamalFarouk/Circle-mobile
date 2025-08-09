// Cloudinary Configuration
// Replace these values with your actual Cloudinary credentials
// You can find these in your Cloudinary Dashboard

export const CLOUDINARY_CONFIG = {
    // Your Cloudinary cloud name (found in Dashboard)
    CLOUD_NAME: 'dwh8jhaot',

    // Your upload preset name (create one in Settings > Upload)
    // Make sure to set it as "unsigned" for client-side uploads
    UPLOAD_PRESET: 'voice_messages',

    // Optional: API Key (not needed for unsigned uploads)
    API_KEY: '861252578513848',

    // Optional: API Secret (never expose this in client-side code)
    // API_SECRET: 'your_api_secret_here', // Don't include this in client code
};

// Upload settings
export const UPLOAD_SETTINGS = {
    // Maximum file size in bytes (10MB)
    MAX_FILE_SIZE: 10 * 1024 * 1024,

    // Allowed audio formats
    ALLOWED_FORMATS: ['mp3', 'm4a', 'wav', 'aac', 'webm'],

    // Upload folder in Cloudinary
    FOLDER: 'voice_messages',

    // Resource type for audio files
    RESOURCE_TYPE: 'video', // Cloudinary uses 'video' for audio files
};