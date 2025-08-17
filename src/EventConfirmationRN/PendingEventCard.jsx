import React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Modal, Linking } from "react-native";
import { Clock, MapPin, Users, CalendarCheck2 } from "lucide-react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import EventForm from "./EventForm";
import { COLORS, THEMES } from "../constants/constants";
import { useTheme } from "../hooks/useTheme";

const AVATAR_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1"];

const getColorForUser = (userId) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % AVATAR_COLORS.length);
    return AVATAR_COLORS[index];
};

export default function PendingEventCard({ event, isActive }) {
    const [comingUsers, setComingUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPollModalVisible, setPollModalVisible] = useState(false);

    const status = event.status;

    useEffect(() => {
        if (!event?.rsvps) {
            setComingUsers([]);
            setIsLoading(false);
            return;
        }

        const fetchComingUsers = async () => {
            setIsLoading(true);
            try {
                const yesUserIds = Object.entries(event.rsvps)
                    .filter(([_, rsvpStatus]) => rsvpStatus === "yes")
                    .map(([userId]) => userId);

                const usersData = await Promise.all(
                    yesUserIds.map(async (id) => {
                        try {
                            const userDoc = await getDoc(doc(db, "users", id));
                            if (userDoc.exists()) {
                                return { id, ...userDoc.data() };
                            }
                        } catch (error) {
                            console.error(`Error fetching user with ID ${id}:`, error);
                        }
                        return null;
                    })
                );
                setComingUsers(usersData.filter(Boolean));
            } catch (error) {
                console.error("Failed to fetch coming users:", error);
                setComingUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComingUsers();
    }, [event]);

    const { theme } = useTheme();

    const handleLocationPress = () => {
        if (event.Location) {
            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
            const latLng = `${event.latitude},${event.longitude}`;
            const label = event.place;
            const url = Platform.select({
                ios: `${scheme}${label}@${latLng}`,
                android: `${scheme}${latLng}(${label})`
            });
            Linking.openURL(url);
        }
    };

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.card,
                    isActive && styles.activeCard,
                    !isActive && styles.pastCard,
                ]}
                onPress={() => setPollModalVisible(true)}
            >
                {isActive && (
                    <View style={styles.activeIndicator}>
                        <Text style={styles.activeIndicatorText}>Active Event</Text>
                    </View>
                )}
                {/* Top Row: Event Details */}
                <View style={styles.topRow}>
                    <View style={styles.iconContainer}>
                        <CalendarCheck2 size={20} color="#FFFFFF" />
                    </View>

                    <View style={styles.eventDetails}>
                        <Text style={styles.eventName}>
                            {event.activity || "Pending Event"}
                        </Text>
                        <TouchableOpacity
                            style={styles.locationContainer}
                            onPress={handleLocationPress}
                        >
                            <MapPin size={14} color="#4ECDC4" />
                            <Text style={styles.locationText}>
                                {event.place || "No location specified"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    status === "confirmed" ? "#4ECDC4" : "#FF6B6B",
                            },
                        ]}
                    >
                        <Text style={styles.statusText}>{event.status}</Text>
                    </View>
                </View>

                {/* Bottom Row: Attendees */}
                <View style={styles.bottomRow}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : comingUsers.length > 0 ? (
                        <View style={styles.attendeesContainer}>
                            <View style={styles.avatarContainer}>
                                {comingUsers.slice(0, 3).map((user, index) => (
                                    <View
                                        key={user.id}
                                        style={[
                                            styles.avatar,
                                            {
                                                backgroundColor: user.avatarPhoto
                                                    ? "transparent"
                                                    : getColorForUser(user.id),
                                                zIndex: comingUsers.length - index,
                                            },
                                        ]}
                                    >
                                        {user.avatarPhoto ? (
                                            <Image
                                                source={{ uri: user.avatarPhoto }}
                                                style={styles.avatarImage}
                                            />
                                        ) : (
                                            <Text style={styles.avatarInitial}>
                                                {user.displayName?.charAt(0).toUpperCase() || "U"}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                                {comingUsers.length > 3 && (
                                    <View style={[styles.avatar, styles.moreAvatar]}>
                                        <Text style={styles.moreText}>
                                            +{comingUsers.length - 3}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.goingText}>
                                {comingUsers.length} going
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.noRsvpContainer}>
                            <Users size={16} color="#FFFFFF" />
                            <Text style={styles.noRsvpText}>No one has RSVP'd yet</Text>
                        </View>
                    )}
                    <View style={styles.dateTimeContainer}>
                        <Text style={styles.dateText}>{event.day}</Text>
                        <Clock size={12} color="#FFFFFF" />
                    </View>
                </View>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isPollModalVisible}
                onRequestClose={() => {
                    setPollModalVisible(!isPollModalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <EventForm
                            event={event}
                            onClose={() => setPollModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: THEMES.dark.card,
        borderRadius: RADII.rounded,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: THEMES.dark.border,
        ...SHADOWS.medium,
    },
    activeCard: {
        borderColor: COLORS.accent,
        borderWidth: 2,
        ...SHADOWS.softPrimary,
    },
    pastCard: {
        opacity: 0.6,
    },
    activeIndicator: {
        backgroundColor: COLORS.accent,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: RADII.small,
        alignSelf: "flex-start",
        marginBottom: 8,
    },
    activeIndicatorText: {
        color: THEMES.dark.text,
        fontSize: 12,
        fontWeight: "bold",
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    iconContainer: {
        backgroundColor: theme.primary,
        borderRadius: RADII.circle,
        padding: 8,
    },
    eventDetails: {
        flex: 1,
        marginLeft: 12,
    },
    eventName: {
        color: theme.text,
        fontSize: 18,
        fontWeight: "bold",
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    locationText: {
        color: theme.accent,
        fontSize: 12,
        marginLeft: 4,
    },
    statusBadge: {
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    statusText: {
        color: theme.text,
        fontSize: 12,
        fontWeight: "500",
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    attendeesContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        flexDirection: "row",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.card,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: -10,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
    },
    avatarInitial: {
        color: theme.text,
        fontWeight: "bold",
    },
    moreAvatar: {
        backgroundColor: theme.surface,
    },
    moreText: {
        color: theme.accent,
        fontWeight: "bold",
        fontSize: 12,
    },
    goingText: {
        color: theme.accent,
        fontSize: 12,
        marginLeft: 8,
    },
    noRsvpContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    noRsvpText: {
        color: theme.text,
        opacity: 0.7,
        marginLeft: 8,
        fontSize: 12,
    },
    dateTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        color: theme.textSecondary,
        fontSize: 10,
        marginRight: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
        margin: 20,
        backgroundColor: theme.card,
        borderRadius: RADII.largeRounded,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "90%",
    },
});