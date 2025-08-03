import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { COLORS, FONTS, RADII } from '../../../constants/constants';
import { Ionicons } from '@expo/vector-icons';

const MembersList = ({ visible, onClose, circleId }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

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
        <View style={styles.memberItem}>
            <Image
                source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                style={styles.memberAvatar}
            />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.username || 'Unknown User'}</Text>
                <Text style={styles.memberEmail}>{item.email}</Text>
            </View>
        </View>
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
                            <Ionicons name="close" size={24} color={COLORS.light} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
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

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.dark,
        borderRadius: RADII.medium,
        width: '90%',
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: COLORS.glass,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    title: {
        color: COLORS.light,
        fontSize: 20,
        fontFamily: FONTS.heading,
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
        color: COLORS.light,
        marginTop: 10,
        fontFamily: FONTS.body,
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
        borderBottomColor: COLORS.glass,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: RADII.circle,
        backgroundColor: COLORS.secondary,
    },
    memberInfo: {
        marginLeft: 15,
        flex: 1,
    },
    memberName: {
        color: COLORS.light,
        fontSize: 16,
        fontFamily: FONTS.body,
        fontWeight: '600',
    },
    memberEmail: {
        color: COLORS.text,
        fontSize: 14,
        fontFamily: FONTS.body,
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.body,
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.glass,
        alignItems: 'center',
    },
    memberCount: {
        color: COLORS.text,
        fontSize: 14,
        fontFamily: FONTS.body,
    },
});

export default MembersList;