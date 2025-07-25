import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Animated, PanResponder, useWindowDimensions, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/constants';
import BottomNavBar from '../../components/BottomNavBar';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfo from './components/ProfileInfo';
import ProfileStats from './components/ProfileStats';
import ProfileActions from './components/ProfileActions';
import MediaGrid from './components/MediaGrid';
import DraggableCard from './components/DraggableCard';
import MySquad from './components/MySquad';
import JoinedCircles from './components/JoinedCircles';
import { auth, db } from '../../firebase/config'; // Import auth and db
import { doc, setDoc } from 'firebase/firestore'; // Import doc and setDoc
import useUserProfile from '../../hooks/useUserProfile';

const ProfileScreen = ({ navigation }) => {
    const currentUser = auth.currentUser;
    const { profile } = useUserProfile(currentUser?.uid);

    const [isFollowed, setIsFollowed] = useState(false);
    const [userName, setUserName] = useState('');
    const [userBio, setUserBio] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [coverImage, setCoverImage] = useState(require('../../../assets/Avatar.jpg'));
    const [profileImage, setProfileImage] = useState(require('../../../assets/Avatar.jpg'));

    useEffect(() => {
        if (profile) {
            setUserName(profile.username || '');
            setUserBio(profile.bio || '');
            if (profile.profileImage) {
                setProfileImage({ uri: profile.profileImage });
            }
            if (profile.coverImage) {
                setCoverImage({ uri: profile.coverImage });
            }
        }
    }, [profile]);

    const handleFollow = () => {
        setIsFollowed(!isFollowed);
    };

    const handleSave = async () => {
        if (!currentUser) {
            Alert.alert("Error", "No user logged in.");
            return;
        }
        try {
            await setDoc(doc(db, 'users', currentUser.uid), {
                username: userName, // Changed to 'username' to match Firestore field
                bio: userBio,
                profileImage: profileImage.uri || '',
                coverImage: coverImage.uri || '',
                userImages: userImages,
            }, { merge: true }); // Use merge to update only specified fields
            Alert.alert("Success", "Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert("Error", "Failed to save profile.");
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };


    const handleChangeCoverImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access gallery is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 16],
                quality: 1,
            });

            if (!result.canceled) {
                setCoverImage({ uri: result.assets[0].uri });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleChangeProfileImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access gallery is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setProfileImage({ uri: result.assets[0].uri });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const { height } = useWindowDimensions();
    const styles = getStyles(height);
    const pan = useRef(new Animated.ValueXY()).current;
    const initialMarginTop = -height * 0.08;
    const expandedMarginTop = -height * 0.55;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy < -50) {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: expandedMarginTop },
                        useNativeDriver: false,
                    }).start();
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: initialMarginTop },
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    React.useEffect(() => {
        pan.setValue({ x: 0, y: initialMarginTop });
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: COLORS.text }]}>
            <TouchableOpacity
                onPress={isEditing ? handleChangeCoverImage : null}
                disabled={!isEditing}
            >
                <Image
                    source={coverImage}
                    style={[styles.coverImage, isEditing && styles.coverImageEditing]}
                />
                {isEditing && (
                    <View style={styles.editCoverIconContainer}>
                        <Text style={styles.editIcon}>✏️ Change Cover</Text>
                    </View>
                )}
            </TouchableOpacity>
            <ProfileHeader

                navigation={navigation}
                isEditing={isEditing}
                onSave={handleSave}
                onEdit={handleEdit}
            />

            <DraggableCard pan={pan} panResponder={panResponder}>
                <TouchableOpacity
                    style={styles.profileImageContainer}
                    onPress={isEditing ? handleChangeProfileImage : null}
                    disabled={!isEditing}
                >
                    <Image
                        source={profileImage}
                        style={[styles.profileImage, isEditing && styles.profileImageEditing]}
                    />
                    {isEditing && (
                        <View style={styles.editIconContainer}>
                            <Text style={styles.editIcon}>✏️</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <ProfileInfo
                    userName={userName}
                    userBio={userBio}
                    isEditing={isEditing}
                    onUserNameChange={setUserName}
                    onUserBioChange={setUserBio}
                />

                <ProfileStats />

                <ProfileActions
                    isFollowed={isFollowed}
                    onFollow={handleFollow}
                />


                <MySquad />

                <JoinedCircles />

            </DraggableCard>

            {/* <BottomNavBar /> */}
        </View>
    );
};

const getStyles = (height) => StyleSheet.create({
    container: {
        flex: 1,
    },
    coverImage: {
        width: '100%',
        height: height * 0.65,
        resizeMode: 'cover',
    },
    coverImageEditing: {
        opacity: 0.7,
    },
    editCoverIconContainer: {
        position: 'absolute',
        top: 70,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 8,
    },
    profileImageContainer: {
        position: 'absolute',
        top: -40, // Adjusted for better positioning
        alignSelf: 'center',
        zIndex: 1,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.dark,
    },
    profileImageEditing: {
        borderColor: COLORS.primary,
        opacity: 0.7,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 5,
    },
    editIcon: {
        color: 'white',
        fontSize: 16,
    },
});

export default ProfileScreen;