import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, RADII, SHADOWS } from '../../../constants/constants'
import { useTheme } from '../../../context/ThemeContext'


const CircleCard = ({ circle, onPress }) => {
    const { colors } = useTheme()
    return (
        <TouchableOpacity style={[styles.circleCard, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => onPress(circle)}>
            <View style={styles.cardHeader}>
                <Image
                    source={circle.photoUrl ? { uri: circle.photoUrl } : require('../../../../assets/circle.gif')}
                    style={styles.circleImage}
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
                            <Text style={[styles.metaText, { color: colors.text }]}>Public</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time" size={14} style={{ color: colors.text }} />
                            <Text style={styles.metaText}>
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

})