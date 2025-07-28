import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import SettingsScreen from '../screens/Settings/SettingsScreen'
import CircleScreen from '../screens/Circle/CircleScreen'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/constants'
import Explore from '../screens/Explore'
import { FONTS } from '../constants/constants'
import Circle2 from '../screens/circle2/circle2'

const Tab = createBottomTabNavigator();

const DynamicBottomTab = () => {
    return (
        <Tab.Navigator screenOptions={{
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.text,
            tabBarStyle: {
                backgroundColor: COLORS.dark,
                borderColor: COLORS.primary,
            },
            headerStyle: {
                height: 80,
                backgroundColor: COLORS.dark,
                borderColor: COLORS.primary,
                borderBottomWidth: 1,
            },
            headerTintColor: COLORS.primary,
            headerTitleStyle: {
                fontFamily: FONTS.bold,
            }
        }}>
            <Tab.Screen name="Home" component={HomeScreen} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home" color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="person" color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="Explore" component={Explore} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="search" color={color} size={size} />
                ),
            }} />
            {/* <Tab.Screen name="Circle" component={CircleScreen} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="people" color={color} size={size} />
                ),
            }} /> */}
            <Tab.Screen name="Circle2" component={Circle2} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="people" color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="settings" color={color} size={size} />
                ),
            }} />
        </Tab.Navigator>
    );
};

export default DynamicBottomTab;

const styles = StyleSheet.create({});