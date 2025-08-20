import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLORS, RADII, FONTS } from '../constants/constants';

const MessageInfoModal = ({ visible, onClose, message, circleId }) => {
    const [circleMembers, setCircleMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!visible || !circleId) {
            return;
        }

        const membersRef = collection(db, 'circles', circleId, 'members');
        const unsubscribe = onSnapshot(membersRef, (snapshot) => {
            const members = [];
            snapshot.forEach((doc) => {
                members.push({ id: doc.id, ...doc.data() });
            });
            setCircleMembers(members);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [visible, circleId]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Unknown time';

        const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const isToday = messageDate.toDateString() === now.toDateString();
        const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === messageDate.toDateString();

        if (isToday) {
            return `Today at ${messageDate.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}`;
        } else if (isYesterday) {
            return `Yesterday at ${messageDate.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}`;
        } else {
            return messageDate.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    };

    const getMessagePreview = () => {
        if (!message) return '';

        if (message.text) {
            return message.text;
        } else if (message.messageType === 'image') {
            return 'Photo';
        } else if (message.messageType === 'video') {
            return 'Video';
        } else if (message.messageType === 'audio' || message.messageType === 'voice') {
            return 'Voice message';
        }
        return 'Message';
    };

    // Get actual seenBy data from the message
    const getSeenByMembers = () => {
        if (!message?.seenBy || message.seenBy.length === 0) {
            return [];
        }
        
        // Return the seenBy array with user information
        return message.seenBy.map(seenEntry => ({
            ...seenEntry,
            // Find matching circle member for avatar if available
            ...circleMembers.find(member => member.userId === seenEntry.userId)
        }));
    };

    const formatSeenTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        const seenDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const isToday = seenDate.toDateString() === now.toDateString();
        const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === seenDate.toDateString();
        
        if (isToday) {
            return `Today at ${seenDate.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}`;
        } else if (isYesterday) {
            return `Yesterday at ${seenDate.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}`;
        } else {
            return seenDate.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    };

    if (!message) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Message Info</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Debug info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Debug Info</Text>
                            <Text style={styles.timestampText}>
                                Message ID: {message?.id || 'No ID'}
                            </Text>
                            <Text style={styles.timestampText}>
                                Circle ID: {circleId || 'No Circle ID'}
                            </Text>
                            <Text style={styles.timestampText}>
                                User: {message?.user?.userName || 'No User'}
                            </Text>
                        </View>

                        {/* Message Preview */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Message</Text>
                            <View style={styles.messagePreview}>
                                <View style={styles.senderInfo}>
                                    {message.user?.imageurl && (
                                        <Image
                                            source={{ uri: message.user.imageurl }}
                                            style={styles.senderAvatar}
                                        />
                                    )}
                                    <Text style={styles.senderName}>{message.user?.userName || 'Unknown User'}</Text>
                                </View>
                                <Text style={styles.messageText}>{getMessagePreview()}</Text>
                                {message.editedAt && (
                                    <Text style={styles.editedText}>Edited</Text>
                                )}
                            </View>
                        </View>

                        {/* Timestamp */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sent</Text>
                            <Text style={styles.timestampText}>{formatTimestamp(message.timeStamp)}</Text>
                        </View>

                        {/* Seen By Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Seen by</Text>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                    <Text style={styles.loadingText}>Loading...</Text>
                                </View>
                            ) : (
                                <View style={styles.seenByContainer}>
                                    {getSeenByMembers().length === 0 ? (
                                        <Text style={styles.noSeenText}>No one has seen this message yet</Text>
                                    ) : (
                                        getSeenByMembers().map((member) => (
                                            <View key={member.id} style={styles.memberItem}>
                                                {member.userAvatar ? (
                                                    <Image
                                                        source={{ uri: member.userAvatar }}
                                                        style={styles.memberAvatar}
                                                    />
                                                ) : (
                                                    <View style={styles.defaultAvatar}>
                                                        <Text style={styles.avatarText}>
                                                            {member.userName?.charAt(0)?.toUpperCase() || '?'}
                                                        </Text>
                                                    </View>
                                                )}
                                                <View style={styles.memberInfo}>
                                                    <Text style={styles.memberName}>{member.userName}</Text>
                                                    {member.seenAt && (
                                                        <Text style={styles.seenTimestamp}>
                                                            {formatSeenTimestamp(member.seenAt)}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Reactions (if any) */}
                        {message.reactions && message.reactions.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Reactions</Text>
                                <View style={styles.reactionsContainer}>
                                    {message.reactions.map((reaction, index) => (
                                        <View key={index} style={styles.reactionItem}>
                                            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                                            <Text style={styles.reactionUser}>{reaction.userName}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.dark,
        borderRadius: RADII.large,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.primary,
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
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.light,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messagePreview: {
        backgroundColor: COLORS.darker,
        borderRadius: RADII.medium,
        padding: 12,
    },
    senderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    senderAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 8,
    },
    senderName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    messageText: {
        fontSize: 16,
        color: COLORS.light,
        lineHeight: 22,
    },
    editedText: {
        fontSize: 12,
        color: COLORS.text,
        fontStyle: 'italic',
        marginTop: 4,
    },
    timestampText: {
        fontSize: 16,
        color: COLORS.light,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 8,
    },
    seenByContainer: {
        gap: 12,
    },
    noSeenText: {
        fontSize: 14,
        color: COLORS.text,
        fontStyle: 'italic',
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    defaultAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.light,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        color: COLORS.light,
    },
    seenTimestamp: {
        fontSize: 12,
        color: COLORS.text,
        marginTop: 2,
    },
    reactionsContainer: {
        gap: 8,
    },
    reactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.darker,
        borderRadius: RADII.small,
        padding: 8,
    },
    reactionEmoji: {
        fontSize: 18,
        marginRight: 8,
    },
    reactionUser: {
        fontSize: 14,
        color: COLORS.light,
    },
});

export default MessageInfoModal;