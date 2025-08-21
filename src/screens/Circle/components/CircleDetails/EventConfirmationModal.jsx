import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { RADII, SHADOWS } from '../../../../constants/constants';
import usePendingEvents from '../../../../hooks/usePendingEvents';
import PendingEventItem from './PendingEventItem';

const { height } = Dimensions.get('window');

const EventConfirmationModal = ({ visible, onClose, circleId, circleName }) => {
    const { colors } = useTheme();
    const { pendingEvents, loading } = usePendingEvents(circleId);
    const [slideAnim] = useState(new Animated.Value(height));
    const [fadeAnim] = useState(new Animated.Value(0));
    const styles = getStyles(colors);

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const renderPendingEvent = ({ item }) => (
        <PendingEventItem
            event={item}
            circleId={circleId}
            onEventUpdated={() => {
                // Event will be automatically updated via the hook's real-time listener
            }}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View
                style={[styles.emptyGradient, { backgroundColor: colors.surface }]}
            >
                <View style={styles.emptyIconContainer}>
                    <Ionicons name="calendar-outline" size={64} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptyText}>
                    No events are waiting for confirmation. All your events have been processed.
                </Text>
                <View style={styles.emptyActions}>
                    <TouchableOpacity style={styles.emptyActionButton} onPress={handleClose}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={styles.emptyActionText}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent={true}
            onRequestClose={handleClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View
                        style={[styles.gradientBackground, { backgroundColor: colors.surface }]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <View style={styles.headerIcon}>
                                    <Ionicons name="calendar" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.headerText}>
                                    <Text style={styles.title}>Event Confirmations</Text>
                                    <Text style={styles.subtitle}>{circleName}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Stats Bar */}
                        <View style={styles.statsBar}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{pendingEvents.length}</Text>
                                <Text style={styles.statLabel}>Pending</Text>
                            </View>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                    <Text style={styles.loadingText}>Loading pending events...</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={pendingEvents}
                                    renderItem={renderPendingEvent}
                                    keyExtractor={(item) => item.id}
                                    ListEmptyComponent={renderEmptyState}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.listContainer}
                                />
                            )}
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 20,
        maxHeight: height * 0.9,
        borderRadius: 24,
        overflow: 'hidden',
        ...SHADOWS.large,
    },
    gradientBackground: {
        flex: 1,
        // Removed gradient, using solid background color
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    closeButton: {
        padding: 12,
        borderRadius: 24,
        backgroundColor: colors.surface,
    },
    statsBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.surface + '80',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 20,
    },
    content: {
        flex: 1,
    },
    listContainer: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyGradient: {
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
        // Removed gradient, using solid background color
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    emptyActions: {
        flexDirection: 'row',
        gap: 12,
    },
    emptyActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '20',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
    },
    emptyActionText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EventConfirmationModal;