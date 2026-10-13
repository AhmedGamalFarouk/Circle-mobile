import React, { useState, useEffect, useRef } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../../../firebase/config';
import CircleCard from './CircleCard';
import EmptyState from './EmptyState';
import { useTheme } from '../../../context/ThemeContext';

// joinedIds come from useJoinedCircleIds in HomeScreen (member docs, not users.joinedCircles).
const MyCirclesTab = ({ onCirclePress, joinedIds, joinedLoaded, joinedError, refreshJoined }) => {
    const [myCircles, setMyCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const { t } = useTranslation();
    const requestRef = useRef(0);

    useEffect(() => {
        if (!joinedLoaded) return;
        const request = ++requestRef.current;
        (async () => {
            // One missing or unreadable circle must not hide the others.
            const circles = await Promise.all(joinedIds.map(async (circleId) => {
                try {
                    const circleDoc = await getDoc(doc(db, 'circles', circleId));
                    return circleDoc.exists() ? { id: circleDoc.id, ...circleDoc.data() } : null;
                } catch (error) {
                    console.warn(`Skipping circle ${circleId}:`, error.message);
                    return null;
                }
            }));
            if (request !== requestRef.current) return;

            const now = Timestamp.now().toMillis();
            const active = circles.filter((circle) => circle
                && !(circle.circleType === 'flash' && circle.expiresAt && circle.expiresAt.toMillis() <= now));
            active.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

            setMyCircles(active);
            setLoading(false);
            setRefreshing(false);
        })();
    }, [joinedIds, joinedLoaded]);

    // A failed member lookup keeps its old list (or none) and shows the error.
    useEffect(() => {
        if (joinedError) {
            setLoading(false);
            setRefreshing(false);
        }
    }, [joinedError]);

    const onRefresh = () => {
        setRefreshing(true);
        refreshJoined();
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.loadingText, { color: colors.text }]}>Loading your circles...</Text>
            </View>
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
            ListEmptyComponent={joinedError ? (
                <EmptyState
                    onRefresh={onRefresh}
                    message={t('home.loadError')}
                    subMessage=""
                    buttonLabel={t('home.tryAgain')}
                />
            ) : (
                <EmptyState
                    onRefresh={onRefresh}
                    message="You haven't joined any circles yet"
                    subMessage="Explore the 'For you' tab to discover circles that match your interests"
                />
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
        flexGrow: 1,
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
