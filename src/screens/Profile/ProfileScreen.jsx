import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Animated,
    PanResponder,
    useWindowDimensions,
    TouchableOpacity,
    Text,
    Alert,
    ScrollView,
    Vibration,
    Dimensions,
    Platform,
    Modal,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS, RADII } from '../../constants/constants';
import BottomNavBar from '../../components/BottomNavBar';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfo from './components/ProfileInfo';
import ProfileStats from './components/ProfileStats';
import ProfileActions from './components/ProfileActions';
import MediaGrid from './components/MediaGrid';
import DraggableCard from './components/DraggableCard';
import MySquad from './components/MySquad';
import JoinedCircles from './components/JoinedCircles';
import LoadingSkeleton from './components/LoadingSkeleton';
import { auth, db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import useUserProfile from '../../hooks/useUserProfile';
import { useTheme } from '../../context/ThemeContext';

const ProfileScreen = React.memo(({ route, navigation }) => {
    const { userId } = route.params || {};
    const currentUser = auth.currentUser;
    const profileId = userId || currentUser?.uid;
    const { profile, connectionsCount, circlesCount, loading } = useUserProfile(profileId);
    const isOwnProfile = !userId || userId === currentUser?.uid;
    const insets = useSafeAreaInsets();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    // State management
    const [isFollowed, setIsFollowed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserName, setEditingUserName] = useState('');
    const [editingUserBio, setEditingUserBio] = useState('');
    const [editingProfileImage, setEditingProfileImage] = useState(null);
    const [editingCoverImage, setEditingCoverImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false); // New state for upload indicator
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [currentImageForOptions, setCurrentImageForOptions] = useState(null);
    const [currentImageType, setCurrentImageType] = useState(null);

    // Animation values
    const scrollY = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const coverImageOpacity = useRef(new Animated.Value(1)).current;
    const shimmerAnimation = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme()
    // Enhanced interaction handlers with haptic feedback and animations
    const handleFollow = useCallback(() => {
        // Haptic feedback
        if (Platform.OS === 'ios') {
            Vibration.vibrate([10, 50]);
        } else {
            Vibration.vibrate(50);
        }

        // Button press animation
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setIsFollowed(!isFollowed);
    }, [isFollowed, buttonScale]);

    // Shimmer animation for loading states
    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        if (loading) {
            shimmer.start();
        } else {
            shimmer.stop();
        }

        return () => shimmer.stop();
    }, [loading, shimmerAnimation]);

    const handleSave = useCallback(async () => {
        if (!currentUser) {
            Alert.alert("Error", "No user logged in.");
            return;
        }

        // Haptic feedback for save action
        if (Platform.OS === 'ios') {
            Vibration.vibrate([10, 100, 10]);
        } else {
            Vibration.vibrate(100);
        }

        try {
            setIsUploading(true); // Start uploading indicator
            const functions = getFunctions();
            const uploadProfileImage = httpsCallable(functions, 'uploadProfileImage');

            if (editingProfileImage && editingProfileImage.uri !== (profile?.profileImage || 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_avatar.png')) {
                const response = await fetch(editingProfileImage.uri);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                await new Promise((resolve) => {
                    reader.onloadend = async () => {
                        const base64data = reader.result.split(',')[1];
                        await uploadProfileImage({ image: base64data, type: 'avatar' });
                        resolve();
                    };
                });
            }

            if (editingCoverImage && editingCoverImage.uri !== (profile?.coverImage || 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_cover.png')) {
                const response = await fetch(editingCoverImage.uri);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                await new Promise((resolve) => {
                    reader.onloadend = async () => {
                        const base64data = reader.result.split(',')[1];
                        await uploadProfileImage({ image: base64data, type: 'cover' });
                        resolve();
                    };
                });
            }

            await setDoc(doc(db, 'users', currentUser.uid), {
                username: editingUserName,
                bio: editingUserBio,
            }, { merge: true });

            Alert.alert("Success", "Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert("Error", "Failed to save profile.");
        } finally {
            setIsUploading(false); // Stop uploading indicator
        }
    }, [currentUser, editingUserName, editingUserBio, editingProfileImage, editingCoverImage, profile, navigation]);

    const handleEdit = useCallback(() => {
        // Haptic feedback for edit mode
        if (Platform.OS === 'ios') {
            Vibration.vibrate(10);
        } else {
            Vibration.vibrate(30);
        }

        setIsEditing(true);
        setEditingUserName(profile?.username || '');
        setEditingUserBio(profile?.bio || '');
        setEditingProfileImage(profile?.profileImage ? { uri: profile.profileImage } : { uri: 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_avatar.png' });
        setEditingCoverImage(profile?.coverImage ? { uri: profile.coverImage } : { uri: 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_cover.png' });
    }, [profile]);


    const handleImagePress = useCallback((imageUri, imageType) => {
        if (isEditing) {
            setCurrentImageForOptions(imageUri);
            setCurrentImageType(imageType);
            setShowImageOptions(true);
        }
    }, [isEditing]);

    const pickImage = useCallback(async (aspectRatio, imageType) => {
        setShowImageOptions(false);
        try {
            if (Platform.OS === 'ios') {
                Vibration.vibrate(10);
            } else {
                Vibration.vibrate(30);
            }

            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access gallery is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: aspectRatio,
                quality: 0.8,
                base64: true, // Request base64 for direct upload
            });

            if (!result.canceled) {
                setImageLoading(true);
                if (imageType === 'profile') {
                    setEditingProfileImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
                } else if (imageType === 'cover') {
                    setEditingCoverImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
                }
                setTimeout(() => setImageLoading(false), 500);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    }, []);

    const handleDeleteImage = useCallback(async () => {
        setShowImageOptions(false);
        if (!currentUser || !currentImageType) {
            Alert.alert("Error", "No user logged in or image type not specified.");
            return;
        }

        try {
            const functions = getFunctions();
            const deleteProfileImage = httpsCallable(functions, 'deleteProfileImage');
            await deleteProfileImage({ type: currentImageType });

            if (currentImageType === 'avatar') {
                setEditingProfileImage({ uri: 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_avatar.png' });
            } else if (currentImageType === 'cover') {
                setEditingCoverImage({ uri: 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_cover.png' });
            }
            Alert.alert("Success", `${currentImageType} image deleted successfully!`);
        } catch (error) {
            console.error('Error deleting image:', error);
            Alert.alert("Error", `Failed to delete ${currentImageType} image.`);
        }
    }, [currentUser, currentImageType]);

    // Responsive calculations
    const isLandscape = screenWidth > screenHeight;
    const coverHeight = isLandscape ? screenHeight * 0.5 : screenHeight * 0.65;
    const styles = useMemo(() => getStyles(screenHeight, screenWidth, insets, isLandscape), [screenHeight, screenWidth, insets, isLandscape]);

    const pan = useRef(new Animated.ValueXY()).current;
    const initialMarginTop = -screenHeight * 0.08;
    const expandedMarginTop = isLandscape ? -screenHeight * 0.3 : -screenHeight * 0.55;

    // Parallax effect for cover image
    const coverImageTranslateY = scrollY.interpolate({
        inputRange: [0, coverHeight],
        outputRange: [0, -coverHeight * 0.3],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, coverHeight * 0.5, coverHeight],
        outputRange: [1, 0.8, 0.3],
        extrapolate: 'clamp',
    });

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

    // Show loading skeleton while data is loading
    if (loading) {
        return <LoadingSkeleton shimmerAnimation={shimmerAnimation} />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Enhanced Cover Image with Parallax */}
                <Animated.View style={[
                    styles.coverImageContainer,
                    { transform: [{ translateY: coverImageTranslateY }] }
                ]}>
                    <TouchableOpacity
                        onPress={() => handleImagePress(isEditing ? editingCoverImage?.uri : profile?.coverImage, 'cover')}
                        disabled={!isEditing}
                        activeOpacity={isEditing ? 0.8 : 1}
                    >
                        <Animated.View style={[styles.coverImageWrapper, { opacity: headerOpacity }, { backgroundColor: colors.background }]}>
                            <Image
                                source={isEditing && editingCoverImage ? editingCoverImage : (profile?.coverImage ? { uri: profile.coverImage } : { uri: 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_cover.png' })}
                                style={[styles.coverImage, isEditing && styles.coverImageEditing]}
                                onLoadStart={() => setImageLoading(true)}
                                onLoadEnd={() => setImageLoading(false)}
                            />
                            {/* Gradient Overlay */}
                            <View style={styles.gradientOverlay} />

                            {imageLoading && (
                                <Animated.View style={[
                                    styles.imageLoadingOverlay,
                                    { opacity: shimmerAnimation }
                                ]} />
                            )}
                        </Animated.View>

                        {isEditing && (
                            <Animated.View style={[
                                styles.editCoverIconContainer,
                                { transform: [{ scale: buttonScale }] }
                            ]}>
                                <View style={styles.glassmorphicButton}>
                                    {isUploading ? (
                                        <ActivityIndicator size="small" color={COLORS.light} />
                                    ) : (
                                        <Text style={styles.editIcon}>📷 Change Cover</Text>
                                    )}
                                </View>
                            </Animated.View>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* Enhanced Profile Header */}
                <ProfileHeader
                    navigation={navigation}
                    isOwnProfile={isOwnProfile}
                    isEditing={isEditing}
                    onSave={handleSave}
                    onEdit={handleEdit}
                    buttonScale={buttonScale}
                />

                {/* Enhanced Draggable Card */}
                <DraggableCard pan={pan} panResponder={panResponder} screenHeight={screenHeight}>
                    {/* Enhanced Profile Image */}
                    <Animated.View style={[
                        styles.profileImageContainer,
                        { transform: [{ scale: buttonScale }] }
                    ]}>
                        <TouchableOpacity
                            onPress={() => handleImagePress(isEditing ? editingProfileImage?.uri : profile?.profileImage, 'avatar')}
                            disabled={!isEditing}
                            activeOpacity={isEditing ? 0.8 : 1}
                        >
                            <View style={styles.profileImageWrapper}>
                                <Image
                                    source={isEditing && editingProfileImage ? editingProfileImage : (profile?.profileImage ? { uri: profile.profileImage } : { uri: 'https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_avatar.png' })}
                                    style={[styles.profileImage, isEditing && styles.profileImageEditing]}
                                    onLoadStart={() => setImageLoading(true)}
                                    onLoadEnd={() => setImageLoading(false)}
                                />

                                {/* Status Ring */}
                                <View style={styles.statusRing} />

                                {imageLoading && (
                                    <Animated.View style={[
                                        styles.profileImageLoading,
                                        { opacity: shimmerAnimation }
                                    ]} />
                                )}

                                {isEditing && (
                                    <View style={styles.editIconContainer}>
                                        <View style={styles.glassmorphicEditIcon}>
                                            {isUploading ? (
                                                <ActivityIndicator size="small" color={COLORS.light} />
                                            ) : (
                                                <Text style={styles.editIcon}>📷</Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Enhanced Profile Info */}
                    <ProfileInfo
                        userName={isEditing ? editingUserName : profile?.username}
                        userBio={isEditing ? editingUserBio : profile?.bio}
                        isEditing={isEditing}
                        onUserNameChange={setEditingUserName}
                        onUserBioChange={setEditingUserBio}
                        shimmerAnimation={shimmerAnimation}
                        loading={loading}
                    />

                    {/* Enhanced Profile Stats */}
                    <ProfileStats
                        connections={connectionsCount}
                        circles={circlesCount}
                        shimmerAnimation={shimmerAnimation}
                        loading={loading}
                    />

                    {/* Enhanced Profile Actions */}
                    {!isOwnProfile && (
                        <ProfileActions
                            isFollowed={isFollowed}
                            onFollow={handleFollow}
                            buttonScale={buttonScale}
                        />
                    )}

                    {/* Enhanced Sections */}
                    <MySquad shimmerAnimation={shimmerAnimation} loading={loading} />
                    <JoinedCircles shimmerAnimation={shimmerAnimation} loading={loading} />
                </DraggableCard>
            </ScrollView>
            <ImageOptionsModal
                visible={showImageOptions}
                onClose={() => setShowImageOptions(false)}
                onChooseNew={() => {
                    if (currentImageType === 'avatar') {
                        pickImage([1, 1], 'avatar');
                    } else if (currentImageType === 'cover') {
                        pickImage([16, 9], 'cover');
                    }
                }}
                onDelete={handleDeleteImage}
                imageType={currentImageType}
            />
        </View>
    );
});

const ImageOptionsModal = ({ visible, onClose, onChooseNew, onDelete, imageType }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>Choose Action for {imageType === 'avatar' ? 'Profile' : 'Cover'} Image</Text>
                    <TouchableOpacity
                        style={modalStyles.button}
                        onPress={onChooseNew}
                    >
                        <Text style={modalStyles.textStyle}>Choose New Image</Text>
                    </TouchableOpacity>
                    {imageType === 'avatar' && (
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonDelete]}
                            onPress={onDelete}
                        >
                            <Text style={modalStyles.textStyle}>Delete Profile Image</Text>
                        </TouchableOpacity>
                    )}
                    {imageType === 'cover' && (
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonDelete]}
                            onPress={onDelete}
                        >
                            <Text style={modalStyles.textStyle}>Delete Cover Image</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[modalStyles.button, modalStyles.buttonClose]}
                        onPress={onClose}
                    >
                        <Text style={modalStyles.textStyle}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        margin: 20,
        backgroundColor: COLORS.dark,
        borderRadius: RADII.large,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.light,
    },
    button: {
        borderRadius: RADII.rounded,
        padding: 15,
        elevation: 2,
        width: '100%',
        marginBottom: 10,
        backgroundColor: COLORS.primary,
    },
    buttonDelete: {
        backgroundColor: COLORS.error,
    },
    buttonClose: {
        backgroundColor: COLORS.secondary,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
});

const getStyles = (height, width, insets, isLandscape) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    coverImageContainer: {
        width: '100%',
        height: isLandscape ? height * 0.5 : height * 0.65,
        overflow: 'hidden',
    },
    coverImageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    coverImageEditing: {
        opacity: 0.8,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(180deg, transparent 0%, ${COLORS.darker}40 70%, ${COLORS.darker}80 100%)`,
        backgroundColor: 'rgba(18, 19, 26, 0.3)', // Fallback for React Native
    },
    imageLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editCoverIconContainer: {
        position: 'absolute',
        top: insets.top + 20,
        right: 20,
        zIndex: 10,
    },
    glassmorphicButton: {
        backgroundColor: COLORS.glass,
        borderRadius: RADII.rounded,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...SHADOWS.glassCard,
    },
    profileImageContainer: {
        position: 'absolute',
        top: -50,
        alignSelf: 'center',
        zIndex: 10,
    },
    profileImageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: isLandscape ? 80 : 100,
        height: isLandscape ? 80 : 100,
        borderRadius: isLandscape ? 40 : 50,
        borderWidth: 4,
        borderColor: COLORS.dark,
        ...SHADOWS.card,
    },
    profileImageEditing: {
        borderColor: COLORS.primary,
        opacity: 0.8,
    },
    statusRing: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: isLandscape ? 42 : 52,
        borderWidth: 2,
        borderColor: COLORS.accent,
        opacity: 0.8,
    },
    profileImageLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.glass,
        borderRadius: isLandscape ? 40 : 50,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        zIndex: 11,
    },
    glassmorphicEditIcon: {
        backgroundColor: COLORS.glass,
        borderRadius: RADII.circle,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...SHADOWS.btnPrimary,
    },
    editIcon: {
        color: COLORS.light,
        fontSize: isLandscape ? 14 : 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default ProfileScreen;
