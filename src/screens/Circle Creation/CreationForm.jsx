import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADII, SHADOWS } from '../../constants/constants';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../firebase/config';
import { addDoc, collection, serverTimestamp, doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { uploadCircleImageToCloudinary } from '../../utils/cloudinaryUpload';
import { incrementUserStat } from '../../utils/userStatsManager';
import useAuth from '../../hooks/useAuth';
import useUserProfile from '../../hooks/useUserProfile';
import { useTheme } from '../../context/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';
import StandardHeader from '../../components/StandardHeader';

const CreationForm = ({ navigation }) => {
    const { t } = useLocalization()
    const { user } = useAuth();
    const { profile: userProfile } = useUserProfile(user?.uid);
    const { colors } = useTheme()

    // Semantic color variables for better organization
    const colorVars = {
        // Background colors
        background: colors.background,
        surface: colors.surface,
        card: colors.card,

        // Text colors
        textPrimary: colors.text,
        textSecondary: colors.textSecondary,
        textMuted: colors.textSecondary,

        // Border colors
        border: colors.border,
        borderActive: colors.primary,

        // Interactive colors
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,

        // State colors
        disabled: colors.textSecondary,
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',

        // Overlay colors
        overlay: colors.glass,
        shadow: colors.shadow,
    };

    const [circleName, setCircleName] = useState('');
    const [description, setDescription] = useState('');
    const [photoUrl, setPhotoUrl] = useState(null);
    const [circlePrivacy, setCirclePrivacy] = useState('public');
    const [circleType, setCircleType] = useState('permanent');
    const [expiresAt, setExpiresAt] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [interests, setInterests] = useState([]);
    const [interestInput, setInterestInput] = useState('');

    const handleCreate = async () => {
        if (!user) {
            alert("Please log in to create a circle."); // Provide UI feedback
            return;
        }
        try {
            const circleRef = await addDoc(collection(db, 'circles'), {
                circleName,
                description,
                imageUrl: null, // Placeholder, will be updated after upload
                circlePrivacy,
                circleType,
                expiresAt: circleType === 'flash' ? expiresAt : null,
                interests,
                createdAt: serverTimestamp(),
                createdBy: user.uid,
            });

            let uploadedPhotoUrl = null;
            if (photoUrl) {
                const result = await uploadCircleImageToCloudinary(photoUrl, circleRef.id);
                uploadedPhotoUrl = result.imageUrl;

                // Update the Firestore document with the actual image URL
                await updateDoc(doc(db, 'circles', circleRef.id), {
                    imageUrl: uploadedPhotoUrl,
                });
            }

            // Add the creator to their own joinedCircles array
            await updateDoc(doc(db, 'users', user.uid), {
                joinedCircles: arrayUnion(circleRef.id)
            });

            // Create members subcollection and add creator as first member
            const memberRef = doc(db, 'circles', circleRef.id, 'members', user.uid);
            await setDoc(memberRef, {
                email: userProfile?.email || user.email || '',
                isAdmin: true,
                photoURL: userProfile?.avatarPhoto || user.photoURL || '',
                username: userProfile?.username || user.displayName || user.email?.split('@')[0] || 'Unknown User',
                joinedAt: serverTimestamp(),
                userId: user.uid
            });

            // Update user's circles stat
            await incrementUserStat(user.uid, 'circles');

            navigation.navigate('InviteAndShare', { circleName, circleId: circleRef.id });
        } catch (error) {
            console.error("Error creating circle: ", error);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Changed to Images only
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhotoUrl(result.assets[0].uri);
        }
    };

    const addInterest = () => {
        if (interestInput.trim() !== '') {
            setInterests([...interests, interestInput.trim()]);
            setInterestInput('');
        }
    };

    const isCreateDisabled = circleName.trim() === '';

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colorVars.background }]}>
            <StandardHeader
                title={t('circleCreation.createCircle')}
                showBackButton={true}
                rightIcon={null}
                navigation={navigation}
                onRightPress={handleCreate}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ backgroundColor: colorVars.background }}>
                <View style={[styles.createButtonContainer, { backgroundColor: colorVars.background }]}>
                    <TouchableOpacity onPress={handleCreate} disabled={isCreateDisabled} style={[styles.createButton, { backgroundColor: isCreateDisabled ? colorVars.disabled : colorVars.primary }]}>
                        <Text style={[styles.createButtonText, { color: colorVars.background }]}>{t('circleCreation.create')}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.avatarUploader, { backgroundColor: colorVars.background }]} onPress={pickImage}>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={[styles.avatar, { borderColor: colorVars.borderActive }]} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { borderColor: colorVars.borderActive, backgroundColor: colorVars.surface }]}>
                            <Ionicons name="camera" size={40} color={colorVars.textSecondary} />
                            <Text style={[styles.addPhotoText, { color: colorVars.textSecondary }]}>{t('circleCreation.addPhoto')}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>{t('circleCreation.circleName')}</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: colorVars.surface,
                            borderColor: colorVars.border,
                            color: colorVars.textPrimary
                        }]}
                        placeholder="The Weekend Crew"
                        placeholderTextColor={colorVars.textMuted}
                        value={circleName}
                        onChangeText={setCircleName}
                    />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>{t('circleCreation.description')}</Text>
                    <TextInput
                        style={[styles.input, styles.descriptionInput, {
                            backgroundColor: colorVars.surface,
                            borderColor: colorVars.border,
                            color: colorVars.textPrimary
                        }]}
                        placeholder={t('circleCreation.descriptionPlaceholder')}
                        placeholderTextColor={colorVars.textMuted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>{t('circleCreation.privacy')}</Text>
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
                            ]}>{t('circleCreation.public')}</Text>
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
                            ]}>{t('circleCreation.private')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>{t('circleCreation.type')}</Text>
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
                            ]}>{t('circleCreation.permanent')}</Text>
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
                            ]}>{t('circleCreation.flash')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {circleType === 'flash' && (
                    <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                        <Text style={[styles.label, { color: colorVars.textPrimary }]}>{t('circleCreation.expiresAt')}</Text>
                        <TouchableOpacity
                            style={[styles.input, {
                                backgroundColor: colorVars.surface,
                                borderColor: colorVars.border
                            }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: expiresAt ? colorVars.textPrimary : colorVars.textMuted }}>
                                {expiresAt ? expiresAt.toLocaleDateString() : t('circleCreation.selectExpiryDate')}
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
                                        setShowDatePicker(false); // Close the picker after a date is selected
                                    } else if (event.type === 'dismissed') {
                                        setShowDatePicker(false); // Close the picker if dismissed without selection
                                    }
                                }}
                            />
                        )}
                    </View>
                )}

                <View style={[styles.inputContainer, { backgroundColor: colorVars.background }]}>
                    <Text style={[styles.label, { color: colorVars.textPrimary }]}>{t('circleCreation.interests')}</Text>
                    <View style={[styles.interestInputContainer, {
                        backgroundColor: colorVars.surface,
                        borderColor: colorVars.border
                    }]}>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: colorVars.surface,
                                color: colorVars.textPrimary
                            }]}
                            placeholder={t('circleCreation.addInterest')}
                            placeholderTextColor={colorVars.textMuted}
                            value={interestInput}
                            onChangeText={setInterestInput}
                        />
                        <TouchableOpacity onPress={addInterest} style={[styles.addButton, { backgroundColor: colorVars.accent }]}>
                            <Text style={[styles.addButtonText, { color: colorVars.background }]}>{t('circleCreation.add')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.interestsContainer, { backgroundColor: colorVars.background }]}>
                        {interests.map((interest, index) => (
                            <View key={index} style={[styles.interestTag, {
                                backgroundColor: colorVars.surface,
                                borderColor: colorVars.border
                            }]}>
                                <Text style={[styles.interestTagText, { color: colorVars.textPrimary }]}>{interest}</Text>
                                <TouchableOpacity onPress={() => setInterests(interests.filter((_, i) => i !== index))} style={styles.removeInterestButton}>
                                    <Ionicons name="close-circle" size={16} color={colorVars.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.fullWidthButton,
                        { backgroundColor: isCreateDisabled ? colorVars.disabled : colorVars.primary }
                    ]}
                    onPress={handleCreate}
                    disabled={isCreateDisabled}
                >
                    <Text style={[styles.fullWidthButtonText, { color: colorVars.background }]}>{t('circleCreation.createCircle')}</Text>
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
    createButtonContainer: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    createButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: RADII.rounded,
        alignItems: 'center',
    },
    createButtonText: {
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
        //...SHADOWS.softPrimary,
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
    toggleButtonActive: {
        //...SHADOWS.btnPrimary,
    },
    toggleButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    toggleButtonTextActive: {
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
        //...SHADOWS.btnSecondaryHover,
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
        // ...SHADOWS.btnPrimary,
    },
    disabledFullWidthButton: {
        // ...SHADOWS.card,
    },
    fullWidthButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default CreationForm;