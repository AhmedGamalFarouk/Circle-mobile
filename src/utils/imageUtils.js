/**
 * Utility functions for handling images in the Circle app
 */

/**
 * Get the best available image URL from multiple possible sources
 * @param {Object} data - Object containing possible image properties
 * @param {string} fallbackUrl - Fallback URL if no image is found
 * @returns {string} The best available image URL
 */
export const getBestImageUrl = (data, fallbackUrl = null) => {
    if (!data) return fallbackUrl;

    // Check common image property names in order of preference
    const imageProperties = [
        'image',
        'imageUrl',
        'photo',
        'photoUrl',
        'picture',
        'pictureUrl',
        'avatar',
        'avatarPhoto',
        'profilePicture'
    ];

    for (const prop of imageProperties) {
        const url = data[prop];
        if (url && typeof url === 'string' && url.trim() !== '') {
            return url.trim();
        }
    }

    return fallbackUrl;
};

/**
 * Generate a placeholder avatar URL using UI Avatars service
 * @param {string} name - Name to use for generating avatar
 * @param {number} size - Size of the avatar (default: 60)
 * @param {string} background - Background color (default: ff6b8b)
 * @param {string} color - Text color (default: ffffff)
 * @returns {string} Generated avatar URL
 */
export const generateAvatarUrl = (name = 'User', size = 60, background = 'ff6b8b', color = 'ffffff') => {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=${background}&color=${color}&size=${size}`;
};

/**
 * Get circle image with fallback
 * @param {Object} circle - Circle data object
 * @returns {string} Circle image URL
 */
export const getCircleImageUrl = (circle) => {
    const imageUrl = getBestImageUrl(circle);

    if (imageUrl) {
        return imageUrl;
    }

    // Default circle image fallback
    return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
};

/**
 * Get user avatar with fallback
 * @param {Object} user - User data object
 * @param {number} size - Avatar size (default: 60)
 * @returns {string} User avatar URL
 */
export const getUserAvatarUrl = (user, size = 60) => {
    const imageUrl = getBestImageUrl(user);

    if (imageUrl) {
        return imageUrl;
    }

    // Generate placeholder avatar based on user name
    const name = user?.name || user?.username || user?.displayName || 'User';
    return generateAvatarUrl(name, size);
};