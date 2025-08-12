import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    useWindowDimensions,
    Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { RADII, SHADOWS, FONTS } from "../../../constants/constants";
import { useTheme } from "../../../context/ThemeContext";

const ProfileActions = ({
    isFollowed,
    onFollow,
    buttonScale,
    isConnection,
}) => {
    const { colors } = useTheme();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const styles = getStyles(width, isLandscape, colors);

    return (
        <View style={styles.buttonsContainer}>
            {/* Enhanced Follow/Connect Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={[
                        styles.followButton,
                        isFollowed
                            ? styles.followedButton
                            : styles.unfollowedButton,
                    ]}
                    onPress={onFollow}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name={isFollowed ? "person-remove" : "person-add"}
                        size={isLandscape ? 18 : 20}
                        color={colors.text}
                        style={styles.buttonIcon}
                    />
                    <Text
                        style={[
                            styles.buttonText,
                            isLandscape && styles.buttonTextLandscape,
                        ]}
                    >
                        {isFollowed && !isConnection ? "pending" : "Connect"}
                        {isConnection && "Connected"}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Message Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={[styles.messageButton, styles.glassmorphicButton]}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name="message"
                        size={isLandscape ? 18 : 20}
                        color={colors.primary}
                        style={styles.buttonIcon}
                    />
                    <Text
                        style={[
                            styles.messageButtonText,
                            isLandscape && styles.buttonTextLandscape,
                        ]}
                    >
                        Message
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* More Options Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={[styles.moreButton, styles.glassmorphicButton]}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name="more-horiz"
                        size={isLandscape ? 20 : 24}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const getStyles = (width, isLandscape, colors) =>
    StyleSheet.create({
        buttonsContainer: {
            flexDirection: "row",
            width: width * 0.9,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isLandscape ? 15 : 20,
            paddingHorizontal: 20,
        },
        followButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: isLandscape ? 10 : 12,
            paddingHorizontal: isLandscape ? 16 : 20,
            borderRadius: RADII.pill,
            flex: 1,
            marginRight: 10,
            borderWidth: 2,
        },
        unfollowedButton: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            ...SHADOWS.btnPrimary,
        },
        followedButton: {
            backgroundColor: colors.secondary,
            borderColor: colors.secondary,
            ...SHADOWS.btnSecondaryHover,
        },
        messageButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: isLandscape ? 10 : 12,
            paddingHorizontal: isLandscape ? 16 : 20,
            borderRadius: RADII.pill,
            flex: 1,
            marginRight: 10,
        },
        moreButton: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: isLandscape ? 10 : 12,
            paddingHorizontal: isLandscape ? 12 : 14,
            borderRadius: RADII.circle,
            width: isLandscape ? 44 : 48,
            height: isLandscape ? 44 : 48,
        },
        glassmorphicButton: {
            backgroundColor: colors.glassmorphic,
            borderWidth: 1,
            borderColor: colors.border,
            ...SHADOWS.card,
        },
        buttonIcon: {
            marginRight: 6,
        },
        buttonText: {
            color: colors.text,
            fontSize: isLandscape ? 14 : 16,
            fontFamily: FONTS.body,
            fontWeight: "600",
            letterSpacing: 0.5,
        },
        buttonTextLandscape: {
            fontSize: 14,
        },
        messageButtonText: {
            color: colors.primary,
            fontSize: isLandscape ? 14 : 16,
            fontFamily: FONTS.body,
            fontWeight: "600",
            letterSpacing: 0.5,
        },
    });

export default ProfileActions;
