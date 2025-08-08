import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useTheme } from '../../../context/ThemeContext';
import { RADII } from '../../../constants/constants';
import { Ionicons } from '@expo/vector-icons';

const MembersList = ({ visible, onClose, circleId, navigation }) => {
    const { colors } = useTheme();
    const [members, setMembers] = useState([]);
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

            const membersList = [];
            querySnapshot.forEach((doc) => {
                membersList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort members alphabetically by username
            membersList.sort((a, b) => {
                const nameA = (a.username || 'Unknown User').toLowerCase();
                const nameB = (b.username || 'Unknown User').toLowerCase();
                return nameA.localeCompare(nameB);
            });

            setMembers(membersList);
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
                source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                style={styles.memberAvatar}
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
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Circle Members</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

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
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No members found</Text>
                                </View>
                            }
                        />
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.memberCount}>
                            {members.length} member{members.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: RADII.medium,
        width: '90%',
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: colors.border,
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
        padding: 20,
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
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