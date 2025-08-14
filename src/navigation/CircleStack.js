import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CircleScreen from '../screens/Circle/CircleScreen';
import CreationForm from '../screens/Circle Creation/CreationForm';
import InviteAndShare from '../screens/Circle Creation/InviteAndShare';
import Home from '../screens/Home/HomeScreen';
import CircleDetailsScreen from '../screens/Circle/CircleDetailsScreen';
import EditCircleScreen from '../screens/Circle/EditCircleScreen';


const Stack = createNativeStackNavigator();

const CircleStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Circles" component={Home} options={{ headerShown: false }} />
            <Stack.Screen
                name="Circle"
                component={CircleScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="CreateCircle" component={CreationForm} />
            <Stack.Screen name="InviteAndShare" component={InviteAndShare} />
            <Stack.Screen name="CircleDetails" component={CircleDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditCircle" component={EditCircleScreen} options={{ headerShown: false }} />

        </Stack.Navigator>
    );
};

export default CircleStack;
