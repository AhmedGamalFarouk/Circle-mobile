import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useAuth from '../hooks/useAuth';
import useCircleMembers from '../hooks/useCircleMembers';
import { circleMembersService } from '../firebase/circleMembersService';
import { RADII } from '../constants/constants';
import { getUserAvatarUrl } from '../utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import MemberContextMenu from './MemberContextMenu';

const CircleMembersModal = ({ visible, onClose, circleId, navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const { members, loading, memberCount, owner, isOwner: currentUserIsOwner, isAdmin: currentUserIsAdmin } = useCircleMembers(circleId);
    const [actionLoading, setActionLoading] = useState(null);
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        member: null,
        position: null
    });
    const styles = getStyles(colors);

    const currentUserPermissions = {
        currentUserId: user?.uid,
        isOwner: currentUserIsOwner(user?.uid),
        isAdmin: currentUserIsAdmin(user?.uid),
        canManageMembers: currentUserIsOwner(user?.uid) || currentUserIsAdmin(user?.uid)
    };

    const showMemberContextMenu = (member, event) => {
        // Get touch position for menu placement
        const { pageX, pageY } = event.nativeEvent;

        setContextMenu({
            visible: true,
            member,
            position: { x: pageX, y: pageY }
        });
    };

    const closeMemberContextMenu = () => {
        setContextMenu({
            visible: false,
            member: null,
            position: null
        });
    };

    const handleOpenProfile = (member) => {
        if (navigation) {
            onClose();
            navigation.navigate('Profile', { userId: member.userId });
        }
    };

    const handleMakeAdmin = async (member) => {
        Alert.alert(
            'Make Admin',
            `Are you sure you want to make ${member.userName || 'this user'} an admin?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Make Admin',
                    onPress: async () => {
                        setActionLoading(member.userId);
                        try {
                            const result = await circleMembersService.makeAdmin(circleId, member.userId, user.uid);
                            if (result.success) {
                                Alert.alert('Success', `${member.userName || 'User'} is now an admin.`);
                            } else {
                                Alert.alert('Error', result.error);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to make user admin. Please try again.');
                        } finally {
                            setActionLoading(null);
                        }
                    }
                }
            ]
        );
    };

    const handleRemoveAdmin = async (member) => {
        Alert.alert(
            'Remove Admin Status',
            `Are you sure you want to remove admin status from ${member.userName || 'this user'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove Admin',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(member.userId);
                        try {
                            const result = await circleMembersService.removeAdmin(circleId, member.userId, user.uid);
                            if (result.success) {
                                Alert.alert('Success', `${member.userName || 'User'} is no longer an admin.`);
                            } else {
                                Alert.alert('Error', result.error);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove admin status. Please try again.');
                        } finally {
                            setActionLoading(null);
                        }
                    }
                }
            ]
        );
    };

    const handleRemoveMember = async (member) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${member.userName || 'this user'} from the circle?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(member.userId);
                        try {
                            const result = await circleMembersService.removeMemberByAdmin(circleId, member.userId, user.uid);
                            if (result.success) {
                                if (result.circleDeleted) {
                                    Alert.alert(
                                        'Circle Deleted',
                                        `${member.userName || 'User'} was the last member, so the circle has been deleted.`,
                                        [{ 
                                            text: 'OK', 
                                            onPress: () => {
                                                onClose();
                                                // Navigate back to home since circle no longer exists
                                                navigation?.reset?.({
                                                    index: 0,
                                                    routes: [{ name: 'Home' }],
                                                });
                                            }
                                        }]
                                    );
                                } else {
                                    Alert.alert('Success', `${member.userName || 'User'} has been removed from the circle.`);
                                }
                            } else {
                                Alert.alert('Error', result.error);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove member. Please try again.');
                        } finally {
                            setActionLoading(null);
                        }
                    }
                }
            ]
        );
    };

    const renderMember = ({ item }) => {
        const isCurrentUser = item.userId === user?.uid;
        const hasActions = !isCurrentUser && (
            currentUserPermissions.canManageMembers ||
            (navigation && !isCurrentUser) // Can view profile
        );

        // Debug: Log member data to see what's available
        if (__DEV__) {
            console.log('Member data:', {
                userId: item.userId,
                userName: item.userName,
                userAvatar: item.userAvatar,
                photoURL: item.photoURL,
                avatar: item.avatar
            });
        }

        return (
            <TouchableOpacity
                style={styles.memberItem}
                onPress={(event) => {
                    if (hasActions) {
                        showMemberContextMenu(item, event);
                    }
                }}
                activeOpacity={hasActions ? 0.7 : 1}
            >
                <View style={styles.memberContent}>
                    <Image
                        source={{ uri: getUserAvatarUrl(item, 50) }}
                        style={styles.memberAvatar}
                        onError={(error) => {
                            if (__DEV__) {
                                console.log('Avatar load error for user:', item.userName, error);
                            }
                        }}
                        onLoad={() => {
                            if (__DEV__) {
                                console.log('Avatar loaded successfully for user:', item.userName);
                            }
                        }}
                    />
                    <View style={styles.memberInfo}>
                        <View style={styles.memberNameContainer}>
                            <Text style={styles.memberName}>
                                {item.userName || item.username || 'Unknown User'}
                                {isCurrentUser && <Text style={styles.youText}> (You)</Text>}
                            </Text>
                            <View style={styles.badges}>
                                {item.isOwner && (
                                    <View style={[styles.badge, styles.ownerBadge]}>
                                        <Ionicons name="ribbon-outline" size={12} color={colors.background} />
                                        <Text style={styles.badgeText}>Owner</Text>
                                    </View>
                                )}
                                {item.isAdmin && !item.isOwner && (
                                    <View style={[styles.badge, styles.adminBadge]}>
                                        <Ionicons name="shield" size={12} color={colors.background} />
                                        <Text style={styles.badgeText}>Admin</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        {item.userEmail && (
                            <Text style={styles.memberEmail}>{item.userEmail}</Text>
                        )}
                    </View>
                    {actionLoading === item.userId && (
                        <ActivityIndicator size="small" color={colors.primary} />
                    )}
                    {hasActions && actionLoading !== item.userId && (
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Sort members: Owner first, then admins, then regular members
    const sortedMembers = [...members].sort((a, b) => {
        if (a.isOwner) return -1;
        if (b.isOwner) return 1;
        if (a.isAdmin && !b.isAdmin) return -1;
        if (b.isAdmin && !a.isAdmin) return 1;
        return (a.userName || '').localeCompare(b.userName || '');
    });

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Circle Members</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contentContainer}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={styles.loadingText}>Loading members...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={sortedMembers}
                                renderItem={renderMember}
                                keyExtractor={(item) => item.userId}
                                style={styles.membersList}
                                contentContainerStyle={styles.membersListContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No members found</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.memberCount}>
                            {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </Text>
                        {currentUserPermissions.canManageMembers && (
                            <Text style={styles.adminHint}>
                                Tap members to manage them
                            </Text>
                        )}
                    </View>
                </View>

                <MemberContextMenu
                    visible={contextMenu.visible}
                    onClose={closeMemberContextMenu}
                    member={contextMenu.member}
                    position={contextMenu.position}
                    currentUserPermissions={currentUserPermissions}
                    onOpenProfile={handleOpenProfile}
                    onRemoveMember={handleRemoveMember}
                    onMakeAdmin={handleMakeAdmin}
                    onRemoveAdmin={handleRemoveAdmin}
                />
            </View>
        </Modal>
    );
}; const
    getStyles = (colors) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        modalContent: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
        },
        closeButton: {
            padding: 5,
        },
        contentContainer: {
            flex: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
        },
        loadingText: {
            color: colors.text,
            marginTop: 10,
        },
        membersList: {
            flex: 1,
        },
        membersListContent: {
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 10,
        },
        memberItem: {
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        memberContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        memberAvatar: {
            width: 50,
            height: 50,
            borderRadius: RADII.circle,
            backgroundColor: colors.surface,
        },
        memberInfo: {
            marginLeft: 15,
            flex: 1,
        },
        memberNameContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 2,
        },
        memberName: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
            flex: 1,
        },
        youText: {
            color: colors.textSecondary,
            fontWeight: '400',
        },
        badges: {
            flexDirection: 'row',
            gap: 6,
        },
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
            gap: 4,
        },
        ownerBadge: {
            backgroundColor: '#FFD700',
        },
        adminBadge: {
            backgroundColor: colors.primary,
        },
        badgeText: {
            color: colors.background,
            fontSize: 10,
            fontWeight: '600',
        },
        memberEmail: {
            color: colors.textSecondary,
            fontSize: 14,
            marginTop: 2,
        },
        emptyContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 60,
            paddingHorizontal: 40,
        },
        emptyText: {
            color: colors.textSecondary,
            fontSize: 16,
            textAlign: 'center',
        },
        footer: {
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            alignItems: 'center',
        },
        memberCount: {
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 4,
        },
        adminHint: {
            color: colors.textSecondary,
            fontSize: 12,
            fontStyle: 'italic',
        },
    });

export default CircleMembersModal;