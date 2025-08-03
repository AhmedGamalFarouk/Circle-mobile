import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Pressable } from "react-native";
import { COLORS, FONTS, RADII } from "../../../constants/constants";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import MembersList from './MembersList';
import CircleSettings from './CircleSettings';

const CircleHeader = ({ name, imageUrl, circleId }) => {
  const navigation = useNavigation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [showCircleSettings, setShowCircleSettings] = useState(false);

  const menuOptions = [
    { id: 'members', title: 'Members', icon: 'people-outline' },
    { id: 'memories', title: 'Memories', icon: 'images-outline' },
    { id: 'events', title: 'Events', icon: 'calendar-outline' },
    { id: 'settings', title: 'Circle Settings', icon: 'settings-outline' },
  ];

  const handleMenuPress = (optionId) => {
    setShowDropdown(false);

    if (optionId === 'members') {
      setShowMembersList(true);
    } else if (optionId === 'settings') {
      setShowCircleSettings(true);
    } else {
      // TODO: Navigate to respective screens based on optionId
      console.log(`Selected: ${optionId}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.light} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerContainer}>
        <Image source={{ uri: imageUrl }} style={styles.profilePic} />
        <Text style={styles.groupName}>{name}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setShowDropdown(true)}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={COLORS.light} />
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdown}>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.dropdownItem}
                onPress={() => handleMenuPress(option.id)}
              >
                <Ionicons name={option.icon} size={20} color={COLORS.light} />
                <Text style={styles.dropdownText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <MembersList
        visible={showMembersList}
        onClose={() => setShowMembersList(false)}
        circleId={circleId}
      />

      <CircleSettings
        visible={showCircleSettings}
        onClose={() => setShowCircleSettings(false)}
        circleId={circleId}
        circleData={circleData}
      />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: COLORS.dark,
    borderRadius: RADII.medium,
    borderWidth: 1,
    borderColor: COLORS.glass,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownText: {
    color: COLORS.light,
    fontSize: 16,
    fontFamily: FONTS.body,
  },
});

export default CircleHeader;