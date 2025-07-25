import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from './src/constants/constants';
import LandingScreen from './src/screens/LandingScreen';
import SignInScreen from './src/screens/Auth Screens/Sign in/SignInScreen';
import SignUpScreen from './src/screens/Auth Screens/Sign up/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import CircleScreen from './src/screens/Circle/CircleScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DynamicNativeStack from './src/navigation/DynamicNativeStack';
import DynamicBottomTab from './src/navigation/DynamicBottomTab';

const Stack = createNativeStackNavigator();
import CreationForm from './src/screens/Circle Creation/CreationForm';
import InviteAndShare from './src/screens/Circle Creation/InviteAndShare';


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={DynamicBottomTab} />
        <Stack.Screen name="CreationForm" component={CreationForm} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Circle" component={CircleScreen} />
        <Stack.Screen name="InviteAndShare" component={InviteAndShare} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
