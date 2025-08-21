import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { useLocalization } from '../../../../hooks/useLocalization';
import { RADII, SHADOWS } from '../../../../constants/constants';
import useAuth from '../../../../hooks/useAuth';
import useCircleMembers from '../../../../hooks/useCircleMembers';
import useCircleRequests from '../../../../hooks/useCircleRequests';
import JoinRequestsModal from '../../../../components/JoinRequestsModal';
import { circleMembersService } from '../../../../firebase/circleMembersService';


const CircleOptions = ({ circleId, circle, navigation }) => {
    const { colors } = useTheme();
    const { currentLanguage } = useLanguage();
    const { t } = useLocalization();
    const { user } = useAuth();
    const { isAdmin } = useCircleMembers(circleId);
    const { requestCount } = useCircleRequests(circleId);

    const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
    const styles = getStyles(colors);

    const currentUserIsAdmin = isAdmin(user?.uid);

    const handleLeaveCircle = () => {
        // Validate user and circle data
        if (!user?.uid) {
            Alert.alert("Error", "User not authenticated. Please try again.");
            return;
        }

        if (!circleId) {
            Alert.alert("Error", "Circle not found. Please try again.");
            return;
        }

        Alert.alert(
            "Leave Circle",
            `Are you sure you want to leave "${circle?.circleName || circle?.name || 'this circle'}"? You won't be able to see messages or participate in polls.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Leave",
                    onPress: async () => {
                        try {
                            const result = await circleMembersService.removeMemberFromCircle(circleId, user.uid);

                            if (result.success) {
                                // Show different message if circle was deleted
                                if (result.circleDeleted) {
                                    Alert.alert(
                                        "Circle Deleted",
                                        "You were the last member, so the circle has been deleted.",
                                        [{
                                            text: "OK",
                                            onPress: () => navigation.reset({
                                                index: 0,
                                                routes: [{ name: 'Home' }],
                                            })
                                        }]
                                    );
                                } else {
                                    // Reset navigation stack and go to Home to prevent going back
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'Home' }],
                                    });
                                }
                            } else {
                                Alert.alert(
                                    "Error",
                                    result.error || "Failed to leave circle. Please try again.",
                                    [{ text: "OK" }]
                                );
                            }
                        } catch (error) {
                            console.error('Error leaving circle:', error);
                            Alert.alert(
                                "Error",
                                "An unexpected error occurred. Please try again.",
                                [{ text: "OK" }]
                            );
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleClearChat = () => {
        Alert.alert(
            "Clear Chat History",
            "This will clear all chat messages for you only. Other members will still see the messages. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    onPress: () => { /* Implement chat clearing logic here */ },
                    style: "destructive"
                }
            ]
        );
    };

    const handleEditCircle = () => {
        navigation.navigate('EditCircle', { circleId, circle });
    };


    const handleManageJoinRequests = () => {
        setShowJoinRequestsModal(true);
    };

    const handleViewProfile = (userId) => {
        setShowJoinRequestsModal(false);
        const profileTabName = currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profile';
        navigation.navigate(profileTabName, { userId });
    };



    // Base action options for all members
    const baseActionOptions = [
        {
            title: 'Clear Chat History',
            subtitle: 'Remove all messages for you only',
            onPress: handleClearChat,
            icon: 'trash',
            color: colors.textSecondary,
        },
        {
            title: 'Leave Circle',
            subtitle: 'You will no longer receive messages',
            onPress: handleLeaveCircle,
            icon: 'exit',
            color: '#FF3B30',
        },
    ];

    // Admin-only options
    const adminOptions = [
        {
            title: 'Edit Circle',
            subtitle: 'Change name, description, or image',
            onPress: handleEditCircle,
            icon: 'create',
            color: colors.text,
        },
        {
            title: 'Invite Members',
            subtitle: 'Search and invite users to join this circle',
            onPress: () => navigation.navigate('InviteMembers', {
                circleId,
                circleName: circle.name,
                ownerId: circle.createdBy
            }),
            icon: 'person-add',
            color: colors.primary,
        },
        {
            title: `Manage Join Requests${requestCount > 0 ? ` (${requestCount})` : ''}`,
            subtitle: requestCount > 0 ? `${requestCount} pending requests` : 'View and manage join requests',
            onPress: handleManageJoinRequests,
            icon: 'people',
            color: requestCount > 0 ? colors.warning : colors.text,
            badge: requestCount > 0 ? requestCount : null,
        },
    ];

    // Combine options based on user role
    const actionOptions = currentUserIsAdmin
        ? [...adminOptions, ...baseActionOptions]
        : baseActionOptions;



    const renderActionItem = (item, index) => (
        <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={item.onPress}
            activeOpacity={0.7}
        >
            <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={item.icon} size={20} color={item.color} style={styles.optionIcon} />
                    {item.badge && (
                        <View style={[styles.badge, { backgroundColor: item.color }]}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: item.color }]}>
                        {item.title}
                    </Text>
                    <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>
            </View>
            <Text style={[styles.chevron, { color: item.color }]}>›</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>


            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.optionsCard}>
                    {actionOptions.map(renderActionItem)}
                </View>
            </View>

            <JoinRequestsModal
                visible={showJoinRequestsModal}
                onClose={() => setShowJoinRequestsModal(false)}
                circleId={circleId}
                circleName={circle.name}
                onViewProfile={handleViewProfile}
            />
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 8,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    optionsCard: {
        backgroundColor: colors.card,
        borderRadius: RADII.rounded,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        position: 'relative',
        marginRight: 12,
        width: 24,
        alignItems: 'center',
    },
    optionIcon: {
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -8,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionSubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    chevron: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default CircleOptions;