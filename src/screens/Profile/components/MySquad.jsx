import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../../constants/constants';

const MySquad = ({ friends = [] }) => {
    // Mock data for demonstration - you can replace this with actual friend data
    const mockFriends = [
        { id: 1, name: 'Sarah', avatar: 'https://picsum.photos/60?random=10' },
        { id: 2, name: 'Mike', avatar: 'https://picsum.photos/60?random=11' },
        { id: 3, name: 'Emma', avatar: 'https://picsum.photos/60?random=12' },
        { id: 4, name: 'Jake', avatar: 'https://picsum.photos/60?random=13' },
        { id: 5, name: 'Lisa', avatar: 'https://picsum.photos/60?random=14' },
    ];

    const displayFriends = friends.length > 0 ? friends.slice(0, 5) : mockFriends.slice(0, 5);

    const handleFriendPress = (friend) => {
        console.log('Pressed friend:', friend.name);
        // Navigate to friend's profile or show friend details
    };

    return (
        <View >
            <Text style={styles.title}>My Squad</Text>
            <View style={styles.friendsRow}>
                {displayFriends.map((friend) => (
                    <TouchableOpacity
                        key={friend.id}
                        style={styles.friendItem}
                        onPress={() => handleFriendPress(friend)}
                    >
                        <Image
                            source={{ uri: friend.avatar }}
                            style={styles.friendAvatar}
                        />
                        <Text style={styles.friendName} numberOfLines={1}>
                            {friend.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    friendsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    friendItem: {
        alignItems: 'center',
        width: 50,
        marginHorizontal: 1,
    },
    friendAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 5,
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
    friendName: {
        color: COLORS.light,
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default MySquad;