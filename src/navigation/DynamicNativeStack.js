import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LandingScreen from '../screens/LandingScreen'
import SignInScreen from '../screens/Auth Screens/Sign in/SignInScreen'
import SignUpScreen from '../screens/Auth Screens/Sign up/SignUpScreen'
import DynamicBottomTab from './DynamicBottomTab'

const Stack = createNativeStackNavigator();

export default function DynamicNativeStack() {
    return (
        <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>

            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Home" component={DynamicBottomTab} />
        </Stack.Navigator>
    );
}