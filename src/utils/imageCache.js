import { Image } from 'react-native';

// Simple in-memory cache for image URLs
const imageCache = new Map();
const cacheExpiry = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const cacheImage = (url) => {
    if (!url) return;

    const now = Date.now();
    imageCache.set(url, now);
    cacheExpiry.set(url, now + CACHE_DURATION);

    // Preload the image
    Image.prefetch(url).catch(error => {
        console.warn('Failed to prefetch image:', url, error);
    });
};

export const isCached = (url) => {
    if (!url || !imageCache.has(url)) return false;

    const expiry = cacheExpiry.get(url);
    const now = Date.now();

    if (now > expiry) {
        // Cache expired, remove it
        imageCache.delete(url);
        cacheExpiry.delete(url);
        return false;
    }

    return true;
};

export const clearImageCache = () => {
    imageCache.clear();
    cacheExpiry.clear();
};

export const getCacheSize = () => {
    return imageCache.size;
};

// Preload profile images for better UX
export const preloadProfileImages = (profile) => {
    if (!profile) return;

    if (profile.avatarPhoto) {
        cacheImage(profile.avatarPhoto);
    }

    if (profile.coverPhoto) {
        cacheImage(profile.coverPhoto);
    }
};

// Clean up expired cache entries
export const cleanupExpiredCache = () => {
    const now = Date.now();

    for (const [url, expiry] of cacheExpiry.entries()) {
        if (now > expiry) {
            imageCache.delete(url);
            cacheExpiry.delete(url);
        }
    }
};

// Auto cleanup every 5 minutes
setInterval(cleanupExpiredCache, 5 * 60 * 1000);