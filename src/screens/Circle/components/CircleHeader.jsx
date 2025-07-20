import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, RADII } from "../../../constants/constants";

const CircleHeader = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer}>
        <Text style={styles.iconText}>{'<'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerContainer}>
        <View style={styles.profilePic} />
        <Text style={styles.groupName}>The Weekend Crew</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconContainer}>
        <Text style={styles.iconText}>⋮</Text>
      </TouchableOpacity>
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
    marginTop: 20,
    backgroundColor: COLORS.dark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass,
  },
  iconContainer: {
    padding: 10,
  },
  iconText: {
    color: COLORS.light,
    fontSize: 24,
    fontFamily: FONTS.heading,
  },
  centerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: RADII.circle,
    backgroundColor: COLORS.secondary,
  },
  groupName: {
    color: COLORS.light,
    fontSize: 18,
    fontFamily: FONTS.heading,
  },
});

export default CircleHeader;