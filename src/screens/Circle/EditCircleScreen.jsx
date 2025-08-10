import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADII, SHADOWS } from '../../constants/constants';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { uploadCircleImageToCloudinary } from '../../utils/cloudinaryUpload';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';

const EditCircleScreen = ({ navigation, route }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { colors } = useTheme();
    const { circleId, circle } = route.params;

    // Semantic color variables for better organization
    const colorVars = {
        background: colors.background,
        surface: colors.surface,
        card: colors.card,
        textPrimary: colors.text,
        textSecondary: colors.textSecondary,
        textMuted: colors.textSecondary,
        border: colors.border,
        borderActive: colors.primary,
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        disabled: colors.textSecondary,
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        overlay: colors.glass,
        shadow: colors.shadow,
    };

    const [circleName, setCircleName] = useState('');
    const [description, setDescription] = useState('');
    const [photoUrl, setPhotoUrl] = useState(null);
    const [originalPhotoUrl, setOriginalPhotoUrl] = useState(null);
    const [circlePrivacy, setCirclePrivacy] = useState('public');
    const [circleType, setCircleType] = useState('permanent');
    const [expiresAt, setExpiresAt] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [interests, setInterests] = useState([]);
    const [interestInput, setInterestInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize form with existing circle data
    useEffect(() => {
        if (circle) {
            setCircleName(circle.circleName || circle.name || '');
            setDescription(circle.description || '');
            setPhotoUrl(circle.imageUrl || null);
            setOriginalPhotoUrl(circle.imageUrl || null);
            setCirclePrivacy(circle.circlePrivacy || 'public');
            setCircleType(circle.circleType || 'permanent');
            setExpiresAt(circle.expiresAt ? new Date(circle.expiresAt.seconds * 1000) : null);
            setInterests(circle.interests || []);
        }
    }, [circle]);

    const handleSave = async () => {
        if (!user) {
            Alert.alert("Error", "Please log in to edit this circle.");
            return;
        }

        if (circleName.trim() === '') {
            Alert.alert("Error", "Circle name is required.");
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                circleName: circleName.trim(),
                description: description.trim(),
                circlePrivacy,
                circleType,
                expiresAt: circleType === 'flash' ? expiresAt : null,
                interests,
                updatedAt: serverTimestamp(),
            };

            // Handle image upload if changed
            if (photoUrl && photoUrl !== originalPhotoUrl) {
                console.log('Uploading new circle image to Cloudinary...');
                const result = await uploadCircleImageToCloudinary(photoUrl, circleId);
                updateData.imageUrl = result.imageUrl;
                console.log('Circle image uploaded successfully:', result.imageUrl);
            }

            // Update the circle in Firestore
            await updateDoc(doc(db, 'circles', circleId), updateData);

            console.log("Circle updated successfully");
            Alert.alert("Success", "Circle updated successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error updating circle: ", error);
            Alert.alert("Error", "Failed to update circle. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhotoUrl(result.assets[0].uri);
        }
    };

    const addInterest = () => {
        if (interestInput.trim() !== '' && !interests.includes(interestInput.trim())) {
            setInterests([...interests, interestInput.trim()]);
            setInterestInput('');
        }
    };

    const removeInterest = (indexToRemove) => {
        setInterests(interests.filter((_, index) => index !== indexToRemove));
    };

    const isSaveDisabled = circleName.trim() === '' || loading;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colorVars.background }]}>
            <ScrollView style={styles.container} contentContainerStyle={{ backgroundColor: colorVars.background }}>
                <View style={[styles.header, { backgroundColor: colorVars.background }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colorVars.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colorVars.textPrimary }]}>Edit Circle</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaveDisabled}
                        style={styles.saveButtonHeader}
                    >
                        <Text style={[
                            styles.saveButtonTextHeader,
                            { color: colorVars.primary },
                            isSaveDisabled && { color: colorVars.disabled }
                        ]}>
                            {loading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.avatarUploader, { backgroundColor: colorVars.background }]} onPress={pickImage}>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={[styles.avatar, { borderColor: colorVars.borderActive }]} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { borderColor: colorVars.borderActive, backgroundColor: colorVars.surface }]}>
                            <Ionicons name="camera" size={40} color={colorVars.textSecondary} />
                            <Text style={[styles.addPhotoText, { color: colorVars.textSecondary }]}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>Circle Name</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: colorVars.surface,
                            borderColor: colorVars.border,
                            color: colorVars.textPrimary
                        }]}
                        placeholder="Enter circle name"
                        placeholderTextColor={colorVars.textMuted}
                        value={circleName}
                        onChangeText={setCircleName}
                    />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.descriptionInput, {
                            backgroundColor: colorVars.surface,
                            borderColor: colorVars.border,
                            color: colorVars.textPrimary
                        }]}
                        placeholder="Describe your circle..."
                        placeholderTextColor={colorVars.textMuted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>Privacy</Text>
                    <View style={[styles.toggleContainer, { borderColor: colorVars.border, backgroundColor: colorVars.surface }]}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                { backgroundColor: colorVars.surface },
                                circlePrivacy === 'public' && { backgroundColor: colorVars.primary }
                            ]}
                            onPress={() => setCirclePrivacy('public')}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                { color: circlePrivacy === 'public' ? colorVars.background : colorVars.textPrimary }
                            ]}>Public</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                { backgroundColor: colorVars.surface },
                                circlePrivacy === 'private' && { backgroundColor: colorVars.primary }
                            ]}
                            onPress={() => setCirclePrivacy('private')}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                { color: circlePrivacy === 'private' ? colorVars.background : colorVars.textPrimary }
                            ]}>Private</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>Type</Text>
                    <View style={[styles.toggleContainer, { borderColor: colorVars.border, backgroundColor: colorVars.surface }]}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                { backgroundColor: colorVars.surface },
                                circleType === 'permanent' && { backgroundColor: colorVars.primary }
                            ]}
                            onPress={() => setCircleType('permanent')}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                { color: circleType === 'permanent' ? colorVars.background : colorVars.textPrimary }
                            ]}>Permanent</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                { backgroundColor: colorVars.surface },
                                circleType === 'flash' && { backgroundColor: colorVars.primary }
                            ]}
                            onPress={() => setCircleType('flash')}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                { color: circleType === 'flash' ? colorVars.background : colorVars.textPrimary }
                            ]}>Flash</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {circleType === 'flash' && (
                    <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                        <Text style={[styles.label, { color: colorVars.textPrimary }]}>Expires At</Text>
                        <TouchableOpacity
                            style={[styles.input, {
                                backgroundColor: colorVars.surface,
                                borderColor: colorVars.border
                            }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: expiresAt ? colorVars.textPrimary : colorVars.textMuted }}>
                                {expiresAt ? expiresAt.toLocaleDateString() : 'Select expiry date'}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={expiresAt || new Date()}
                                mode="date"
                                display="default"
                                minimumDate={new Date()}
                                onChange={(event, date) => {
                                    if (event.type === 'set') {
                                        setExpiresAt(date);
                                        setShowDatePicker(false);
                                    } else if (event.type === 'dismissed') {
                                        setShowDatePicker(false);
                                    }
                                }}
                            />
                        )}
                    </View>
                )}

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>Interests</Text>
                    <View style={[styles.interestInputContainer, {
                        backgroundColor: colorVars.surface,
                        borderColor: colorVars.border
                    }]}>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: colorVars.surface,
                                color: colorVars.textPrimary
                            }]}
                            placeholder="Add an interest"
                            placeholderTextColor={colorVars.textMuted}
                            value={interestInput}
                            onChangeText={setInterestInput}
                        />
                        <TouchableOpacity onPress={addInterest} style={[styles.addButton, { backgroundColor: colorVars.accent }]}>
                            <Text style={[styles.addButtonText, { color: colorVars.background }]}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.interestsContainer, { backgroundColor: colorVars.background }]}>
                        {interests.map((interest, index) => (
                            <View key={index} style={[styles.interestTag, {
                                backgroundColor: colorVars.surface,
                                borderColor: colorVars.border
                            }]}>
                                <Text style={[styles.interestTagText, { color: colorVars.textPrimary }]}>{interest}</Text>
                                <TouchableOpacity onPress={() => removeInterest(index)} style={styles.removeInterestButton}>
                                    <Ionicons name="close-circle" size={16} color={colorVars.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.fullWidthButton,
                        { backgroundColor: isSaveDisabled ? colorVars.disabled : colorVars.primary }
                    ]}
                    onPress={handleSave}
                    disabled={isSaveDisabled}
                >
                    <Text style={[styles.fullWidthButtonText, { color: colorVars.background }]}>
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: 10,
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    saveButtonHeader: {
        padding: 5,
    },
    saveButtonTextHeader: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    avatarUploader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: RADII.circle,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    addPhotoText: {
        marginTop: 5,
        fontSize: 14,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: RADII.circle,
        borderWidth: 2,
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        marginBottom: 10,
        fontSize: 14,
        fontWeight: 'bold',
    },
    input: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: RADII.rounded,
        fontSize: 16,
        borderWidth: 1,
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: RADII.rounded,
        overflow: 'hidden',
        borderWidth: 1,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        margin: 2,
    },
    toggleButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    interestInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADII.rounded,
        borderWidth: 1,
        paddingRight: 5,
    },
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: RADII.rounded,
        marginLeft: 10,
    },
    addButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 15,
    },
    interestTag: {
        flexDirection: 'row',
        borderRadius: RADII.pill,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    interestTagText: {
        fontSize: 14,
        marginRight: 5,
    },
    removeInterestButton: {
        padding: 2,
    },
    fullWidthButton: {
        padding: 18,
        borderRadius: RADII.rounded,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    fullWidthButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default EditCircleScreen;