import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants/constants';

const JoinedCircles = ({ circles = [] }) => {
    const navigation = useNavigation();
    // Mock data for demonstration - you can replace this with actual circle data
    const mockCircles = [
        { id: 1, name: 'Tech Enthusiasts', image: 'https://picsum.photos/70?random=20', memberCount: 245 },
        { id: 2, name: 'Book Club', image: 'https://picsum.photos/70?random=21', memberCount: 89 },
        { id: 3, name: 'Fitness Buddies', image: 'https://picsum.photos/70?random=22', memberCount: 156 },
        { id: 4, name: 'Photography', image: 'https://picsum.photos/70?random=23', memberCount: 312 },
        { id: 5, name: 'Cooking Masters', image: 'https://picsum.photos/70?random=24', memberCount: 78 },
        { id: 6, name: 'Travel Squad', image: 'https://picsum.photos/70?random=25', memberCount: 203 },
        { id: 7, name: 'Music Lovers', image: 'https://picsum.photos/70?random=26', memberCount: 445 },
    ];

    const displayCircles = circles.length > 0 ? circles : mockCircles;

    const handleCirclePress = (circle) => {
        navigation.navigate('Circle', { circleId: circle.id });
    };

    return (
        <View>
            <Text style={styles.title}>Joined Circles</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {displayCircles.map((circle) => (
                    <TouchableOpacity
                        key={circle.id}
                        style={styles.circleItem}
                        onPress={() => handleCirclePress(circle)}
                    >
                        <Image
                            source={{ uri: circle.image }}
                            style={styles.circleImage}
                        />
                        <Text style={styles.circleName} numberOfLines={2}>
                            {circle.name}
                        </Text>
                        <Text style={styles.memberCount}>
                            {circle.memberCount} members
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({

    title: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    scrollView: {
        paddingHorizontal: 12,
        maxHeight: 80, // Constrain the ScrollView height
    },
    scrollContent: {
        paddingRight: 12,
    },
    circleItem: {
        alignItems: 'center',
        width: 70,
        marginRight: 12,
    },
    circleImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginBottom: 6,
        borderWidth: 2,
        borderColor: COLORS.primary,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    circleName: {
        color: COLORS.light,
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 2,
        lineHeight: 12,
    },
    memberCount: {
        color: COLORS.text,
        fontSize: 9,
        textAlign: 'center',
        opacity: 0.8,
    },
});

export default JoinedCircles;