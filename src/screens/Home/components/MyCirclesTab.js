import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import useAuth from '../../../hooks/useAuth';
import CircleCard from './CircleCard';
import EmptyState from './EmptyState';
import { useTheme } from '../../../context/ThemeContext';
import useExpiredCircleCleanup from '../../../hooks/useExpiredCircleCleanup';

const MyCirclesTab = ({ navigation, onCirclePress }) => {
    const [myCircles, setMyCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const { colors } = useTheme();
    const { cleanupExpiredCircles } = useExpiredCircleCleanup();

    const fetchMyCircles = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            // Get user's joined circles from user document
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            const joinedCircleIds = userData?.joinedCircles || [];

            if (joinedCircleIds.length === 0) {
                setMyCircles([]);
                setLoading(false);
                setRefreshing(false);
                return;
            }

            // Fetch circle details for joined circles
            const circlePromises = joinedCircleIds.map(async (circleId) => {
                const circleDoc = await getDoc(doc(db, 'circles', circleId));
                if (circleDoc.exists()) {
                    return {
                        id: circleDoc.id,
                        ...circleDoc.data()
                    };
                }
                return null;
            });

            const circles = await Promise.all(circlePromises);
            const validCircles = circles.filter(circle => circle !== null);

            // Filter out expired flash circles
            const now = Timestamp.now();
            const activeCircles = validCircles.filter(circle => {
                // Keep all non-flash circles
                if (circle.circleType !== 'flash') {
                    return true;
                }
                // For flash circles, check if they haven't expired
                if (circle.expiresAt && circle.expiresAt.toDate() <= now.toDate()) {
                    console.log(`Filtering out expired flash circle: ${circle.circleName || 'Unknown'} (${circle.id})`);
                    return false;
                }
                return true;
            });

            // Sort by most recently joined or created
            activeCircles.sort((a, b) => {
                const aTime = a.createdAt?.toDate() || new Date(0);
                const bTime = b.createdAt?.toDate() || new Date(0);
                return bTime - aTime;
            });

            setMyCircles(activeCircles);
            
            // Trigger cleanup of expired circles in the background
            if (validCircles.length !== activeCircles.length) {
                cleanupExpiredCircles();
            }
        } catch (error) {
            console.error('Error fetching my circles:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyCircles();
    };

    useEffect(() => {
        fetchMyCircles();
    }, [user?.uid]);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.loadingText, { color: colors.text }]}>Loading your circles...</Text>
            </View>
        );
    }

    if (myCircles.length === 0) {
        return (
            <EmptyState
                onRefresh={onRefresh}
                message="You haven't joined any circles yet"
                subMessage="Explore the 'For you' tab to discover circles that match your interests"
            />
        );
    }

    return (
        <FlatList
            style={styles.list}
            data={myCircles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <CircleCard circle={item} onPress={onCirclePress} />
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
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default MyCirclesTab;