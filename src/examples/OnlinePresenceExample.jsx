import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useOnlinePresence from '../hooks/useOnlinePresence';
import OnlineIndicator from '../components/OnlineIndicator';
import { getUserAvatarUrl } from '../utils/imageUtils';

// Example component showing how to use the online presence feature
const OnlinePresenceExample = ({ users = [] }) => {
    const { colors } = useTheme();
    const { onlineUsers, isUserOnline, getLastSeenText } = useOnlinePresence();
    
    const styles = getStyles(colors);
    
    const renderUser = ({ item }) => {
        const isOnline = isUserOnline(item.userId);
        
        return (
            <TouchableOpacity style={styles.userItem}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: getUserAvatarUrl(item, 50) }}
                        style={styles.avatar}
                    />
                    {/* Online indicator positioned on avatar */}
                    <View style={styles.onlineIndicatorPosition}>
                        <OnlineIndicator userId={item.userId} size={14} />
                    </View>
                </View>
                
                <View style={styles.userInfo}>
                    <Text style={styles.username}>
                        {item.username || 'Unknown User'}
                    </Text>
                    
                    {/* Status text with online indicator */}
                    <OnlineIndicator 
                        userId={item.userId} 
                        showText={true} 
                        size={8}
                    />
                </View>
            </TouchableOpacity>
        );
    };
    
    // Get list of online users
    const onlineUsersList = Object.values(onlineUsers).filter(user => user.isOnline);
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Online Presence Example</Text>
            
            {/* Online users count */}
            <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                    {onlineUsersList.length} users online
                </Text>
            </View>
            
            {/* Users list */}
            <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.userId}
                style={styles.usersList}
                showsVerticalScrollIndicator={false}
            />
            
            {/* Raw online users data (for debugging) */}
            {__DEV__ && (
                <View style={styles.debugContainer}>
                    <Text style={styles.debugTitle}>Debug: Online Users Data</Text>
                    <Text style={styles.debugText}>
                        {JSON.stringify(onlineUsers, null, 2)}
                    </Text>
                </View>
            )}
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    statsContainer: {
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    statsText: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
    },
    usersList: {
        flex: 1,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.surface,
        borderRadius: 8,
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.border,
    },
    onlineIndicatorPosition: {
        position: 'absolute',
        bottom: -2,
        right: -2,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    debugContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: colors.surface,
        borderRadius: 8,
        maxHeight: 200,
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontFamily: 'monospace',
    },
});

export default OnlinePresenceExample;