import { ActivityIndicator, FlatList, StyleSheet, Text, View, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import React from 'react'
import { RADII } from '../../constants/constants'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Ionicons } from '@expo/vector-icons'
import useAuth from '../../hooks/useAuth'
import CircleCard from './components/CircleCard'
import EmptyState from './components/EmptyState'
import { useTheme } from '../../context/ThemeContext'
import StandardHeader from '../../components/StandardHeader'



const HomeScreen = ({ navigation }) => {
    const [circles, setCircles] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()
    const { colors } = useTheme()
    const fetchCircles = async () => {
        try {
            setError(null)
            const circlesRef = collection(db, 'circles')
            const q = query(circlesRef, orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(q)
            const circlesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setCircles(circlesData)
        } catch (err) {
            console.error('Error fetching circles:', err)
            setError('Failed to load circles. Please try again.')
            Alert.alert('Error', 'Failed to load circles. Please check your connection and try again.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const onRefresh = () => {
        setRefreshing(true)
        fetchCircles()
    }

    useEffect(() => {
        fetchCircles()
    }, [])

    const handleCirclePress = (circle) => {
        // Navigate to circle details or chat
        if (navigation) {
            navigation.navigate('Circle', { circleId: circle.id, name: circle.circleName })
        }
    }

    const handleCreateCircle = () => {
        if (navigation) {
            navigation.navigate('CreationForm')
        }
    }

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading circles...</Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StandardHeader
                title="Circles"
                rightIcon="add"
                onRightPress={handleCreateCircle}
                navigation={navigation}
            />

            {error ? (
                <View style={[styles.errorContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="alert-circle-outline" size={60} color={colors.text} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchCircles}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : circles.length === 0 ? (
                <EmptyState onRefresh={onRefresh} />
            ) : (
                <FlatList
                    style={styles.list}
                    data={circles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CircleCard circle={item} onPress={handleCirclePress} />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },

    list: {
        flex: 1,
    },
    listContent: {
        padding: 15,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: RADII.rounded,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
})