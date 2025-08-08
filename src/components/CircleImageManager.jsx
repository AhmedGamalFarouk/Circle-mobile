import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { COLORS, FONTS, RADII } from '../constants/constants';
import ImageUploader from './ImageUploader';

/**
 * CircleImageManager - A comprehensive component for managing circle images
 * This component demonstrates how to use the image management system
 */
const CircleImageManager = ({ circleId, circleData, onImageUpdate }) => {
    const [profileImageUrl, setProfileImageUrl] = useState(circleData?.photoUrl);
    const [coverImageUrl, setCoverImageUrl] = useState(circleData?.coverPhoto);

    const handleProfileImageUpdate = (url, publicId) => {
        setProfileImageUrl(url);
        onImageUpdate && onImageUpdate('profile', url, publicId);
        Alert.alert('Success', 'Profile image updated successfully!');
    };

    const handleCoverImageUpdate = (url, publicId) => {
        setCoverImageUrl(url);
        onImageUpdate && onImageUpdate('cover', url, publicId);
        Alert.alert('Success', 'Cover image updated successfully!');
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Circle Image Management</Text>

            {/* Profile Image Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Image</Text>
                <Text style={styles.sectionDescription}>
                    This will be displayed as the circle's main image in lists and headers.
                    Recommended size: 400x400px
                </Text>
                <View style={styles.imageContainer}>
                    <ImageUploader
                        currentImageUrl={profileImageUrl}
                        onImageUpdate={handleProfileImageUpdate}
                        circleId={circleId}
                        imageType="profile"
                        size={120}
                    />
                </View>
            </View>

            {/* Cover Image Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cover Image</Text>
                <Text style={styles.sectionDescription}>
                    This will be displayed as a banner at the top of the circle.
                    Recommended size: 1200x400px
                </Text>
                <View style={styles.imageContainer}>
                    <ImageUploader
                        currentImageUrl={coverImageUrl}
                        onImageUpdate={handleCoverImageUpdate}
                        circleId={circleId}
                        imageType="cover"
                        size={300}
                    />
                </View>
            </View>

            {/* Usage Instructions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to Use</Text>
                <View style={styles.instructionsList}>
                    <Text style={styles.instruction}>• Tap on any image placeholder to upload</Text>
                    <Text style={styles.instruction}>• Choose between Camera or Gallery</Text>
                    <Text style={styles.instruction}>• Images are automatically optimized</Text>
                    <Text style={styles.instruction}>• Profile images are cropped to circles</Text>
                    <Text style={styles.instruction}>• Cover images maintain aspect ratio</Text>
                    <Text style={styles.instruction}>• All images are stored in Cloudinary</Text>
                    <Text style={styles.instruction}>• Firebase is updated with image URLs</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darker,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.heading,
        color: COLORS.light,
        textAlign: 'center',
        marginBottom: 30,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.light,
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.text,
        marginBottom: 15,
        lineHeight: 20,
    },
    imageContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.dark,
        borderRadius: RADII.medium,
        borderWidth: 1,
        borderColor: COLORS.glass,
    },
    instructionsList: {
        backgroundColor: COLORS.dark,
        padding: 15,
        borderRadius: RADII.medium,
        borderWidth: 1,
        borderColor: COLORS.glass,
    },
    instruction: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 20,
    },
});

export default CircleImageManager;