import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { COLORS, FONTS, RADII } from "../../../constants/constants";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { getCircleImageUrl } from '../../../utils/imageUtils';
import { useTheme } from "../../../context/ThemeContext";

const CircleHeader = ({ name, circleId, circle }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.primary }]}>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.centerContainer, { backgroundColor: colors.background, borderColor: colors.primary }]}
        onPress={() => navigation.navigate('CircleDetails', { circleId })}
      >
        <Image source={{ uri: getCircleImageUrl(circle) }} style={[styles.profilePic, { backgroundColor: colors.background }]} />
        <View style={[styles.nameAndTimer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Text style={[styles.groupName, { color: colors.text }]}>{name}</Text>
        </View>
      </TouchableOpacity>

      <View style={[styles.iconContainer, { color: colors.primary }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    
  },
  iconContainer: {
    padding: 10,
  },
  centerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  nameAndTimer: {
    flex: 1,
    alignItems: "center",
  },
  compactTimer: {
    marginTop: 4,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: RADII.circle,
  },
  groupName: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    fontWeight: "600",
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    elevation: 3,
  },
});

export default CircleHeader;