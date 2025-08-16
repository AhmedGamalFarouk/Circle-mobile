import React, { useContext } from "react";
import { EventContext } from "../../contexts/EventContext";
import { View, Text, StyleSheet } from "react-native";
import EventConfirmationStack from "./EventConfirmationStack";
import { useParams } from "react-router-native";

export default function EventConfirmation() {
    let { pollID, setpollID } = useContext(EventContext);
    let { circleId } = useParams();

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