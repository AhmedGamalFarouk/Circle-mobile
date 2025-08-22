import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Linking,
    ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { doc, updateDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase/config";
import { useRoute } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "../../../../context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';

export default function EventForm({ event, onClose, circleId }) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [day, setDay] = useState(event.day ? new Date(event.day) : new Date());
    const [location, setLocation] = useState(event.location || "");
    const [coordinates, setCoordinates] = useState(event.coordinates || null);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    // const [isMapVisible, setMapVisible] = useState(false); // Removed - MapPinSelector doesn't exist

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setDay(date);
        hideDatePicker();
    };

    const onSubmit = async () => {
        if (!day || !location.trim()) {
            Alert.alert(t("Validation Error"), t("Please fill all required fields."));
            return;
        }

        try {
            // Update the event status
            const eventRef = doc(db, "circles", circleId, "events", event.id);
            const updateData = {
                day: day.toISOString().split("T")[0],
                Location: location.trim(),
                status: "confirmed",
                updatedAt: serverTimestamp(),
            };
            
            // Add coordinates if they exist
            if (coordinates) {
                updateData.coordinates = coordinates;
            }
            
            await updateDoc(eventRef, updateData);

            // Update the poll stage to EVENT_CONFIRMED
            const pollsQuery = query(
                collection(db, "circles", circleId, "polls"),
                where("archived", "!=", true)
            );
            const pollsSnapshot = await getDocs(pollsQuery);
            
            if (!pollsSnapshot.empty) {
                const activePoll = pollsSnapshot.docs[0];
                const pollRef = doc(db, "circles", circleId, "polls", activePoll.id);
                await updateDoc(pollRef, {
                    stage: "Event Confirmed",
                });
            }

            onClose();
        } catch (err) {
            console.error("Error updating event:", err);
            Alert.alert(t("Error"), t("Failed to update the event."));
        }
    };

    const openInMaps = () => {
        if (coordinates) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
            Linking.openURL(mapsUrl);
        } else if (location.trim()) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                location
            )}`;
            Linking.openURL(mapsUrl);
        } else {
            Alert.alert(t("Input Error"), t("Please enter a place first."));
        }
    };

    const handleLocationSelect = (selectedCoordinates) => {
        setCoordinates(selectedCoordinates);
    };

    const showMapSelector = () => {
        setMapVisible(true);
    };

    const styles = getStyles(colors);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{t("Event Confirmation")}</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("Activity")}</Text>
                <Text style={styles.staticText}>{event.title}</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("Location")}</Text>
                <View style={styles.locationInputContainer}>
                    <TextInput
                        style={[styles.input, styles.locationInput]}
                        placeholder={t("Enter place or address")}
                        value={location}
                        onChangeText={setLocation}
                        placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity style={styles.mapsButton} onPress={openInMaps}>
                        <Text style={styles.mapsButtonText}>{t("Open in Maps")}</Text>
                    </TouchableOpacity>
                </View>
                
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("Event Day *")}</Text>
                <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>
                        {day.toLocaleDateString()}
                    </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    minimumDate={new Date()}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                    <Text style={styles.submitButtonText}>{t("Confirm Event")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.submitButton, styles.cancelButton]}
                    onPress={onClose}
                >
                    <Text style={styles.submitButtonText}>{t("Cancel")}</Text>
                </TouchableOpacity>
            </View>
                    </ScrollView>
    );
}

const getStyles = (colors) =>
    StyleSheet.create({
        container: {
            width: "100%",
            padding: 20,
            backgroundColor: colors.background,
            borderRadius: 10,
        },
        title: {
            fontSize: 22,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 20,
            textAlign: "center",
        },
        inputGroup: {
            marginBottom: 15,
        },
        label: {
            fontSize: 16,
            color: colors.text,
            marginBottom: 8,
        },
        input: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.primary,
        },
        staticText: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.primary,
        },
        locationInputContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        locationInput: {
            flex: 1,
            marginRight: 10,
        },
        mapsButton: {
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 8,
        },
        mapsButtonText: {
            color: colors.background,
            fontWeight: "bold",
        },
        datePickerButton: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.primary,
        },
        datePickerText: {
            color: colors.text,
        },
        buttonContainer: {
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "space-between",
        },
        submitButton: {
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
            flex: 1,
        },
        cancelButton: {
            backgroundColor: colors.error,
            marginLeft: 10,
        },
        submitButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: "bold",
        },
    });