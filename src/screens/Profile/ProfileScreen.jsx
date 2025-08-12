import React, {
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback,
} from "react";
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
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SHADOWS, RADII } from "../../constants/constants";
import BottomNavBar from "../../components/BottomNavBar";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfo from "./components/ProfileInfo";
import ProfileStats from "./components/ProfileStats";
import ProfileActions from "./components/ProfileActions";
import MediaGrid from "./components/MediaGrid";
import DraggableCard from "./components/DraggableCard";
import MySquad from "./components/MySquad";
import JoinedCircles from "./components/JoinedCircles";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ImagePickerModal from "../../components/ImagePicker/ImagePickerModal";
import { auth, db } from "../../firebase/config";
import {
    arrayUnion,
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
    getOptimizedImageUrl,
} from "../../utils/cloudinaryUpload";
import useUserProfile from "../../hooks/useUserProfile";
import { useTheme } from "../../context/ThemeContext";

//TODO: add Placeholder image URLs
const PLACEHOLDER_AVATAR_URL =
    "https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_avatar.png";
const PLACEHOLDER_COVER_URL =
    "https://res.cloudinary.com/dwh8jhaot/image/upload/v1708542612/users/placeholder_cover.png";

const ProfileScreen = React.memo(({ route, navigation }) => {
    const { userId } = route.params || {};
    const currentUser = auth.currentUser;
    const profileId = userId || currentUser?.uid;
    const isOwnProfile = !userId || userId === currentUser?.uid;
    const {
        profile: initialProfile,
        connectionsCount,
        circlesCount,
        eventsCount,
        loading,
    } = useUserProfile(profileId, isOwnProfile);
    const [profile, setProfile] = useState(initialProfile);

    // Reset profile state when route params change
    useEffect(() => {
        setProfile(initialProfile);
    }, [initialProfile, userId]);

    // Reset editing state when switching between profiles
    useEffect(() => {
        setIsEditing(false);
        setEditingUserName("");
        setEditingUserBio("");
        setEditingProfileImage(null);
        setEditingCoverImage(null);
    }, [userId]);

    // Handle tab press to reset to own profile
    useEffect(() => {
        const unsubscribe = navigation.addListener("tabPress", (e) => {
            // If we're currently viewing another user's profile, reset to own profile
            if (userId && userId !== currentUser?.uid) {
                // Prevent default tab press behavior
                e.preventDefault();
                // Navigate to Profile without userId
                navigation.navigate("Profile");
            }
        });

        return unsubscribe;
    }, [navigation, userId, currentUser?.uid]);
    const insets = useSafeAreaInsets();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    // State management
    const [isFollowed, setIsFollowed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserName, setEditingUserName] = useState("");
    const [editingUserBio, setEditingUserBio] = useState("");
    const [editingProfileImage, setEditingProfileImage] = useState(null);
    const [editingCoverImage, setEditingCoverImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false); // New state for upload indicator
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [currentImageForOptions, setCurrentImageForOptions] = useState(null);
    const [currentImageType, setCurrentImageType] = useState(null);

    // Animation values
    const scrollY = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const coverImageOpacity = useRef(new Animated.Value(1)).current;
    const shimmerAnimation = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();
    // Enhanced interaction handlers with haptic feedback and animations

    const handleFollow = useCallback(async () => {
        // Haptic feedback
        if (Platform.OS === "ios") {
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

        const docRef = doc(db, "users", profileId);
        const snap = await getDoc(docRef);
        setIsFollowed(!isFollowed);

        if (isFollowed) {
            const data = snap.data();
            console.log(data);
            const requests = data.connectionRequests || [];
            const updatedRequests = requests.filter(
                (req) => req.uid !== currentUser.uid
            );
            console.log(updatedRequests);
            await updateDoc(docRef, {
                connectionRequests: updatedRequests,
            });
        } else {
            await updateDoc(docRef, {
                ["connectionRequests"]: arrayUnion({
                    email: currentUser.email || "",
                    uid: currentUser.uid || "",
                    username: currentUser.displayName || "",
                    sentAt: Timestamp.now(),
                }),
            });
        }
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
        if (Platform.OS === "ios") {
            Vibration.vibrate([10, 100, 10]);
        } else {
            Vibration.vibrate(100);
        }

        try {
            setIsUploading(true); // Start uploading indicator

            const updatedData = {
                username: editingUserName,
                bio: editingUserBio,
            };

            // Upload profile image if changed
            if (
                editingProfileImage &&
                editingProfileImage.base64 &&
                editingProfileImage.uri !==
                    (profile?.avatarPhoto || PLACEHOLDER_AVATAR_URL)
            ) {
                try {
                    console.log("Uploading profile image to Cloudinary...");
                    const result = await uploadImageToCloudinary(
                        currentUser.uid,
                        editingProfileImage.base64,
                        "avatar"
                    );
                    console.log(
                        "Profile image uploaded successfully:",
                        result.imageUrl
                    );

                    // Use optimized URL for better performance
                    const optimizedUrl =
                        getOptimizedImageUrl(result.publicId, "avatar") ||
                        result.imageUrl;

                    updatedData.avatarPhoto = optimizedUrl;
                    updatedData.avatarPhotoPublicId = result.publicId; // Store public ID for future operations

                    setEditingProfileImage({ uri: optimizedUrl });
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        avatarPhoto: optimizedUrl,
                        avatarPhotoPublicId: result.publicId,
                    }));
                } catch (error) {
                    console.error("Error uploading profile image:", error);
                    Alert.alert(
                        "Error",
                        `Failed to upload profile image: ${
                            error.message || "Unknown error"
                        }`
                    );
                    return; // Don't continue if image upload fails
                }
            }

            // Upload cover image if changed
            if (
                editingCoverImage &&
                editingCoverImage.base64 &&
                editingCoverImage.uri !==
                    (profile?.coverPhoto || PLACEHOLDER_COVER_URL)
            ) {
                try {
                    console.log("Uploading cover image to Cloudinary...");
                    const result = await uploadImageToCloudinary(
                        currentUser.uid,
                        editingCoverImage.base64,
                        "cover"
                    );
                    console.log(
                        "Cover image uploaded successfully:",
                        result.imageUrl
                    );

                    // Use optimized URL for better performance
                    const optimizedUrl =
                        getOptimizedImageUrl(result.publicId, "cover") ||
                        result.imageUrl;

                    updatedData.coverPhoto = optimizedUrl;
                    updatedData.coverPhotoPublicId = result.publicId; // Store public ID for future operations

                    setEditingCoverImage({ uri: optimizedUrl });
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        coverPhoto: optimizedUrl,
                        coverPhotoPublicId: result.publicId,
                    }));
                } catch (error) {
                    console.error("Error uploading cover image:", error);
                    Alert.alert(
                        "Error",
                        `Failed to upload cover image: ${
                            error.message || "Unknown error"
                        }`
                    );
                    return; // Don't continue if image upload fails
                }
            }

            // Only write to Firestore if there are changes
            if (
                Object.keys(updatedData).length > 3 ||
                updatedData.username !== profile?.username ||
                updatedData.bio !== profile?.bio ||
                false
            ) {
                await setDoc(doc(db, "users", currentUser.uid), updatedData, {
                    merge: true,
                });
            }

            Alert.alert("Success", "Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Failed to save profile.");
        } finally {
            setIsUploading(false); // Stop uploading indicator
        }
    }, [
        currentUser,
        editingUserName,
        editingUserBio,
        editingProfileImage,
        editingCoverImage,
        profile,
        navigation,
    ]);

    const handleEdit = useCallback(() => {
        // Haptic feedback for edit mode
        if (Platform.OS === "ios") {
            Vibration.vibrate(10);
        } else {
            Vibration.vibrate(30);
        }

        setIsEditing(true);
        setEditingUserName(profile?.username || "");
        setEditingUserBio(profile?.bio || "");
        setEditingProfileImage(
            profile?.avatarPhoto
                ? { uri: profile.avatarPhoto }
                : { uri: PLACEHOLDER_AVATAR_URL }
        );
        setEditingCoverImage(
            profile?.coverPhoto
                ? { uri: profile.coverPhoto }
                : { uri: PLACEHOLDER_COVER_URL }
        );
    }, [profile]);

    const handleImagePress = useCallback(
        (imageUri, imageType) => {
            if (isEditing) {
                setCurrentImageForOptions(imageUri);
                setCurrentImageType(imageType);
                setShowImageOptions(true);
            }
        },
        [isEditing]
    );

    const handleImageSelected = useCallback(
        (imageData) => {
            try {
                setImageLoading(true);

                if (currentImageType === "avatar") {
                    setEditingProfileImage({
                        uri: imageData.uri,
                        base64: imageData.base64,
                        width: imageData.width,
                        height: imageData.height,
                    });
                } else if (currentImageType === "cover") {
                    setEditingCoverImage({
                        uri: imageData.uri,
                        base64: imageData.base64,
                        width: imageData.width,
                        height: imageData.height,
                    });
                }

                // Simulate loading for better UX
                setTimeout(() => setImageLoading(false), 500);
            } catch (error) {
                console.error("Error handling selected image:", error);
                Alert.alert("Error", "Failed to process selected image");
                setImageLoading(false);
            }
        },
        [currentImageType]
    );

    const openImagePicker = useCallback((imageType) => {
        setCurrentImageType(imageType);
        setShowImageOptions(false);
        setShowImagePicker(true);
    }, []);

    const handleDeleteImage = useCallback(async () => {
        setShowImageOptions(false);
        if (!currentUser || !currentImageType) {
            Alert.alert(
                "Error",
                "No user logged in or image type not specified."
            );
            return;
        }

        // Show confirmation dialog
        Alert.alert(
            "Delete Image",
            `Are you sure you want to delete your ${
                currentImageType === "avatar"
                    ? "profile picture"
                    : "cover image"
            }?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsUploading(true);

                            // Try to delete from Cloudinary using stored public_id
                            try {
                                const publicIdToDelete =
                                    currentImageType === "avatar"
                                        ? profile?.avatarPhotoPublicId
                                        : profile?.coverPhotoPublicId;

                                if (publicIdToDelete) {
                                    await deleteImageFromCloudinary(
                                        publicIdToDelete,
                                        currentImageType
                                    );
                                } else {
                                    console.warn(
                                        "No public_id found for deletion, skipping Cloudinary cleanup"
                                    );
                                }
                            } catch (cloudinaryError) {
                                console.warn(
                                    "Cloudinary deletion failed, but continuing with local cleanup:",
                                    cloudinaryError
                                );
                            }

                            let updatedData = {};
                            if (currentImageType === "avatar") {
                                updatedData = {
                                    avatarPhoto: PLACEHOLDER_AVATAR_URL,
                                    avatarPhotoPublicId: null,
                                };
                                setEditingProfileImage({
                                    uri: PLACEHOLDER_AVATAR_URL,
                                });
                                setProfile((prev) => ({
                                    ...prev,
                                    avatarPhoto: PLACEHOLDER_AVATAR_URL,
                                    avatarPhotoPublicId: null,
                                }));
                            } else if (currentImageType === "cover") {
                                updatedData = {
                                    coverPhoto: PLACEHOLDER_COVER_URL,
                                    coverPhotoPublicId: null,
                                };
                                setEditingCoverImage({
                                    uri: PLACEHOLDER_COVER_URL,
                                });
                                setProfile((prev) => ({
                                    ...prev,
                                    coverPhoto: PLACEHOLDER_COVER_URL,
                                    coverPhotoPublicId: null,
                                }));
                            }

                            await setDoc(
                                doc(db, "users", currentUser.uid),
                                updatedData,
                                { merge: true }
                            );

                            Alert.alert(
                                "Success",
                                `${
                                    currentImageType === "avatar"
                                        ? "Profile picture"
                                        : "Cover image"
                                } deleted successfully!`
                            );
                        } catch (error) {
                            console.error("Error deleting image:", error);
                            Alert.alert(
                                "Error",
                                `Failed to delete ${currentImageType} image: ${
                                    error.message || "Unknown error"
                                }`
                            );
                        } finally {
                            setIsUploading(false);
                        }
                    },
                },
            ]
        );
    }, [currentUser, currentImageType]);

    // Responsive calculations
    const isLandscape = screenWidth > screenHeight;
    const coverHeight = isLandscape ? screenHeight * 0.5 : screenHeight * 0.65;
    const styles = useMemo(
        () => getStyles(screenHeight, screenWidth, insets, isLandscape, colors),
        [screenHeight, screenWidth, insets, isLandscape, colors]
    );

    const pan = useRef(new Animated.ValueXY()).current;
    const initialMarginTop = -screenHeight * 0.08;
    const expandedMarginTop = isLandscape
        ? -screenHeight * 0.3
        : -screenHeight * 0.55;

    // Parallax effect for cover image
    const coverImageTranslateY = scrollY.interpolate({
        inputRange: [0, coverHeight],
        outputRange: [0, -coverHeight * 0.3],
        extrapolate: "clamp",
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, coverHeight * 0.5, coverHeight],
        outputRange: [1, 0.8, 0.3],
        extrapolate: "clamp",
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([null, { dy: pan.y }], {
                useNativeDriver: false,
            }),
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
        <View
            style={[
                styles.container,
                { paddingTop: insets.top, backgroundColor: colors.background },
            ]}
        >
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
                <Animated.View
                    style={[
                        styles.coverImageContainer,
                        { transform: [{ translateY: coverImageTranslateY }] },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() =>
                            handleImagePress(
                                isEditing
                                    ? editingCoverImage?.uri
                                    : profile?.coverPhoto,
                                "cover"
                            )
                        }
                        disabled={!isEditing}
                        activeOpacity={isEditing ? 0.8 : 1}
                    >
                        <Animated.View
                            style={[
                                styles.coverImageWrapper,
                                { opacity: headerOpacity },
                                { backgroundColor: colors.background },
                            ]}
                        >
                            <Image
                                source={
                                    isEditing && editingCoverImage
                                        ? editingCoverImage
                                        : profile?.coverPhoto
                                        ? { uri: profile.coverPhoto }
                                        : { uri: PLACEHOLDER_COVER_URL }
                                }
                                style={[
                                    styles.coverImage,
                                    isEditing && styles.coverImageEditing,
                                ]}
                                onLoadStart={() => setImageLoading(true)}
                                onLoadEnd={() => setImageLoading(false)}
                            />
                            {/* Gradient Overlay */}
                            <View style={styles.gradientOverlay} />

                            {imageLoading && (
                                <Animated.View
                                    style={[
                                        styles.imageLoadingOverlay,
                                        { opacity: shimmerAnimation },
                                    ]}
                                />
                            )}
                        </Animated.View>

                        {isEditing && (
                            <Animated.View
                                style={[
                                    styles.editCoverIconContainer,
                                    { transform: [{ scale: buttonScale }] },
                                ]}
                            >
                                <View style={styles.glassmorphicButton}>
                                    {isUploading ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={COLORS.light}
                                        />
                                    ) : (
                                        <Text style={styles.editIcon}>
                                            📷 Change Cover
                                        </Text>
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
                    showBackButton={!isOwnProfile}
                />

                {/* Enhanced Draggable Card */}
                <DraggableCard
                    pan={pan}
                    panResponder={panResponder}
                    screenHeight={screenHeight}
                >
                    {/* Enhanced Profile Image */}
                    <Animated.View
                        style={[
                            styles.profileImageContainer,
                            { transform: [{ scale: buttonScale }] },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() =>
                                handleImagePress(
                                    isEditing
                                        ? editingProfileImage?.uri
                                        : profile?.avatarPhoto,
                                    "avatar"
                                )
                            }
                            disabled={!isEditing}
                            activeOpacity={isEditing ? 0.8 : 1}
                        >
                            <View style={styles.profileImageWrapper}>
                                <Image
                                    source={
                                        isEditing && editingProfileImage
                                            ? editingProfileImage
                                            : profile?.avatarPhoto
                                            ? { uri: profile.avatarPhoto }
                                            : { uri: PLACEHOLDER_AVATAR_URL }
                                    }
                                    style={[
                                        styles.profileImage,
                                        isEditing && styles.profileImageEditing,
                                    ]}
                                    onLoadStart={() => setImageLoading(true)}
                                    onLoadEnd={() => setImageLoading(false)}
                                />

                                {/* Status Ring */}
                                <View style={styles.statusRing} />

                                {imageLoading && (
                                    <Animated.View
                                        style={[
                                            styles.profileImageLoading,
                                            { opacity: shimmerAnimation },
                                        ]}
                                    />
                                )}

                                {isEditing && (
                                    <View style={styles.editIconContainer}>
                                        <View
                                            style={styles.glassmorphicEditIcon}
                                        >
                                            {isUploading ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color={COLORS.light}
                                                />
                                            ) : (
                                                <Text style={styles.editIcon}>
                                                    📷
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Enhanced Profile Info */}
                    <ProfileInfo
                        userName={
                            isEditing ? editingUserName : profile?.username
                        }
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
                        events={eventsCount}
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
                    <MySquad
                        shimmerAnimation={shimmerAnimation}
                        loading={loading}
                        isOwnProfile={isOwnProfile}
                        userId={profileId}
                    />
                    <JoinedCircles
                        shimmerAnimation={shimmerAnimation}
                        loading={loading}
                        isOwnProfile={isOwnProfile}
                        userId={profileId}
                    />
                </DraggableCard>
            </ScrollView>
            <ImageOptionsModal
                visible={showImageOptions}
                onClose={() => setShowImageOptions(false)}
                onChooseNew={() => openImagePicker(currentImageType)}
                onDelete={handleDeleteImage}
                imageType={currentImageType}
            />

            <ImagePickerModal
                visible={showImagePicker}
                onClose={() => setShowImagePicker(false)}
                onImageSelected={handleImageSelected}
                imageType={currentImageType}
                title={
                    currentImageType === "avatar"
                        ? "Profile Picture"
                        : "Cover Image"
                }
            />
        </View>
    );
});

const ImageOptionsModal = ({
    visible,
    onClose,
    onChooseNew,
    onDelete,
    imageType,
}) => {
    const { colors } = useTheme();
    const modalStyles = getModalStyles(colors);
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View
                    style={[
                        modalStyles.modalView,
                        { backgroundColor: colors.surface },
                    ]}
                >
                    <Text style={modalStyles.modalTitle}>
                        Choose Action for{" "}
                        {imageType === "avatar" ? "Profile" : "Cover"} Image
                    </Text>
                    <TouchableOpacity
                        style={[
                            modalStyles.button,
                            { backgroundColor: colors.primary },
                        ]}
                        onPress={onChooseNew}
                    >
                        <Text style={modalStyles.textStyle}>
                            Choose New Image
                        </Text>
                    </TouchableOpacity>
                    {imageType === "avatar" && (
                        <TouchableOpacity
                            style={[
                                modalStyles.button,
                                modalStyles.buttonDelete,
                            ]}
                            onPress={onDelete}
                        >
                            <Text style={modalStyles.textStyle}>
                                Delete Profile Image
                            </Text>
                        </TouchableOpacity>
                    )}
                    {imageType === "cover" && (
                        <TouchableOpacity
                            style={[
                                modalStyles.button,
                                modalStyles.buttonDelete,
                            ]}
                            onPress={onDelete}
                        >
                            <Text style={modalStyles.textStyle}>
                                Delete Cover Image
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[
                            modalStyles.button,
                            modalStyles.buttonClose,
                            { backgroundColor: colors.secondary },
                        ]}
                        onPress={onClose}
                    >
                        <Text style={modalStyles.textStyle}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const getModalStyles = (colors) =>
    StyleSheet.create({
        centeredView: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
        },
        modalView: {
            margin: 20,
            borderRadius: RADII.large,
            padding: 35,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            width: "80%",
        },
        modalTitle: {
            marginBottom: 15,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
            color: colors.text,
        },
        button: {
            borderRadius: RADII.rounded,
            padding: 15,
            elevation: 2,
            width: "100%",
            marginBottom: 10,
        },
        buttonDelete: {
            backgroundColor: "#dc3545",
        },
        buttonClose: {},
        textStyle: {
            color: colors.text,
            fontWeight: "bold",
            textAlign: "center",
        },
    });

const getStyles = (height, width, insets, isLandscape, colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        coverImageContainer: {
            width: "100%",
            height: isLandscape ? height * 0.5 : height * 0.65,
            overflow: "hidden",
        },
        coverImageWrapper: {
            width: "100%",
            height: "100%",
            position: "relative",
        },
        coverImage: {
            width: "100%",
            height: "100%",
            resizeMode: "cover",
        },
        coverImageEditing: {
            opacity: 0.8,
        },
        gradientOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(180deg, transparent 0%, ${COLORS.darker}40 70%, ${COLORS.darker}80 100%)`,
            backgroundColor: "rgba(18, 19, 26, 0.3)", // Fallback for React Native
        },
        imageLoadingOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.glass,
            justifyContent: "center",
            alignItems: "center",
        },
        editCoverIconContainer: {
            position: "absolute",
            top: insets.top + 20,
            right: 20,
            zIndex: 10,
        },
        glassmorphicButton: {
            backgroundColor: COLORS.glass,
            borderRadius: RADII.rounded,
            padding: 12,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.1)",
            ...SHADOWS.glassCard,
        },
        profileImageContainer: {
            position: "absolute",
            top: -50,
            alignSelf: "center",
            zIndex: 10,
        },
        profileImageWrapper: {
            position: "relative",
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
            position: "absolute",
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
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.glass,
            borderRadius: isLandscape ? 40 : 50,
        },
        editIconContainer: {
            position: "absolute",
            bottom: -5,
            right: -5,
            zIndex: 11,
        },
        glassmorphicEditIcon: {
            backgroundColor: COLORS.glass,
            borderRadius: RADII.circle,
            padding: 8,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
            ...SHADOWS.btnPrimary,
        },
        editIcon: {
            color: colors.text,
            fontSize: isLandscape ? 14 : 16,
            fontWeight: "600",
            textAlign: "center",
        },
    });

export default ProfileScreen;
