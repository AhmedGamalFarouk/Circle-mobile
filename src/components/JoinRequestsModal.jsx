import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal,
    SafeAreaView,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS } from '../constants/constants';
import useCircleRequests from '../hooks/useCircleRequests';


const JoinRequestItem = ({ request, onApprove, onDeny, onViewProfile, processing }) => {
    return (
        <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        {request.avatarPhoto ? (
                            <Image source={{ uri: request.avatarPhoto }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person" size={24} color={COLORS.text} />
                        )}
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{request.username || 'Unknown User'}</Text>
                        <Text style={styles.userEmail}>{request.email || ''}</Text>
                        <Text style={styles.requestDate}>
                            {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => onViewProfile(request.userId)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="person-circle" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {request.message && (
                <Text style={styles.requestMessage}>{request.message}</Text>
            )}

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.denyButton]}
                    onPress={() => onDeny(request)}
                    disabled={processing}
                    activeOpacity={0.7}
                >
                    {processing ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Ionicons name="close" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Deny</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => onApprove(request)}
                    disabled={processing}
                    activeOpacity={0.7}
                >
                    {processing ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Ionicons name="checkmark" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Approve</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const JoinRequestsModal = ({ visible, onClose, circleId, circleName, onViewProfile }) => {
    const {
        requests,
        loading,
        requestCount,
        approveRequest,
        denyRequest,
        approveAllRequests,
        denyAllRequests
    } = useCircleRequests(circleId);

    const [refreshing, setRefreshing] = useState(false);
    const [processingRequests, setProcessingRequests] = useState(new Set());

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleApproveRequest = async (request) => {
        setProcessingRequests(prev => new Set(prev).add(request.id));

        try {
            const result = await approveRequest(request.id);
            if (result.success) {
                Alert.alert('Success', 'Request approved successfully');
            } else {
                Alert.alert('Error', result.error || 'Failed to approve request');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to approve request');
        } finally {
            setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
            });
        }
    };

    const handleDenyRequest = async (request) => {
        setProcessingRequests(prev => new Set(prev).add(request.id));

        try {
            const result = await denyRequest(request.id);
            if (result.success) {
                Alert.alert('Success', 'Request denied');
            } else {
                Alert.alert('Error', result.error || 'Failed to deny request');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to deny request');
        } finally {
            setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
            });
        }
    };

    const handleApproveAll = () => {
        Alert.alert(
            'Approve All Requests',
            `Are you sure you want to approve all ${requestCount} pending requests?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve All',
                    onPress: async () => {
                        try {
                            const result = await approveAllRequests(circleId);
                            if (result.success) {
                                Alert.alert('Success', `Approved ${result.count} requests`);
                            } else {
                                Alert.alert('Error', result.error || 'Failed to approve all requests');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to approve all requests');
                        }
                    }
                }
            ]
        );
    };

    const handleDenyAll = () => {
        Alert.alert(
            'Deny All Requests',
            `Are you sure you want to deny all ${requestCount} pending requests?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Deny All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await denyAllRequests(circleId);
                            if (result.success) {
                                Alert.alert('Success', `Denied ${result.count} requests`);
                            } else {
                                Alert.alert('Error', result.error || 'Failed to deny all requests');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to deny all requests');
                        }
                    }
                }
            ]
        );
    };

    const renderRequestItem = ({ item }) => (
        <JoinRequestItem
            request={item}
            onApprove={handleApproveRequest}
            onDeny={handleDenyRequest}
            onViewProfile={onViewProfile}
            processing={processingRequests.has(item.id)}
        />
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Join Requests ({requestCount})
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading requests...</Text>
                    </View>
                ) : (
                    <>
                        {/* Bulk Actions */}
                        {requestCount > 0 && (
                            <View style={styles.bulkActions}>
                                <TouchableOpacity
                                    style={[styles.bulkButton, styles.denyAllButton]}
                                    onPress={handleDenyAll}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="close-circle" size={20} color="white" />
                                    <Text style={styles.bulkButtonText}>Deny All</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.bulkButton, styles.approveAllButton]}
                                    onPress={handleApproveAll}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                    <Text style={styles.bulkButtonText}>Approve All</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Requests List */}
                        <FlatList
                            data={requests}
                            renderItem={renderRequestItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={[COLORS.primary]}
                                    tintColor={COLORS.primary}
                                />
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="people" size={64} color={COLORS.text} />
                                    <Text style={styles.emptyTitle}>No Join Requests</Text>
                                    <Text style={styles.emptySubtitle}>
                                        When users request to join "{circleName}", they'll appear here.
                                    </Text>
                                </View>
                            }
                        />
                    </>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    closeButton: {
        padding: 8,
        borderRadius: RADII.small,
        backgroundColor: COLORS.darker,
    },
    headerTitle: {
        color: COLORS.light,
        fontSize: 18,
        fontWeight: '600',
    },
    headerSpacer: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.text,
        marginTop: 16,
        fontSize: 16,
    },
    bulkActions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    bulkButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: RADII.rounded,
        gap: 8,
    },
    approveAllButton: {
        backgroundColor: '#4CAF50',
    },
    denyAllButton: {
        backgroundColor: '#F44336',
    },
    bulkButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
        paddingTop: 0,
    },
    requestCard: {
        backgroundColor: COLORS.darker,
        borderRadius: RADII.rounded,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.card,
    },
    requestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.glass,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    userEmail: {
        color: COLORS.text,
        fontSize: 13,
        marginBottom: 2,
    },
    requestDate: {
        color: COLORS.text,
        fontSize: 12,
    },
    profileButton: {
        padding: 8,
        borderRadius: RADII.small,
        backgroundColor: COLORS.glass,
    },
    requestMessage: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: RADII.small,
        gap: 6,
        minHeight: 40,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    denyButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        color: COLORS.light,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        color: COLORS.text,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default JoinRequestsModal;