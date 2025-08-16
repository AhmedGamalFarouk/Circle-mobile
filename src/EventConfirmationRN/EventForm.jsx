import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase-config";
import { useParams } from "react-router-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function EventForm({ event, onClose }) {
    const { t } = useTranslation();
    let { circleId } = useParams();
    const [activity, setActivity] = useState(event.activity || "");
    const [place, setPlace] = useState(event.place || "");
    const [day, setDay] = useState(event.day ? new Date(event.day) : new Date());
    const [location, setLocation] = useState(event.Location || "");
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

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
        if (!activity.trim() || !place.trim() || !day) {
            Alert.alert(t("Validation Error"), t("Please fill all required fields."));
            return;
        }

        try {
            const eventRef = doc(db, "circles", circleId, "events", event.id);
            await updateDoc(eventRef, {
                activity: activity.trim(),
                place: place.trim(),
                day: day.toISOString().split("T")[0],
                Location: location.trim(),
                status: "confirmed",
                updatedAt: serverTimestamp(),
            });
            onClose();
        } catch (err) {
            console.error("Error updating event:", err);
            Alert.alert(t("Error"), t("Failed to update the event."));
        }
    };

    const openInMaps = () => {
        if (!place.trim()) {
            Alert.alert(t("Input Error"), t("Please enter a place first."));
            return;
        }
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            place
        )}`;
        setLocation(mapsUrl);
        Linking.openURL(mapsUrl);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("Event Confirmation")}</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("Activity *")}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t("what we're gonna do?")}
                    value={activity}
                    onChangeText={setActivity}
                    placeholderTextColor="#888"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("Place *")}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t("where we're gonna go?")}
                    value={place}
                    onChangeText={setPlace}
                    placeholderTextColor="#888"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("Location")}</Text>
                <View style={styles.locationInputContainer}>
                    <TextInput
                        style={[styles.input, styles.locationInput]}
                        placeholder={t("Enter place or address")}
                        value={location}
                        onChangeText={setLocation}
                        placeholderTextColor="#888"
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        padding: 20,
        backgroundColor: "#1A1A2E",
        borderRadius: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
        textAlign: "center",
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#2A2A4E",
        borderRadius: 8,
        padding: 12,
        color: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#45B7D1",
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
        backgroundColor: "#4ECDC4",
        padding: 12,
        borderRadius: 8,
    },
    mapsButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    datePickerButton: {
        backgroundColor: "#2A2A4E",
        borderRadius: 8,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#45B7D1",
    },
    datePickerText: {
        color: "#FFFFFF",
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    submitButton: {
        backgroundColor: "#45B7D1",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        flex: 1,
    },
    cancelButton: {
        backgroundColor: "#FF6B6B",
        marginLeft: 10,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});