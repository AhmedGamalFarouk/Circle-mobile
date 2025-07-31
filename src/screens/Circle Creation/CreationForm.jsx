import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADII } from '../../constants/constants';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, storage } from '../../firebase/config';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import useAuth from '../../hooks/useAuth';

const CreationForm = ({ navigation }) => {
    const { user } = useAuth();
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
        console.log("Attempting to create circle with data:", { // Removed temporary log
            circleName,
            description,
            photoUrl,
            circlePrivacy,
            circleType,
            expiresAt: circleType === 'flash' ? expiresAt : null,
            interests,
            createdBy: user.uid,
        });
        try {
            const circleRef = await addDoc(collection(db, 'circles'), {
                circleName,
                description,
                photoUrl: null, // Placeholder, will be updated after upload
                circlePrivacy,
                circleType,
                expiresAt: circleType === 'flash' ? expiresAt : null,
                interests,
                createdAt: serverTimestamp(),
                createdBy: user.uid,
            });

            let uploadedPhotoUrl = null;
            if (photoUrl) {
                const response = await fetch(photoUrl);
                const blob = await response.blob();
                const storageRef = ref(storage, `circle_images/${circleRef.id}`);
                await uploadBytes(storageRef, blob);
                uploadedPhotoUrl = await getDownloadURL(storageRef);

                // Update the Firestore document with the actual photo URL
                await updateDoc(doc(db, 'circles', circleRef.id), {
                    photoUrl: uploadedPhotoUrl,
                });
            }

            console.log("Circle created successfully with ID:", circleRef.id);
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
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Create a New Circle</Text>
                    <TouchableOpacity onPress={handleCreate} disabled={isCreateDisabled} style={styles.createButtonHeader}>
                        <Text style={[styles.createButtonTextHeader, isCreateDisabled && styles.disabledButtonText]}>Create</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.avatarUploader} onPress={pickImage}>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="camera" size={40} color={COLORS.text} />
                            <Text style={styles.addPhotoText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>CIRCLE NAME</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="The Weekend Crew"
                        placeholderTextColor={COLORS.text}
                        value={circleName}
                        onChangeText={setCircleName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        placeholder={"What's this circle for?\n e.g., Planning our weekly hangouts."}
                        placeholderTextColor={COLORS.text}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>PRIVACY</Text>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, circlePrivacy === 'public' && styles.toggleButtonActive]}
                            onPress={() => setCirclePrivacy('public')}
                        >
                            <Text style={[styles.toggleButtonText, circlePrivacy === 'public' && styles.toggleButtonTextActive]}>Public</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, circlePrivacy === 'private' && styles.toggleButtonActive]}
                            onPress={() => setCirclePrivacy('private')}
                        >
                            <Text style={[styles.toggleButtonText, circlePrivacy === 'private' && styles.toggleButtonTextActive]}>Private</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>TYPE</Text>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, circleType === 'permanent' && styles.toggleButtonActive]}
                            onPress={() => setCircleType('permanent')}
                        >
                            <Text style={[styles.toggleButtonText, circleType === 'permanent' && styles.toggleButtonTextActive]}>Permanent</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, circleType === 'flash' && styles.toggleButtonActive]}
                            onPress={() => setCircleType('flash')}
                        >
                            <Text style={[styles.toggleButtonText, circleType === 'flash' && styles.toggleButtonTextActive]}>flash</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {circleType === 'flash' && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>EXPIRES AT</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: expiresAt ? COLORS.light : COLORS.text }}>
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
                                        setShowDatePicker(false); // Close the picker after a date is selected
                                    } else if (event.type === 'dismissed') {
                                        setShowDatePicker(false); // Close the picker if dismissed without selection
                                    }
                                }}
                            />
                        )}
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>INTERESTS</Text>
                    <View style={styles.interestInputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Add an interest"
                            placeholderTextColor={COLORS.text}
                            value={interestInput}
                            onChangeText={setInterestInput}
                        />
                        <TouchableOpacity onPress={addInterest} style={styles.addButton}>
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.interestsContainer}>
                        {interests.map((interest, index) => (
                            <View key={index} style={styles.interestTag}>
                                <Text style={styles.interestTagText}>{interest}</Text>
                                <TouchableOpacity onPress={() => setInterests(interests.filter((_, i) => i !== index))} style={styles.removeInterestButton}>
                                    <Ionicons name="close-circle" size={16} color={COLORS.text} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={[styles.fullWidthButton, isCreateDisabled && styles.disabledFullWidthButton]} onPress={handleCreate} disabled={isCreateDisabled}>
                    <Text style={styles.fullWidthButtonText}>Create Circle</Text>
                </TouchableOpacity>


            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.darker,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.darker,
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
        color: COLORS.light,
        fontSize: 20,
        fontWeight: 'bold',
    },
    createButtonHeader: {
        padding: 5,
    },
    createButtonTextHeader: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledButtonText: {
        color: COLORS.text,
    },
    avatarUploader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: RADII.circle,
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
        //...SHADOWS.softPrimary,
    },
    addPhotoText: {
        color: COLORS.text,
        marginTop: 5,
        fontSize: 14,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: RADII.circle,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        marginBottom: 10,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: COLORS.dark,
        color: COLORS.light,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: RADII.rounded,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.dark,
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.dark,
        borderRadius: RADII.rounded,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.dark,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: RADII.rounded,
        margin: 2,
    },
    toggleButtonActive: {
        backgroundColor: COLORS.primary,
        //...SHADOWS.btnPrimary,
    },
    toggleButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    toggleButtonTextActive: {
        color: COLORS.light,
    },
    interestInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.dark,
        borderRadius: RADII.rounded,
        borderWidth: 1,
        borderColor: COLORS.dark,
        paddingRight: 5,
    },
    addButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: RADII.rounded,
        marginLeft: 10,
        //...SHADOWS.btnSecondaryHover,
    },
    addButtonText: {
        color: COLORS.light,
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
        backgroundColor: COLORS.dark,
        borderRadius: RADII.pill,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    interestTagText: {
        color: COLORS.light,
        fontSize: 14,
        marginRight: 5,
    },
    removeInterestButton: {
        padding: 2,
    },
    fullWidthButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: RADII.rounded,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
        // ...SHADOWS.btnPrimary,
    },
    disabledFullWidthButton: {
        backgroundColor: COLORS.dark,
        // ...SHADOWS.card,
    },
    fullWidthButtonText: {
        color: COLORS.light,
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default CreationForm;