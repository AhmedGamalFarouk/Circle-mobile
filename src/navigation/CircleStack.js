import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/constants';
import CircleScreen from '../screens/Circle/CircleScreen';
import CreationForm from '../screens/Circle Creation/CreationForm';
import InviteAndShare from '../screens/Circle Creation/InviteAndShare';
import Circles from '../screens/Circles';
import CircleDetailsScreen from '../screens/Circle/CircleDetailsScreen';
import EditCircleScreen from '../screens/Circle/EditCircleScreen';
import InviteMembers from '../screens/InviteMembers';


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
            <Stack.Screen name="InviteMembers" component={InviteMembers} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default CircleStack;
