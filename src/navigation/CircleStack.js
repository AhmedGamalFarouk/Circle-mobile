import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/constants';
import CircleScreen from '../screens/Circle/CircleScreen';
import CreationForm from '../screens/Circle Creation/CreationForm';
import InviteAndShare from '../screens/Circle Creation/InviteAndShare';
import Circle2 from '../screens/circle2/circle2';

const Stack = createNativeStackNavigator();

const CircleStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Circles" component={Circle2} options={{ headerShown: false }} />
            <Stack.Screen
                name="Circle"
                component={CircleScreen}
                options={({ route }) => ({
                    title: route.params?.name || 'Circle',
                    headerStyle: {
                        backgroundColor: COLORS.dark,
                    },
                    headerTintColor: COLORS.light,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                })}
            />
            <Stack.Screen name="CreateCircle" component={CreationForm} />
            <Stack.Screen name="InviteAndShare" component={InviteAndShare} />
        </Stack.Navigator>
    );
};

export default CircleStack;
