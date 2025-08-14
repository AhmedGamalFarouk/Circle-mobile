import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DynamicBottomTab from './DynamicBottomTab';

const Stack = createNativeStackNavigator();

export default function DynamicNativeStack() {
    return (
        <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={DynamicBottomTab} />
        </Stack.Navigator>
    );
}