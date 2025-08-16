import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DynamicBottomTab from './DynamicBottomTab';
import CircleScreen from '../screens/Circle/CircleScreen';
import CreationForm from '../screens/Circle Creation/CreationForm';
import InviteAndShare from '../screens/Circle Creation/InviteAndShare';
import CircleDetailsScreen from '../screens/Circle/CircleDetailsScreen';
import EditCircleScreen from '../screens/Circle/EditCircleScreen';
import EventConfirmation from '../screens/Circle/components/EventConfirmation/EventConfirmation';

const Stack = createNativeStackNavigator();

export default function DynamicNativeStack() {
    return (
        <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={DynamicBottomTab} />
            <Stack.Screen name="Circle" component={CircleScreen} />
            <Stack.Screen name="CreationForm" component={CreationForm} />
            <Stack.Screen name="InviteAndShare" component={InviteAndShare} />
            <Stack.Screen name="CircleDetails" component={CircleDetailsScreen} />
            <Stack.Screen name="EditCircle" component={EditCircleScreen} />
            <Stack.Screen name="EventConfirmation" component={EventConfirmation} />
        </Stack.Navigator>
    );
}