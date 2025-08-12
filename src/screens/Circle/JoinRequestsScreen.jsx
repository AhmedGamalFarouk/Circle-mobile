import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { RADII, SHADOWS } from '../../constants/constants';
import useCircleRequests from '../../hooks/useCircleRequests';
import useAuth from '../../hooks/useAuth';
import { circleMembersService } from '../../firebase/circleMembersService';
import JoinRequestCard from '../../components/JoinRequest/JoinRequestCard';

const JoinRequestsScreen = ({ route, navigation }) => {
    const { circleId, circleName } = route.params;
    const { colors } = useTheme();
    const { user } = useAuth();
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
    const styles = getStyles(colors);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: `Join Requests (${requestCount})`,
            headerStyle: {
                backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        });
    }, [navigation, colors, requestCount]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // The hook will automatically refresh the data
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleApproveRequest = async (request) => {
        setProcessingRequests(prev => new Set(prev).add(request.id));

        try {
            const result = await approveRequest(request.id);
            if (result.success) {
                // Here you would also add the user to the circle members
                // This would typically be handled by a cloud function or additional logic
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

    const handleViewProfile = (userId) => {
        navigation.navigate('Profile', { userId });
    };


    const renderRequestItem = ({ item }) => (
        <JoinRequestCard
            request={item}
            onApprove={() => handleApproveRequest(item)}
            onDeny={() => handleDenyRequest(item)}
        />
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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

            <FlatList
                data={requests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No Join Requests</Text>
                        <Text style={styles.emptySubtitle}>
                            When users request to join "{circleName}", they'll appear here.
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        color: colors.textSecondary,
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
        backgroundColor: colors.success,
    },
    denyAllButton: {
        backgroundColor: colors.error,
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
        backgroundColor: colors.card,
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
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    requestDate: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    profileButton: {
        padding: 8,
        borderRadius: RADII.small,
        backgroundColor: colors.surface,
    },
    requestMessage: {
        color: colors.textSecondary,
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
    },
    approveButton: {
        backgroundColor: colors.success,
    },
    denyButton: {
        backgroundColor: colors.error,
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
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default JoinRequestsScreen;