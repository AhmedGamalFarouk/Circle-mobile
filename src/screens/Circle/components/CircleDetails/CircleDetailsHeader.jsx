import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../context/ThemeContext';
import { COLORS, RADII, SHADOWS } from '../../../../constants/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

const CircleDetailsHeader = ({ name, description, image, memberCount, createdAt }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // Debug logging
    console.log('CircleDetailsHeader props:', { name, description, image, memberCount, createdAt });

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
            {/* Test view to ensure header is visible */}
            <View style={{
                position: 'absolute',
                top: 20,
                left: 20,
                backgroundColor: 'red',
                padding: 10,
                zIndex: 1000
            }}>
                <Text style={{ color: 'white' }}>HEADER TEST</Text>
            </View>

            <View style={styles.imageContainer}>
                <ImageBackground
                    source={{
                        uri: image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                    }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                    onError={(error) => console.log('Image load error:', error)}
                    onLoad={() => console.log('Image loaded successfully')}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                        style={styles.gradient}
                    />
                </ImageBackground>
            </View>

            <View style={styles.contentOverlay}>
                <View style={styles.titleContainer}>
                    <Text style={styles.circleName} numberOfLines={2}>
                        {name || 'Test Circle Name'}
                    </Text>
                    <View style={styles.metaInfo}>
                        <Text style={styles.memberCount}>
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
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
    gradient: {
        ...StyleSheet.absoluteFillObject,
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