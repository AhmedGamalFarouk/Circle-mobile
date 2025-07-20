import React from 'react';
import { ScrollView, Image, StyleSheet, useWindowDimensions, View, TouchableOpacity, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RADII, COLORS, SHADOWS } from '../../../constants/constants';

const MediaGrid = ({ images = [], isEditing = false, onAddImages, onRemoveImage }) => {
    const { width } = useWindowDimensions();
    const styles = getStyles(width);

    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions to add images.');
                return;
            }

            const remainingSlots = 6 - images.length;
            if (remainingSlots <= 0) {
                Alert.alert('Maximum reached', 'You can only have up to 6 images in your profile.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [1, 1],
                allowsEditing: false,
            });

            if (!result.canceled && result.assets) {
                const selectedImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
                onAddImages(selectedImages);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick images. Please try again.');
        }
    };

    const handleRemoveImage = (index) => {
        Alert.alert(
            'Remove Image',
            'Are you sure you want to remove this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => onRemoveImage(index) }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Media</Text>
            <ScrollView
                horizontal
                contentContainerStyle={styles.mediaList}
                showsHorizontalScrollIndicator={false}
            >
                {images.map((imageUri, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.mediaItem}
                        />
                        <View style={styles.imageOverlay} />
                        {isEditing && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveImage(index)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close-circle" size={26} color={COLORS.light} />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {isEditing && images.length < 6 && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={pickImages}
                        activeOpacity={0.8}
                    >
                        <View style={styles.addButtonContent}>
                            <Ionicons name="add" size={32} color={COLORS.primary} />
                            <Text style={styles.addButtonText}>Add Photo</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

const getStyles = (width) => {
    const itemSize = 100;
    const spacing = 12;

    return StyleSheet.create({
        container: {
            marginTop: 20,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: COLORS.light,
            marginBottom: 16,
            letterSpacing: 0.5,
            paddingHorizontal: 20,
        },
        mediaList: {
            flexDirection: 'row',
            gap: spacing,
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        imageContainer: {
            position: 'relative',
            width: itemSize,
            height: itemSize,
            borderRadius: RADII.rounded,
            overflow: 'hidden',
            ...SHADOWS.card,
        },
        mediaItem: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        imageOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: RADII.rounded,
        },
        removeButton: {
            position: 'absolute',
            top: 6,
            right: 6,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 15,
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            ...SHADOWS.softPrimary,
        },
        addButton: {
            width: itemSize,
            height: itemSize,
            borderRadius: RADII.rounded,
            borderWidth: 2,
            borderColor: COLORS.primary,
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.primary + '10',
            ...SHADOWS.card,
        },
        addButtonContent: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        addButtonText: {
            color: COLORS.primary,
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
            textAlign: 'center',
        },
    });
};

export default MediaGrid;