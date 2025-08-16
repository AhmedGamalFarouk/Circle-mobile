import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';
import EventForm from '../EventConfirmation/EventForm';

const { width } = Dimensions.get('window');

const PendingEventItem = ({ event, circleId, onEventUpdated }) => {
    const { colors } = useTheme();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));
    const [slideAnim] = useState(new Animated.Value(0));
    const styles = getStyles(colors);

    React.useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleConfirmEvent = () => {
        setIsConfirming(true);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowEventForm(true);
            setIsConfirming(false); // Re-enable button after animation
        });
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

    const getPriorityColor = () => {
        switch (event.priority) {
            case 'high': return colors.error;
            case 'medium': return colors.warning;
            default: return colors.primary;
        }
    };

    const getTimeAgo = () => {
        if (!event.createdAt) return 'Recently';

        const now = new Date();
        const created = event.createdAt.toDate ? event.createdAt.toDate() : new Date(event.createdAt);
        const diffMs = now - created;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return 'Just now';
    };

    return (
        <>
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [
                            { scale: scaleAnim },
                            {
                                translateX: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [width, 0],
                                })
                            }
                        ]
                    }
                ]}
            >
                <View
                    style={[styles.gradientBackground, { backgroundColor: colors.surface }]}
                >
                    {/* Priority Indicator */}
                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <View
                                style={[styles.iconGradient, { backgroundColor: colors.primary }]}
                            >
                                <Ionicons name="calendar" size={24} color={colors.background} />
                            </View>
                        </View>

                        <View style={styles.eventInfo}>
                            <View style={styles.titleRow}>
                                <Text style={styles.eventTitle} numberOfLines={2}>
                                    {event.title}
                                </Text>
                                <View style={styles.statusBadge}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>Pending</Text>
                                </View>
                            </View>

                            <View style={styles.detailsContainer}>
                                <View style={styles.detailsRow}>
                                    <Ionicons name="location" size={16} color={colors.primary} />
                                    <Text style={styles.eventLocation} numberOfLines={1}>
                                        {event.location || 'Location TBD'}
                                    </Text>
                                </View>

                                <View style={styles.detailsRow}>
                                    <Ionicons name="time" size={16} color={colors.textSecondary} />
                                    <Text style={styles.eventDate}>
                                        {getTimeAgo()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Event Preview */}
                    {event.description && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description} numberOfLines={2}>
                                {event.description}
                            </Text>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={handleRejectEvent}
                            disabled={isRejecting || isConfirming}
                        >
                            {isRejecting ? (
                                <>
                                    <View style={styles.loadingSpinner} />
                                    <Text style={styles.rejectButtonText}>Rejecting...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="close-circle" size={20} color={colors.error} />
                                    <Text style={styles.rejectButtonText}>Reject</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.confirmButton,
                                { backgroundColor: colors.primary } // Apply background color directly
                            ]}
                            onPress={handleConfirmEvent}
                            disabled={isRejecting || isConfirming}
                        >
                            {isConfirming ? (
                                <>
                                    <View style={styles.loadingSpinner} />
                                    <Text style={styles.confirmButtonText}>Confirming...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.background} />
                                    <Text style={styles.confirmButtonText}>Confirm Event</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

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
        borderRadius: RADII.large,
        marginBottom: 16,
        overflow: 'hidden',
        ...SHADOWS.medium,
        position: 'relative',
    },
    gradientBackground: {
        padding: 20,
        // Removed gradient, using solid background color
    },
    priorityIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        marginRight: 16,
    },
    iconGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        // Removed gradient, using solid background color
    },
    eventInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
        marginRight: 12,
        lineHeight: 26,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warning + '20',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.warning,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.warning,
    },
    detailsContainer: {
        gap: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    eventLocation: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
        flex: 1,
    },
    eventDate: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    descriptionContainer: {
        backgroundColor: colors.surface + '80',
        borderRadius: RADII.medium,
        padding: 16,
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: RADII.medium,
        overflow: 'hidden',
    },
    rejectButton: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.error + '40',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 8,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 8,
        overflow: 'hidden', // Re-added overflow: 'hidden'
    },
    rejectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.background,
    },
    loadingSpinner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.error + '40',
        borderTopColor: colors.error,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalView: {
        margin: 20,
        backgroundColor: colors.surface,
        borderRadius: RADII.large,
        padding: 24,
        alignItems: 'center',
        ...SHADOWS.large,
        width: '90%',
        maxHeight: '80%',
    },
});

export default PendingEventItem;