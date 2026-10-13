import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    FlatList, View, Text, StyleSheet, RefreshControl, ActivityIndicator,
    TouchableOpacity, AccessibilityInfo,
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../../../firebase/config';
import useAuth from '../../../hooks/useAuth';
import CircleCard from './CircleCard';
import EmptyState from './EmptyState';
import { useTheme } from '../../../context/ThemeContext';
import { RADII } from '../../../constants/constants';
import {
    PAGE_SIZE, MIN_NEW_PER_TRIGGER, MAX_PAGES_PER_TRIGGER, mergeForYouBatch,
} from '../forYouPaging.mjs';

// Public circles, newest first, 24 per page, loaded as the user scrolls.
// joinedIds come from useJoinedCircleIds in HomeScreen; joined circles are hidden.
const ForYouTab = ({ onCirclePress, joinedIds, refreshJoined }) => {
    const { user } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [circles, setCircles] = useState([]);
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [moreError, setMoreError] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Paging state that async loads read mid-flight lives in refs.
    const cursorRef = useRef(null);     // last DocumentSnapshot of the last page
    const listRef = useRef([]);         // mirror of `circles`
    const hasMoreRef = useRef(true);
    const busyRef = useRef(false);      // a page load is running
    const generationRef = useRef(0);    // bumped on reset; older loads are dropped
    const interestsRef = useRef([]);
    const joinedRef = useRef(joinedIds);
    joinedRef.current = joinedIds;

    const fetchPage = async (generation) => {
        const constraints = [where('circlePrivacy', '==', 'public'), orderBy('createdAt', 'desc')];
        if (cursorRef.current) constraints.push(startAfter(cursorRef.current));
        const snap = await getDocs(query(collection(db, 'circles'), ...constraints, limit(PAGE_SIZE)));
        if (generation !== generationRef.current) return null;
        if (snap.docs.length) cursorRef.current = snap.docs[snap.docs.length - 1];
        return { batch: snap.docs.map((d) => ({ id: d.id, ...d.data() })), more: snap.docs.length === PAGE_SIZE };
    };

    // Loads pages until enough new cards show up (or the page budget runs out).
    // Returns how many cards were added, or null when a reset made this load stale.
    const loadPages = async (generation) => {
        let added = 0;
        for (let pages = 0; pages < MAX_PAGES_PER_TRIGGER && hasMoreRef.current && added < MIN_NEW_PER_TRIGGER; pages++) {
            const page = await fetchPage(generation);
            if (!page) return null;
            const merged = mergeForYouBatch(listRef.current, page.batch, {
                joinedIds: joinedRef.current,
                interests: interestsRef.current,
            });
            listRef.current = merged.circles;
            hasMoreRef.current = page.more;
            added += merged.added;
            setCircles(merged.circles);
            setHasMore(page.more);
        }
        return added;
    };

    const reset = useCallback(async () => {
        const generation = ++generationRef.current;
        cursorRef.current = null;
        listRef.current = [];
        hasMoreRef.current = true;
        busyRef.current = true;
        setLoadingMore(false);
        setMoreError(false);
        try {
            if (user?.uid) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    interestsRef.current = userDoc.data()?.interests || [];
                } catch {
                    interestsRef.current = []; // sorting falls back to newest first
                }
            }
            const added = await loadPages(generation);
            if (added === null) return;
            setStatus('ready');
        } catch (error) {
            console.error('Error fetching for you circles:', error);
            if (generation === generationRef.current) {
                setCircles([]);
                setStatus('error');
            }
        } finally {
            if (generation === generationRef.current) {
                busyRef.current = false;
                setRefreshing(false);
            }
        }
    }, [user?.uid]);

    useEffect(() => {
        reset();
    }, [reset]);

    // Scrolling never retries a failed page by itself; the footer's Try again does.
    const loadMore = async ({ retry = false } = {}) => {
        if (busyRef.current || !hasMoreRef.current || status !== 'ready' || (moreError && !retry)) return;
        const generation = generationRef.current;
        busyRef.current = true;
        setLoadingMore(true);
        setMoreError(false);
        try {
            const added = await loadPages(generation);
            if (added) AccessibilityInfo.announceForAccessibility(t('home.moreCircles', { count: added }));
        } catch (error) {
            console.error('Error loading more circles:', error);
            if (generation === generationRef.current) setMoreError(true);
        } finally {
            if (generation === generationRef.current) {
                busyRef.current = false;
                setLoadingMore(false);
            }
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        refreshJoined();
        reset();
    };

    const retryFirstLoad = () => {
        setStatus('loading');
        refreshJoined();
        reset();
    };

    // Joining a circle elsewhere hides it here without a refetch.
    const visible = useMemo(() => {
        const joined = new Set(joinedIds);
        return circles.filter((c) => !joined.has(c.id));
    }, [circles, joinedIds]);

    if (status === 'loading') {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.loadingText, { color: colors.text }]}>Discovering circles for you...</Text>
            </View>
        );
    }

    const renderFooter = () => {
        if (loadingMore) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            );
        }
        if (moreError) {
            return (
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.text }]} accessibilityRole="alert">
                        {t('home.loadMoreError')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}
                        onPress={() => loadMore({ retry: true })}
                        accessibilityRole="button"
                    >
                        <Text style={[styles.retryText, { color: colors.background }]}>{t('home.tryAgain')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (!hasMore && visible.length > 0) {
            return (
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary || colors.text }]}>
                        {t('home.allCaughtUp')}
                    </Text>
                </View>
            );
        }
        return null;
    };

    return (
        <FlatList
            style={styles.list}
            data={visible}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <CircleCard circle={item} onPress={onCirclePress} />
            )}
            onEndReached={() => loadMore()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={status === 'error' ? (
                <EmptyState
                    onRefresh={retryFirstLoad}
                    message={t('home.loadError')}
                    subMessage=""
                    buttonLabel={t('home.tryAgain')}
                />
            ) : (
                <EmptyState
                    onRefresh={onRefresh}
                    message="No public circles available"
                    subMessage="Check back later for new circles to discover"
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
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    footerText: {
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        minHeight: 44,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: RADII.rounded,
    },
    retryText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ForYouTab;
