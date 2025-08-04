import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import SettingsScreen from '../screens/Settings/SettingsScreen'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/constants'
import Explore from '../screens/Explore'
import { FONTS } from '../constants/constants'
import CircleStack from './CircleStack'
import { useTheme } from '../context/ThemeContext'
import { useLocalization } from '../hooks/useLocalization'
import { useLanguage } from '../context/LanguageContext'

const Tab = createBottomTabNavigator();

const DynamicBottomTab = () => {
    const { t } = useLocalization()
    const { currentLanguage } = useLanguage()
    const isArabic = currentLanguage === 'ar'
    const { colors } = useTheme()
    return (
        <Tab.Navigator screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.text,
            tabBarStyle: {
                backgroundColor: colors.background,
                borderColor: colors.border,
            },
            headerStyle: {
                height: 80,
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderBottomWidth: 1,
            },
            headerTintColor: colors.text,
            headerTitleAlign:'center',
            headerTitleStyle: {
                fontFamily: FONTS.bold,
            }
        }}>
            <Tab.Screen name={isArabic ? "الرئيسية" : "Home"} component={HomeScreen} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home" color={color} size={size} />
                ),
            }} />
            <Tab.Screen name={isArabic ? "الملف الشخصي" : "Profile"} component={ProfileScreen} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="person" color={color} size={size} />
                ),
            }} />
            <Tab.Screen name={isArabic ? "استكشاف" : "Explore"} component={Explore} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="search" color={color} size={size} />
                ),
            }} />
            <Tab.Screen name={isArabic ? "الدوائر" : "Circles"} component={CircleStack} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="people" color={color} size={size} />
                ),
                headerShown: false,
            }} />
            <Tab.Screen name={isArabic ? "الإعدادات" : "Settings"} component={SettingsScreen} options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="settings" color={color} size={size} />
                ),
            }} />
        </Tab.Navigator>
    );
};

export default DynamicBottomTab;

const styles = StyleSheet.create({});