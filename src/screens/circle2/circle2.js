import { ActivityIndicator, FlatList, StyleSheet, Text, View, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import React from 'react'
import { COLORS, RADII, SHADOWS } from '../../constants/constants'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Ionicons } from '@expo/vector-icons'
import useAuth from '../../hooks/useAuth'
import CircleCard from './components/CircleCard'
import EmptyState from './components/EmptyState'



const circle2 = ({ navigation }) => {
    const [circles, setCircles] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()

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
            console.log('Fetched circles:', circlesData.length)
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
        console.log('Pressed circle:', circle.circleName)
        // Navigate to circle details or chat
        if (navigation) {
            navigation.navigate('Circle', { circleId: circle.id, circleName: circle.circleName })
        }
    }

    const handleCreateCircle = () => {
        if (navigation) {
            navigation.navigate('CreationForm')
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading circles...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Circles</Text>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateCircle}>
                    <Ionicons name="add" size={24} color={COLORS.light} />
                </TouchableOpacity>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
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
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    )
}

export default circle2

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.dark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: COLORS.light,
        marginTop: 10,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glass,
    },
    headerTitle: {
        color: COLORS.light,
        fontSize: 24,
        fontWeight: 'bold',
    },
    createButton: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: RADII.circle,
        ...SHADOWS.medium,
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
        color: COLORS.error,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: RADII.rounded,
    },
    retryButtonText: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '600',
    },
})