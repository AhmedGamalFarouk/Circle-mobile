# Cloudinary Integration Guide

## Overview
This application now uses Cloudinary as the primary image storage and processing service for all image uploads including profile images, cover images, and circle images.

## Configuration

### Cloudinary Settings
- **Cloud Name**: `dwh8jhaot`
- **Upload Preset**: `images` (custom preset created in Cloudinary dashboard)
- **API Key**: `861252578513848` (for client-side uploads)

### Upload Preset Setup

#### Current Setup
The app uses the custom `images` preset created in your Cloudinary dashboard.

#### Preset Requirements
Make sure your `images` preset is configured with:
- **Signing Mode**: Unsigned (for client-side uploads)
- **Allowed parameters**: folder, public_id, transformation, tags, context, metadata
- **Transformations**: Optional (can be set per upload or in preset)

## Image Types and Configurations

### Profile Images (Avatar)
- **Transformation**: `c_fill,w_400,h_400,q_auto,f_auto`
- **Folder**: `users/profiles/avatars/{userId}`
- **Aspect Ratio**: 1:1 (square)

### Cover Images
- **Transformation**: `c_fill,w_1200,h_400,q_auto,f_auto`
- **Folder**: `users/profiles/covers/{userId}`
- **Aspect Ratio**: 3:1 (wide)

### Circle Images
- **Transformation**: `c_fill,w_800,h_600,q_auto,f_auto`
- **Folder**: `circles/images`
- **Aspect Ratio**: 4:3

### Media Images
- **Transformation**: `c_fill,w_600,h_600,q_auto,f_auto`
- **Folder**: `users/media/{userId}`
- **Aspect Ratio**: 1:1 (square)

## Usage

### Profile/Cover Images
```javascript
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';

// Upload profile image
const result = await uploadImageToCloudinary(userId, imageBase64, 'avatar');

// Upload cover image
const result = await uploadImageToCloudinary(userId, imageBase64, 'cover');
```

### Circle Images
```javascript
import { uploadCircleImageToCloudinary } from '../utils/cloudinaryUpload';

// Upload circle image
const result = await uploadCircleImageToCloudinary(imageUri, circleId);
```

## Benefits of Cloudinary-First Approach

1. **Automatic Image Optimization**: Images are automatically optimized for web delivery
2. **Responsive Images**: Different sizes generated automatically
3. **Format Optimization**: Automatic format selection (WebP, AVIF, etc.)
4. **CDN Delivery**: Global CDN for fast image loading
5. **Transformation Pipeline**: Real-time image transformations
6. **Consistent Storage**: All images stored in one place with organized folder structure

## Fallback Strategy

While Cloudinary is now the primary method, Firebase Functions are still available as a server-side backup for critical operations that require API secrets.

## Error Handling

The system provides specific error messages for common issues:
- Upload preset not found
- Network connectivity issues
- Invalid image formats
- File size limitations

## Security Notes

- Client-side uploads use unsigned presets (no API secret exposed)
- Server-side operations (like deletion) should use Firebase Functions with API secrets
- All uploads are organized in user-specific folders for privacy