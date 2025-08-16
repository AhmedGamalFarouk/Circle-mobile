import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';
import EventForm from '../EventConfirmation/EventForm';

const PendingEventItem = ({ event, circleId, onEventUpdated }) => {
    const { colors } = useTheme();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    const styles = getStyles(colors);

    const handleConfirmEvent = () => {
        setShowEventForm(true);
    };

    const handleRejectEvent = () => {
        Alert.alert(
            'Reject Event',
            `Are you sure you want to reject "${event.title}"? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: performRejectEvent,
                },
            ]
        );
    };

    const performRejectEvent = async () => {
        setIsRejecting(true);
        try {
            const eventRef = doc(db, 'circles', circleId, 'events', event.id);
            await updateDoc(eventRef, {
                status: 'rejected',
                rejectedAt: serverTimestamp(),
            });

            // Add system message to chat about event rejection
            const chatRef = collection(db, 'circles', circleId, 'chat');
            await addDoc(chatRef, {
                messageType: 'system',
                text: `❌ Event "${event.title}" was rejected by admin.`,
                timeStamp: serverTimestamp(),
            });

            onEventUpdated?.();
        } catch (error) {
            console.error('Error rejecting event:', error);
            Alert.alert(
                'Error',
                'Failed to reject the event. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsRejecting(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'No date set';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.detailsRow}>
                            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.eventLocation}>
                                {event.location || 'No location specified'}
                            </Text>
                        </View>
                        {event.createdAt && (
                            <View style={styles.detailsRow}>
                                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.eventDate}>
                                    Created {formatDate(event.createdAt)}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Pending</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={handleRejectEvent}
                        disabled={isRejecting || isConfirming}
                    >
                        {isRejecting ? (
                            <Text style={styles.rejectButtonText}>Rejecting...</Text>
                        ) : (
                            <>
                                <Ionicons name="close-circle-outline" size={20} color="#FF6B6B" />
                                <Text style={styles.rejectButtonText}>Reject</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.confirmButton]}
                        onPress={handleConfirmEvent}
                        disabled={isRejecting || isConfirming}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                        <Text style={styles.confirmButtonText}>Confirm Event</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showEventForm}
                onRequestClose={() => setShowEventForm(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <EventForm
                            event={event}
                            circleId={circleId}
                            onClose={() => {
                                setShowEventForm(false);
                                onEventUpdated?.();
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: RADII.rounded,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        ...SHADOWS.card,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        backgroundColor: colors.primary + '20',
        borderRadius: RADII.rounded,
        padding: 8,
        marginRight: 12,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    eventLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 6,
    },
    eventDate: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: 6,
    },
    statusBadge: {
        backgroundColor: colors.warning + '20',
        borderRadius: RADII.small,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.warning,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: RADII.rounded,
        gap: 8,
    },
    rejectButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    rejectButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B6B',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: colors.surface,
        borderRadius: RADII.rounded,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '80%',
    },
});

export default PendingEventItem;