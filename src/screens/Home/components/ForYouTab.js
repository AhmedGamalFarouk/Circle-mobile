import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import useAuth from '../../../hooks/useAuth';
import CircleCard from './CircleCard';
import EmptyState from './EmptyState';
import { useTheme } from '../../../context/ThemeContext';

const ForYouTab = ({ navigation, onCirclePress }) => {
    const [forYouCircles, setForYouCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const { colors } = useTheme();

    const fetchForYouCircles = async () => {
        try {
            // Get all public circles
            // Get all circles (assuming they are public by default if isPublic field doesn't exist)
            const circlesRef = collection(db, 'circles');
            const q = query(circlesRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            let allPublicCircles = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter to only show public circles (default to public if field doesn't exist)
            allPublicCircles = allPublicCircles.filter(circle =>
                circle.isPublic !== false
            );

            // Get user's interests and joined circles
            let userInterests = [];
            let joinedCircleIds = [];

            if (user?.uid) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.data();
                userInterests = userData?.interests || [];
                joinedCircleIds = userData?.joinedCircles || [];
            }

            // Filter out circles the user has already joined
            allPublicCircles = allPublicCircles.filter(circle =>
                !joinedCircleIds.includes(circle.id)
            );

            // Sort circles by interest alignment
            const sortedCircles = allPublicCircles.sort((a, b) => {
                const aInterests = a.interests || [];
                const bInterests = b.interests || [];

                // Calculate interest match score
                const aMatchScore = aInterests.filter(interest =>
                    userInterests.includes(interest)
                ).length;
                const bMatchScore = bInterests.filter(interest =>
                    userInterests.includes(interest)
                ).length;

                // If match scores are equal, sort by creation date (newest first)
                if (aMatchScore === bMatchScore) {
                    const aTime = a.createdAt?.toDate() || new Date(0);
                    const bTime = b.createdAt?.toDate() || new Date(0);
                    return bTime - aTime;
                }

                // Higher match score comes first
                return bMatchScore - aMatchScore;
            });

            setForYouCircles(sortedCircles);
        } catch (error) {
            console.error('Error fetching for you circles:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchForYouCircles();
    };

    useEffect(() => {
        fetchForYouCircles();
    }, [user?.uid]);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.loadingText, { color: colors.text }]}>Discovering circles for you...</Text>
            </View>
        );
    }

    if (forYouCircles.length === 0) {
        return (
            <EmptyState
                onRefresh={onRefresh}
                message="No public circles available"
                subMessage="Check back later for new circles to discover"
            />
        );
    }

    return (
        <FlatList
            style={styles.list}
            data={forYouCircles}
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

export default ForYouTab;