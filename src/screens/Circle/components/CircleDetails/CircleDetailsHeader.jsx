import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import { COLORS, RADII, SHADOWS } from '../../../../constants/constants';
import { getCircleImageUrl } from '../../../../utils/imageUtils';
import useCircleMembers from '../../../../hooks/useCircleMembers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

const CircleDetailsHeader = ({ name, description, image, createdAt, circleId }) => {
    const { colors } = useTheme();
    const { memberCount, loading } = useCircleMembers(circleId);
    const styles = getStyles(colors);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <View style={styles.headerContainer}>
            <View style={styles.imageContainer}>
                <ImageBackground
                    source={{ uri: image }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                    onError={(error) => {
                        console.log('Circle image load error:', error);
                    }}
                >
                    <View style={styles.gradientOverlay} />
                </ImageBackground>
            </View>

            <View style={styles.contentOverlay}>
                <View style={styles.titleContainer}>
                    <Text style={styles.circleName} numberOfLines={2}>
                        {name || 'Test Circle Name'}
                    </Text>
                    <View style={styles.metaInfo}>
                        <Text style={styles.memberCount}>
                            {loading ? '...' : memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </Text>
                        {createdAt && (
                            <Text style={styles.createdDate}>
                                Created {formatDate(createdAt)}
                            </Text>
                        )}
                    </View>
                </View>

                {description && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.circleDescription} numberOfLines={3}>
                            {description}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    headerContainer: {
        height: HEADER_HEIGHT,
        width: SCREEN_WIDTH,
        position: 'relative',
        backgroundColor: colors.primary || '#ff6b8b',
    },
    imageContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Approximating the gradient effect with a solid color
    },
    contentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 32,
        minHeight: 120,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    titleContainer: {
        marginBottom: 12,
    },
    circleName: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'left',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        lineHeight: 38,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        flexWrap: 'wrap',
    },
    memberCount: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 16,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    createdDate: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    descriptionContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: RADII.rounded,
        padding: 16,
        marginTop: 8,
    },
    circleDescription: {
        color: 'rgba(255,255,255,0.95)',
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'left',
    },
});

export default CircleDetailsHeader;