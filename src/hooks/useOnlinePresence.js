import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { ref, set, onValue, onDisconnect } from 'firebase/database';
import { database } from '../firebase/config';
import useAuth from './useAuth';

export const useOnlinePresence = () => {
    const [onlineUsers, setOnlineUsers] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            return;
        }

        const presenceRef = ref(database, 'presence');
        const userPresenceRef = ref(database, `presence/${user.uid}`);
        
        // Set user online in RTDB
        const setUserOnline = async () => {
            const userData = {
                isOnline: true,
                lastSeen: Date.now(),
                username: user.displayName || user.email?.split('@')[0] || 'Unknown User',
                email: user.email,
                uid: user.uid
            };
            try {
                await set(userPresenceRef, userData);
            } catch (err) {
                console.error('Error setting user online in RTDB:', err);
            }
        };

        const setUserOffline = async () => {
            try {
                await set(userPresenceRef, {
                    isOnline: false,
                    lastSeen: Date.now()
                });
            } catch (err) {
                console.error('Error setting user offline in RTDB:', err);
            }
        };

        // Listen to all users' presence using RTDB
        const unsubscribe = onValue(presenceRef, (snapshot) => {
            const presenceData = snapshot.val() || {};
            setOnlineUsers(presenceData);
        }, (error) => {
            console.error('Error listening to presence:', error);
        });

        // Initialize presence
        setUserOnline();

        // Set up automatic offline detection when connection is lost
        onDisconnect(userPresenceRef).set({
            isOnline: false,
            lastSeen: Date.now()
        });

        // Handle app state changes (foreground/background)
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active') {
                // App came to foreground
                setUserOnline();
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                // App went to background
                setUserOffline();
            }
        };

        // Add app state listener
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            // Cleanup
            unsubscribe();
            appStateSubscription?.remove();
            setUserOffline();
        };
    }, [user]);

    const formatLastSeen = (timestamp) => {
        if (!timestamp) return 'Never';
        
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return new Date(timestamp).toLocaleDateString();
    };

    return {
        onlineUsers,
        isUserOnline: (userId) => {
            const isOnline = onlineUsers[userId]?.isOnline || false;
            return isOnline;
        },
        getUserLastSeen: (userId) => onlineUsers[userId]?.lastSeen || null,
        getLastSeenText: (userId) => {
            const userData = onlineUsers[userId];
            if (!userData) return 'Never seen';
            if (userData.isOnline) return 'Online now';
            return `Last seen ${formatLastSeen(userData.lastSeen)}`;
        }
    };
};

export default useOnlinePresence;