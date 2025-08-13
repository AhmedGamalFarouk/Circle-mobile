import React, { useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, Animated, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import CircleDetailsHeader from './components/CircleDetails/CircleDetailsHeader';
import CircleMembers from './components/CircleDetails/CircleMembers';
import CircleOptions from './components/CircleDetails/CircleOptions';
import CircleActions from './components/CircleDetails/CircleActions';
import CircleActivity from './components/CircleDetails/CircleActivity';
import useCircleDetails from '../../hooks/useCircleDetails';
import { getCircleImageUrl } from '../../utils/imageUtils';
import StandardHeader from '../../components/StandardHeader';

const CircleDetailsScreen = () => {
    const { colors } = useTheme();
    const route = useRoute();
    const navigation = useNavigation();
    const { circleId } = route.params;
    const { circle, loading, refetch } = useCircleDetails(circleId);
    const [refreshing, setRefreshing] = useState(false);
    const scrollY = new Animated.Value(0);
    const styles = getStyles(colors);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    if (loading && !circle) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading circle details...</Text>
            </View>
        );
    }

    if (!circle && !loading) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Circle Not Found</Text>
                <Text style={styles.errorText}>
                    This circle may have been deleted or you don't have access to it.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StandardHeader
                title={circle?.circleName || circle?.name || 'Circle Details'}
                showBackButton={true}
                navigation={navigation}
            />
            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                <CircleDetailsHeader
                    name={circle?.circleName || circle?.name || 'Circle Name'}
                    description={circle?.description}
                    image={getCircleImageUrl(circle)}
                    createdAt={circle?.createdAt}
                    circleId={circleId}
                />

                <View style={styles.contentContainer}>
                    <CircleActions
                        circleId={circleId}
                        circle={circle}
                        navigation={navigation}
                    />

                    <CircleMembers
                        circleId={circleId}
                    />

                    <CircleActivity
                        circleId={circleId}
                        recentActivity={circle.recentActivity || []}
                    />

                    <CircleOptions
                        circleId={circleId}
                        circle={circle}
                        navigation={navigation}
                    />
                </View>
            </Animated.ScrollView>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
    },
    errorTitle: {
        color: colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    errorText: {
        color: colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
});

export default CircleDetailsScreen;