import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from './src/constants/constants';
import LandingScreen from './src/screens/LandingScreen';
import SignInScreen from './src/screens/Auth Screens/Sign in/SignInScreen';
import SignUpScreen from './src/screens/Auth Screens/Sign up/SignUpScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DynamicBottomTab from './src/navigation/DynamicBottomTab';
import CreationForm from './src/screens/Circle Creation/CreationForm';
import InviteAndShare from './src/screens/Circle Creation/InviteAndShare';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={DynamicBottomTab} />
        <Stack.Screen name="CreationForm" component={CreationForm} options={{ presentation: 'modal' }} />
        <Stack.Screen name="InviteAndShare" component={InviteAndShare} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darker, // Set background to black for the landing page
    alignItems: 'center',
    justifyContent: 'center',
  },
});
