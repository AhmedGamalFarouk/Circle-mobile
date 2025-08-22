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


        </View>
    );
};

const getStyles = (width, isLandscape, colors) =>
    StyleSheet.create({
        buttonsContainer: {
            flexDirection: "row",
            width: width * 0.85,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: isLandscape ? 20 : 25,
            marginTop: isLandscape ? 10 : 15,
            paddingHorizontal: 15,
            alignSelf: "center",
        },
        followButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: isLandscape ? 12 : 15,
            paddingHorizontal: isLandscape ? 24 : 32,
            borderRadius: RADII.pill,
            flex: 1,
            marginRight: 12,
            borderWidth: 2,
            minHeight: isLandscape ? 44 : 50,
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
            fontSize: isLandscape ? 15 : 17,
            fontFamily: FONTS.body,
            fontWeight: "700",
            letterSpacing: 0.5,
        },
        buttonTextLandscape: {
            fontSize: 14,
        },

    });

export default ProfileActions;
