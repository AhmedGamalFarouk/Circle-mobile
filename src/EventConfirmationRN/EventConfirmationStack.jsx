import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase-config";
import PendingEventCard from "./PendingEventCard";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function EventConfirmationStack({ circleId }) {
    const [pendingEvents, setPendingEvents] = useState([]);

    function isFuture(dateString) {
        const today = new Date();
        const eventDate = new Date(dateString);
        return eventDate >= today;
    }

    useEffect(() => {
        if (!circleId) return;

        const q = query(
            collection(db, "circles", circleId, "events"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPendingEvents(events);
        });

        return () => unsubscribe();
    }, [circleId]);

    const renderItem = ({ item }) => {
        const eventDate = new Date(item.day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

        const isActive = eventDate.toDateString() === today.toDateString();

        return <PendingEventCard event={item} isActive={isActive} />;
    };

    const filteredEvents = pendingEvents.filter(
        (event) => isFuture(event.day) || event.status === "pending"
    );

    return (
        <View style={styles.container}>
            {filteredEvents.length > 0 ? (
                <FlatList
                    data={filteredEvents}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
            ) : (
                <Text style={styles.noEventsText}>No upcoming events</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 10,
    },
    noEventsText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#888",
    },
});