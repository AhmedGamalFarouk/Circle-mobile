import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, RADII, SHADOWS } from '../../../constants/constants'
import { useTheme } from '../../../context/ThemeContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { getCircleImageUrl } from '../../../utils/imageUtils'
import useAuth from '../../../hooks/useAuth'
import useCircleMembers from '../../../hooks/useCircleMembers'
import useCircleRequests from '../../../hooks/useCircleRequests'


const CircleCard = ({ circle, onPress }) => {
    const { colors } = useTheme()
    const { user } = useAuth()
    const { isMember, isAdmin, getAdmins } = useCircleMembers(circle.id)
    const { createJoinRequest, hasPendingRequest } = useCircleRequests(circle.id)
    const [memberCount, setMemberCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isRequestingJoin, setIsRequestingJoin] = useState(false)

    const currentUserIsMember = isMember(user?.uid)

    // Fetch real member count
    useEffect(() => {
        const fetchMemberCount = async () => {
            if (!circle?.id) {
                setLoading(false)
                return
            }

            try {
                // Query users who have this circleId in their joinedCircles array
                const usersRef = collection(db, 'users')
                const q = query(usersRef, where('joinedCircles', 'array-contains', circle.id))
                const querySnapshot = await getDocs(q)
                setMemberCount(querySnapshot.size)
            } catch (error) {
                console.error('Error fetching member count:', error)
                setMemberCount(0)
            } finally {
                setLoading(false)
            }
        }

        fetchMemberCount()
    }, [circle?.id])

    // Get the real circle image
    const circleImageUrl = getCircleImageUrl(circle)

    const handleJoinRequest = async () => {
        if (isRequestingJoin) return

        setIsRequestingJoin(true)

        try {
            if (hasPendingRequest) {
                Alert.alert('Request Already Sent', 'You have already requested to join this circle.')
                return
            }

            const admins = getAdmins();
            if (admins.length === 0) {
                Alert.alert('Error', 'No admin found for this circle');
                return;
            }

            const adminId = admins[0].userId;
            const result = await createJoinRequest(
                circle.id,
                user.uid,
                adminId,
                circle.circleName,
                user.displayName || user.email || 'Unknown User'
            )

            if (result.success) {
                Alert.alert(
                    'Request Sent',
                    'Your join request has been sent to the circle admin. You will be notified when it is reviewed.',
                    [{ text: 'OK' }]
                )
            } else {
                Alert.alert('Error', result.error || 'Failed to send join request')
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send join request')
        } finally {
            setIsRequestingJoin(false)
        }
    }

    return (
        <View style={[styles.circleCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => currentUserIsMember && onPress(circle)}>
                <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: circleImageUrl }}
                        style={styles.circleImage}
                        placeholder={require('../../../../assets/circle.gif')}
                        contentFit="cover"
                        transition={200}
                    />
                    <View style={styles.circleInfo}>
                        <Text style={[styles.circleName, { color: colors.text }]} numberOfLines={1}>
                            {circle.circleName || 'Unnamed Circle'}
                        </Text>
                        <Text style={[styles.circleDescription, { color: colors.text }]} numberOfLines={2}>
                            {circle.description || 'No description available'}
                        </Text>
                        <View style={styles.circleMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="people" size={14} style={{ color: colors.text }} />
                                <Text style={[styles.metaText, { color: colors.text }]}>
                                    {loading ? '...' : `${memberCount} member${memberCount !== 1 ? 's' : ''}`}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="time" size={14} style={{ color: colors.text }} />
                                <Text style={[styles.metaText, { color: colors.text }]}>
                                    {circle.circleType === 'flash' ? 'Flash' : 'Permanent'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {circle.interests && circle.interests.length > 0 && (
                    <View style={styles.interestsContainer}>
                        {circle.interests.slice(0, 3).map((interest, index) => (
                            <View key={index} style={styles.interestTag}>
                                <Text style={[styles.interestText, { color: colors.text }]}>
                                    {typeof interest === 'string' ? interest : interest.label || interest.value || 'Interest'}
                                </Text>
                            </View>
                        ))}
                        {circle.interests.length > 3 && (
                            <View style={styles.interestTag}>
                                <Text style={[styles.interestText, { color: colors.text }]}>+{circle.interests.length - 3}</Text>
                            </View>
                        )}
                    </View>
                )}
            </TouchableOpacity>
            {!currentUserIsMember && (
                <TouchableOpacity
                    style={[styles.joinButton, { backgroundColor: colors.primary, opacity: isRequestingJoin || hasPendingRequest ? 0.6 : 1 }]}
                    onPress={handleJoinRequest}
                    disabled={isRequestingJoin || hasPendingRequest}
                >
                    <Text style={styles.joinButtonText}>
                        {hasPendingRequest ? 'Request Sent' : (isRequestingJoin ? 'Sending...' : 'Request to Join')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default CircleCard

const styles = StyleSheet.create({
    circleCard: {
        borderRadius: RADII.rounded,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.glass,
        ...SHADOWS.medium,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    circleImage: {
        width: 60,
        height: 60,
        borderRadius: RADII.circle,
        marginRight: 15,
    },
    circleInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    circleName: {
        color: COLORS.light,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    circleDescription: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    circleMeta: {
        flexDirection: 'row',
        gap: 15,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metaText: {
        color: COLORS.text,
        fontSize: 12,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: RADII.small,
    },
    interestText: {
        color: COLORS.light,
        fontSize: 12,
        fontWeight: '500',
    },
    joinButton: {
        marginTop: 10,
        paddingVertical: 10,
        borderRadius: RADII.small,
        alignItems: 'center',
    },
    joinButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
})