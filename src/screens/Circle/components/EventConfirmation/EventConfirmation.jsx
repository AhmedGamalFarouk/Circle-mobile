import React from "react";
import { View, Text, StyleSheet } from "react-native";
import EventConfirmationStack from "./EventConfirmationStack";
import { useRoute } from "@react-navigation/native";

export default function EventConfirmation() {
    const route = useRoute();
    const { circleId } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Event Confirmation</Text>
            <EventConfirmationStack circleId={circleId} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#121212",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
        textAlign: "center",
    },
});