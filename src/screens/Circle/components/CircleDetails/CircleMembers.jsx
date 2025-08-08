import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADII, SHADOWS } from '../../../../constants/constants';
import { getUserAvatarUrl } from '../../../../utils/imageUtils';
import MembersList from '../MembersList';

const CircleMembers = ({ members = [], circleId }) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [showMembersList, setShowMembersList] = useState(false);
    const styles = getStyles(colors);

    const displayMembers = members.slice(0, 8); // Show first 8 members
    const remainingCount = Math.max(0, members.length - 8);

    const renderMember = ({ item, showName = true }) => (
        <TouchableOpacity
            style={[styles.memberItem, !showName && styles.memberItemCompact]}
            onPress={() => navigation.navigate('Profile', { userId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: item.avatar }}
                    style={styles.avatar}
                    onError={(error) => console.log('Member avatar load error:', error)}
                />
                {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            {showName && (
                <Text style={styles.memberName} numberOfLines={1}>
                    {item.name || 'Unknown User'}
                </Text>
            )}
        </TouchableOpacity>
    );



    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setShowMembersList(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>Members ({members?.length || 0})</Text>
                <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.membersContainer}
                onPress={() => setShowMembersList(true)}
                activeOpacity={0.7}
            >
                <FlatList
                    data={displayMembers}
                    renderItem={({ item }) => renderMember({ item })}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    scrollEnabled={false}
                />

                {remainingCount > 0 && (
                    <View style={styles.moreButton}>
                        <Text style={styles.moreButtonText}>+{remainingCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <MembersList
                visible={showMembersList}
                onClose={() => setShowMembersList(false)}
                circleId={circleId}
                navigation={navigation}
            />
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewAllText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    membersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    list: {
        paddingRight: 10,
    },
    memberItem: {
        alignItems: 'center',
        marginRight: 16,
        width: 70,
    },
    memberItemCompact: {
        width: 60,
        marginRight: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: RADII.circle,
        borderWidth: 3,
        borderColor: colors.primary,
        ...SHADOWS.card,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: RADII.circle,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: colors.background,
    },
    memberName: {
        color: colors.text,
        marginTop: 8,
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    moreButton: {
        width: 60,
        height: 60,
        borderRadius: RADII.circle,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    moreButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default CircleMembers;