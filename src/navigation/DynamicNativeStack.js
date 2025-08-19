import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DynamicBottomTab from './DynamicBottomTab';
import CircleScreen from '../screens/Circle/CircleScreen';
import CreationForm from '../screens/Circle Creation/CreationForm';
import InviteAndShare from '../screens/Circle Creation/InviteAndShare';
import CircleDetailsScreen from '../screens/Circle/CircleDetailsScreen';
import EditCircleScreen from '../screens/Circle/EditCircleScreen';
import EventConfirmation from '../screens/Circle/components/EventConfirmation/EventConfirmation';
import InviteMembers from '../screens/InviteMembers';
import LandingScreen from '../screens/LandingScreen';
import SignInScreen from '../screens/Auth Screens/Sign in/SignInScreen';
import SignUpScreen from '../screens/Auth Screens/Sign up/SignUpScreen';
import useAuth from '../hooks/useAuth';

const Stack = createNativeStackNavigator();

export default function DynamicNativeStack() {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Or a loading screen component
    }

    return (
        <Stack.Navigator initialRouteName={user ? "Main" : "Landing"} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Main" component={DynamicBottomTab} />
            <Stack.Screen name="Circle" component={CircleScreen} />
            <Stack.Screen name="CreationForm" component={CreationForm} />
            <Stack.Screen name="InviteAndShare" component={InviteAndShare} />
            <Stack.Screen name="CircleDetails" component={CircleDetailsScreen} />
            <Stack.Screen name="EditCircle" component={EditCircleScreen} />
            <Stack.Screen name="EventConfirmation" component={EventConfirmation} />
            <Stack.Screen name="InviteMembers" component={InviteMembers} />
        </Stack.Navigator>
    );
}