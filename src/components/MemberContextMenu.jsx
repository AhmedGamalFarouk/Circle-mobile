import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { RADII, SHADOWS } from '../constants/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MemberContextMenu = ({
    visible,
    onClose,
    member,
    position,
    currentUserPermissions,
    onOpenProfile,
    onRemoveMember,
    onMakeAdmin,
    onRemoveAdmin
}) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    if (!member) return null;

    const menuItems = [];

    // Always show "Open Profile" option for all members (except current user)
    if (member.userId !== currentUserPermissions.currentUserId) {
        menuItems.push({
            id: 'profile',
            title: 'Open Profile',
            icon: 'person-outline',
            onPress: () => {
                onClose();
                onOpenProfile(member);
            },
            style: 'default'
        });
    }

    // Admin management options
    if (currentUserPermissions.canManageMembers && member.userId !== currentUserPermissions.currentUserId) {
        // Owner can manage all non-owner members
        if (currentUserPermissions.isOwner && !member.isOwner) {
            if (member.isAdmin) {
                menuItems.push({
                    id: 'removeAdmin',
                    title: 'Remove Admin Status',
                    icon: 'shield-outline',
                    onPress: () => {
                        onClose();
                        onRemoveAdmin(member);
                    },
                    style: 'warning'
                });
            } else {
                menuItems.push({
                    id: 'makeAdmin',
                    title: 'Make Admin',
                    icon: 'shield',
                    onPress: () => {
                        onClose();
                        onMakeAdmin(member);
                    },
                    style: 'default'
                });
            }

            menuItems.push({
                id: 'remove',
                title: 'Remove from Circle',
                icon: 'person-remove-outline',
                onPress: () => {
                    onClose();
                    onRemoveMember(member);
                },
                style: 'destructive'
            });
        }
        // Admins can only remove regular members
        else if (currentUserPermissions.isAdmin && !member.isAdmin && !member.isOwner) {
            menuItems.push({
                id: 'remove',
                title: 'Remove from Circle',
                icon: 'person-remove-outline',
                onPress: () => {
                    onClose();
                    onRemoveMember(member);
                },
                style: 'destructive'
            });
        }
    }

    if (menuItems.length === 0) {
        return null;
    }

    // Calculate menu position
    const menuWidth = 200;
    const menuHeight = menuItems.length * 50 + 20; // 50px per item + padding

    let menuX = position?.x || screenWidth / 2 - menuWidth / 2;
    let menuY = position?.y || screenHeight / 2 - menuHeight / 2;

    // Ensure menu stays within screen bounds
    if (menuX + menuWidth > screenWidth - 20) {
        menuX = screenWidth - menuWidth - 20;
    }
    if (menuX < 20) {
        menuX = 20;
    }
    if (menuY + menuHeight > screenHeight - 100) {
        menuY = screenHeight - menuHeight - 100;
    }
    if (menuY < 100) {
        menuY = 100;
    }

    const renderMenuItem = (item) => {
        const itemStyles = [
            styles.menuItem,
            item.style === 'destructive' && styles.destructiveItem,
            item.style === 'warning' && styles.warningItem
        ];

        const textStyles = [
            styles.menuItemText,
            item.style === 'destructive' && styles.destructiveText,
            item.style === 'warning' && styles.warningText
        ];

        const iconColor = item.style === 'destructive' ? colors.error :
            item.style === 'warning' ? '#f59e0b' : colors.text;

        return (
            <TouchableOpacity
                key={item.id}
                style={itemStyles}
                onPress={item.onPress}
                activeOpacity={0.7}
            >
                <Ionicons name={item.icon} size={20} color={iconColor} />
                <Text style={textStyles}>{item.title}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View
                            style={[
                                styles.menu,
                                {
                                    left: menuX,
                                    top: menuY,
                                    width: menuWidth
                                }
                            ]}
                        >
                            <View style={styles.menuHeader}>
                                <Text style={styles.menuTitle} numberOfLines={1}>
                                    {member.userName || 'Member'}
                                </Text>
                                {member.isOwner && (
                                    <View style={styles.ownerBadge}>
                                        <Ionicons name="ribbon-outline" size={12} color={colors.background} />
                                        <Text style={styles.badgeText}>Owner</Text>
                                    </View>
                                )}
                                {member.isAdmin && !member.isOwner && (
                                    <View style={styles.adminBadge}>
                                        <Ionicons name="shield" size={12} color={colors.background} />
                                        <Text style={styles.badgeText}>Admin</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.separator} />
                            <View style={styles.menuItems}>
                                {menuItems.map(renderMenuItem)}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menu: {
        position: 'absolute',
        backgroundColor: colors.card,
        borderRadius: RADII.medium,
        ...SHADOWS.card,
        overflow: 'hidden',
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
        marginRight: 8,
    },
    ownerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
    },
    badgeText: {
        color: colors.background,
        fontSize: 10,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
    },
    menuItems: {
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    menuItemText: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
    },
    destructiveItem: {
        backgroundColor: 'transparent',
    },
    destructiveText: {
        color: colors.error,
    },
    warningItem: {
        backgroundColor: 'transparent',
    },
    warningText: {
        color: '#f59e0b',
    },
});

export default MemberContextMenu;