import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/config";
import PendingEventCard from "./PendingEventCard";
import { View, Text, FlatList, StyleSheet } from "react-native";
import useAuth from "../../../../hooks/useAuth";

export default function EventConfirmationStack({ circleId }) {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!circleId || !user) return;

        const checkAdminStatus = async () => {
            try {
                const circleRef = doc(db, "circles", circleId);
                const circleSnap = await getDoc(circleRef);
                if (circleSnap.exists()) {
                    const circleData = circleSnap.data();
                    const memberRef = doc(db, "circles", circleId, "members", user.uid);
                    const memberSnap = await getDoc(memberRef);
                    if (memberSnap.exists()) {
                        const memberData = memberSnap.data();
                        setIsAdmin(memberData.role === 'admin' || circleData.owner === user.uid);
                    }
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
            } finally {
                setIsAdminLoading(false);
            }
        };

        checkAdminStatus();

        const q = query(
            collection(db, "circles", circleId, "events"),
            where("status", "in", ["pending", "confirmed"])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPendingEvents(events);
        });

        return () => unsubscribe();
    }, [circleId, user]);

    const renderItem = ({ item }) => {
        if (isAdminLoading) {
            return null; // Or a loading indicator for each card
        }
        return <PendingEventCard event={item} isAdmin={isAdmin} circleId={circleId} />;
    };

    const filteredEvents = pendingEvents;

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