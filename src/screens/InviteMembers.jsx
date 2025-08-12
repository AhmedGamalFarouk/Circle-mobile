import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { RADII, SHADOWS } from '../constants/constants';
import useAuth from '../hooks/useAuth';
import useCircleRequests from '../hooks/useCircleRequests';
import useCircleMembers from '../hooks/useCircleMembers';
import { usersService } from '../firebase/usersService';
import { getUserAvatarUrl } from '../utils/imageUtils';

const InviteMembers = ({ route, navigation }) => {
    const { circleId, ownerId } = route.params;
    const { colors } = useTheme();
    const { user } = useAuth();
    const { createInvitation } = useCircleRequests();
    const { members } = useCircleMembers(circleId);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [invitingUsers, setInvitingUsers] = useState(new Set());
    const styles = getStyles(colors);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            try {
                // Get member IDs to exclude from search
                const memberIds = members.map(member => member.userId);
                memberIds.push(user?.uid); // Also exclude current user

                const result = await usersService.searchUsersByUsername(searchTerm, memberIds);
                if (result.success) {
                    setSearchResults(result.users);
                }
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, members, user?.uid]);

    const handleInviteUser = async (targetUser) => {
        if (!user || invitingUsers.has(targetUser.id)) return;

        setInvitingUsers(prev => new Set([...prev, targetUser.id]));

        try {
            const result = await createInvitation(
                circleId,
                targetUser.id,
                user.uid,
                route.params.circleName || 'Circle',
                user.displayName || user.username || 'Someone',
                ownerId || user.uid
            );

            if (result.success) {
                Alert.alert(
                    'Invitation Sent',
                    `Invitation sent to ${targetUser.username}!`,
                    [{ text: 'OK' }]
                );
                // Remove user from search results after successful invitation
                setSearchResults(prev => prev.filter(u => u.id !== targetUser.id));
            } else {
                Alert.alert(
                    'Failed to Send Invitation',
                    result.error || 'Something went wrong. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            Alert.alert(
                'Error',
                'An error occurred while sending the invitation. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setInvitingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(targetUser.id);
                return newSet;
            });
        }
    };

    const renderUserItem = ({ item }) => {
        const isInviting = invitingUsers.has(item.id);

        return (
            <View style={styles.userItem}>
                <Image
                    source={{ uri: getUserAvatarUrl(item, 50) }}
                    style={styles.userAvatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.username}>{item.username}</Text>
                    {item.email && (
                        <Text style={styles.userEmail}>{item.email}</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[
                        styles.inviteButton,
                        isInviting && styles.inviteButtonDisabled
                    ]}
                    onPress={() => handleInviteUser(item)}
                    disabled={isInviting}
                    activeOpacity={0.7}
                >
                    {isInviting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Ionicons name="person-add" size={16} color="white" />
                            <Text style={styles.inviteButtonText}>Invite</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Invite Members</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users by username..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchTerm('')}
                            style={styles.clearButton}
                        >
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.resultsContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Searching users...</Text>
                    </View>
                ) : searchTerm.length < 2 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search" size={48} color={colors.textSecondary} />
                        <Text style={styles.emptyTitle}>Search for Users</Text>
                        <Text style={styles.emptySubtitle}>
                            Type at least 2 characters to search for users by username
                        </Text>
                    </View>
                ) : searchResults.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="person-outline" size={48} color={colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No Users Found</Text>
                        <Text style={styles.emptySubtitle}>
                            No users found matching "{searchTerm}"
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={searchResults}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id}
                        style={styles.resultsList}
                        contentContainerStyle={styles.resultsListContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 32,
    },
    searchContainer: {
        padding: 20,
        paddingBottom: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: RADII.rounded,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        color: colors.textSecondary,
        marginTop: 12,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
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
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    resultsList: {
        flex: 1,
    },
    resultsListContent: {
        paddingBottom: 20,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: RADII.medium,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.card,
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: RADII.circle,
        backgroundColor: colors.surface,
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
    },
    username: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    userEmail: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    inviteButton: {
        backgroundColor: colors.primary,
        borderRadius: RADII.small,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 80,
        justifyContent: 'center',
    },
    inviteButtonDisabled: {
        opacity: 0.6,
    },
    inviteButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
});

export default InviteMembers;