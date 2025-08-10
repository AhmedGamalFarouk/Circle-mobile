import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/constants';
import CircleScreen from '../screens/Circle/CircleScreen';
import CreationForm from '../screens/Circle Creation/CreationForm';
import InviteAndShare from '../screens/Circle Creation/InviteAndShare';
import Circles from '../screens/Circles';
import CircleDetailsScreen from '../screens/Circle/CircleDetailsScreen';
import EditCircleScreen from '../screens/Circle/EditCircleScreen';
import JoinRequestsScreen from '../screens/Circle/JoinRequestsScreen';
import AllJoinRequestsScreen from '../screens/Circle/AllJoinRequestsScreen';

const Stack = createNativeStackNavigator();

const CircleStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Circles" component={Circles} options={{ headerShown: false }} />
            <Stack.Screen
                name="Circle"
                component={CircleScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="CreateCircle" component={CreationForm} />
            <Stack.Screen name="InviteAndShare" component={InviteAndShare} />
            <Stack.Screen name="CircleDetails" component={CircleDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditCircle" component={EditCircleScreen} options={{ headerShown: false }} />
            <Stack.Screen
                name="JoinRequests"
                component={JoinRequestsScreen}
                options={{
                    headerShown: true,
                    title: 'Join Requests',
                    headerStyle: {
                        backgroundColor: COLORS.darker,
                    },
                    headerTintColor: '#fff',
                }}
            />
        </Stack.Navigator>
    );
};

export default CircleStack;
