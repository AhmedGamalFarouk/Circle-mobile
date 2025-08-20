import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { COLORS, FONTS, RADII } from "../../../constants/constants";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { getCircleImageUrl } from '../../../utils/imageUtils';
import FlashCircleTimer from '../../../components/FlashCircleTimer';

const CircleHeader = ({ name, circleId, circle }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.light} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.centerContainer}
        onPress={() => navigation.navigate('CircleDetails', { circleId })}
      >
        <Image source={{ uri: getCircleImageUrl(circle) }} style={styles.profilePic} />
        <View style={styles.nameAndTimer}>
          <Text style={styles.groupName}>{name}</Text>
          {circle?.circleType === 'flash' && circle?.expiresAt && (
            <FlashCircleTimer expiresAt={circle.expiresAt} compact={true} style={styles.compactTimer} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.iconContainer} />
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
    backgroundColor: COLORS.dark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass,
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
    backgroundColor: COLORS.secondary,
  },
  groupName: {
    color: COLORS.light,
    fontSize: 18,
    fontFamily: FONTS.heading,
  },
});

export default CircleHeader;