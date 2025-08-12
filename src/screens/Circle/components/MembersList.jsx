import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useTheme } from '../../../context/ThemeContext';
import useAuth from '../../../hooks/useAuth';
import { RADII } from '../../../constants/constants';
import { getUserAvatarUrl } from '../../../utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';

const MembersList = ({ visible, onClose, circleId, navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [totalMembersCount, setTotalMembersCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const styles = getStyles(colors);

    useEffect(() => {
        if (visible && circleId) {
            fetchMembers();
        }
    }, [visible, circleId]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            // Query users who have this circleId in their joinedCircles array
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('joinedCircles', 'array-contains', circleId));
            const querySnapshot = await getDocs(q);

            const allMembers = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                allMembers.push({
                    id: doc.id,
                    ...userData,
                    profilePicture: getUserAvatarUrl(userData, 50)
                });
            });

            // Set total count (including current user)
            setTotalMembersCount(allMembers.length);

            // Filter out current user from display list
            const membersToDisplay = allMembers.filter(member => member.id !== user?.uid);

            // Sort members alphabetically by username
            membersToDisplay.sort((a, b) => {
                const nameA = (a.username || 'Unknown User').toLowerCase();
                const nameB = (b.username || 'Unknown User').toLowerCase();
                return nameA.localeCompare(nameB);
            });

            setMembers(membersToDisplay);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMember = ({ item }) => (
        <TouchableOpacity
            style={styles.memberItem}
            onPress={() => {
                onClose();
                if (navigation) {
                    navigation.navigate('Profile', { userId: item.id });
                }
            }}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.profilePicture }}
                style={styles.memberAvatar}
                onError={(error) => console.log('Member list avatar load error:', error)}
            />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.username || 'Unknown User'}</Text>
                {item.email && (
                    <Text style={styles.memberEmail}>{item.email}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

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
                                data={members}
                                renderItem={renderMember}
                                keyExtractor={(item) => item.id}
                                style={styles.membersList}
                                contentContainerStyle={styles.membersListContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>
                                            {totalMembersCount === 1 ? "You are the only member in this circle" : "No other members found"}
                                        </Text>
                                    </View>
                                }
                            />
                        )}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.memberCount}>
                            {totalMembersCount} member{totalMembersCount !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
    memberName: {
        color: colors.text,
        fontSize: 16,
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
    },
});

export default MembersList;