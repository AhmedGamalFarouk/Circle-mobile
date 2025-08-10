# Profile Images Implementation

This document describes the implementation of profile and cover image upload/fetch functionality using Cloudinary in the profile screen.

## Features

- ✅ Profile picture upload and management
- ✅ Cover image upload and management
- ✅ Image optimization and transformations
- ✅ Image caching for better performance
- ✅ Comprehensive error handling
- ✅ Loading states and progress indicators
- ✅ Image validation and size limits
- ✅ Delete functionality with confirmation
- ✅ Responsive design for different screen sizes

## Architecture

### Components

1. **ProfileScreen** (`src/screens/Profile/ProfileScreen.jsx`)
   - Main profile screen with image display and editing capabilities
   - Handles image upload/delete operations
   - Manages editing states and user interactions

2. **ImagePickerModal** (`src/components/ImagePicker/ImagePickerModal.jsx`)
   - Modal for selecting images from gallery or camera
   - Handles permissions and image validation
   - Provides consistent UX across the app

### Hooks

1. **useProfileImages** (`src/hooks/useProfileImages.js`)
   - Custom hook for managing profile image operations
   - Handles upload, delete, and URL generation
   - Provides loading states and progress tracking

### Utilities

1. **cloudinaryUpload.js** (`src/utils/cloudinaryUpload.js`)
   - Core Cloudinary integration
   - Image upload, delete, and optimization functions
   - Validation and error handling

2. **imageCache.js** (`src/utils/imageCache.js`)
   - Image caching system for better performance
   - Preloading and cache management
   - Automatic cleanup of expired entries

### Configuration

1. **cloudinaryConfig.js** (`src/constants/cloudinaryConfig.js`)
   - Cloudinary credentials and settings
   - Image transformation configurations
   - Upload presets and folder structure

## Usage

### Basic Image Upload

```javascript
import { useProfileImages } from '../hooks/useProfileImages';

const MyComponent = () => {
    const { uploadImage, isUploading, uploadProgress } = useProfileImages(userId);
    
    const handleImageUpload = async (imageData, imageType) => {
        try {
            const result = await uploadImage(imageData, imageType);
            console.log('Upload successful:', result.imageUrl);
        } catch (error) {
            console.error('Upload failed:', error.message);
        }
    };
    
    return (
        <View>
            {isUploading && <Text>Uploading... {uploadProgress}%</Text>}
            {/* Your UI components */}
        </View>
    );
};
```

### Image Selection with Modal

```javascript
import ImagePickerModal from '../components/ImagePicker/ImagePickerModal';

const [showImagePicker, setShowImagePicker] = useState(false);
const [imageType, setImageType] = useState('avatar');

const handleImageSelected = (imageData) => {
    // Process selected image
    console.log('Selected image:', imageData);
};

return (
    <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
        imageType={imageType}
        title="Select Profile Picture"
    />
);
```

## Configuration

### Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and create an upload preset
3. Update `src/constants/cloudinaryConfig.js`:

```javascript
export const CLOUDINARY_CONFIG = {
    CLOUD_NAME: 'your_cloud_name',
    UPLOAD_PRESET: 'your_upload_preset',
    API_KEY: 'your_api_key',
};
```

### Upload Preset Configuration

In your Cloudinary dashboard:
1. Go to Settings > Upload
2. Create a new upload preset
3. Set it as "Unsigned" for client-side uploads
4. Configure folder structure and transformations

## Image Transformations

The system automatically applies optimizations:

### Avatar Images
- Size: 400x400px
- Crop: Fill with face detection
- Format: WebP for better compression
- Quality: Auto-good

### Cover Images
- Size: 1200x600px
- Crop: Fill with center gravity
- Format: WebP for better compression
- Quality: Auto-good

## Error Handling

The implementation includes comprehensive error handling:

- Network connectivity issues
- Invalid file formats
- File size limits
- Cloudinary API errors
- Permission denials
- Upload failures

## Performance Optimizations

1. **Image Caching**: Automatic caching of loaded images
2. **Progressive Loading**: Loading states and progress indicators
3. **Optimized URLs**: Automatic WebP conversion and compression
4. **Lazy Loading**: Images load only when needed
5. **Cache Cleanup**: Automatic cleanup of expired cache entries

## File Structure

```
src/
├── components/
│   └── ImagePicker/
│       └── ImagePickerModal.jsx
├── constants/
│   └── cloudinaryConfig.js
├── hooks/
│   └── useProfileImages.js
├── screens/
│   └── Profile/
│       └── ProfileScreen.jsx
└── utils/
    ├── cloudinaryUpload.js
    └── imageCache.js
```

## Security Considerations

1. **Upload Presets**: Use unsigned presets for client-side uploads
2. **File Validation**: Validate file types and sizes before upload
3. **Public ID Structure**: Use user ID in public ID for organization
4. **API Key Protection**: Never expose API secrets in client code
5. **Content Moderation**: Consider enabling Cloudinary's moderation features

## Testing

To test the implementation:

1. **Upload Test**: Try uploading various image formats and sizes
2. **Delete Test**: Test image deletion functionality
3. **Error Handling**: Test with network issues and invalid files
4. **Performance**: Test with slow connections and large images
5. **Permissions**: Test camera and gallery permissions

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check upload preset configuration
2. **Images Don't Load**: Verify Cloudinary URLs and network connectivity
3. **Permission Errors**: Ensure camera/gallery permissions are granted
4. **Large File Sizes**: Check file size limits in configuration

### Debug Mode

Enable debug logging by adding console logs in the upload functions:

```javascript
console.log('Upload config:', {
    cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
    uploadPreset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
    // ... other config
});
```

## Future Enhancements

- [ ] Batch image uploads
- [ ] Image filters and effects
- [ ] Advanced cropping tools
- [ ] Social media integration
- [ ] Image analytics and insights
- [ ] CDN optimization
- [ ] Offline support with sync