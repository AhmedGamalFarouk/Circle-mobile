import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from './src/context/ThemeContext';
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

// Import localization
import './src/localization/i18n';
import { LanguageProvider } from './src/context/LanguageContext';

const Stack = createNativeStackNavigator();
import CreationForm from './src/screens/Circle Creation/CreationForm';
import InviteAndShare from './src/screens/Circle Creation/InviteAndShare';
import EditCircleScreen from './src/screens/Circle/EditCircleScreen';

import useAuth from './src/hooks/useAuth';
import { ThemeProvider } from './src/context/ThemeContext';
import AppStripeProvider from './src/providers/StripeProvider';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={user ? "Main" : "Landing"} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Main" component={DynamicBottomTab} />
            <Stack.Screen name="CreationForm" component={CreationForm} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="InviteAndShare" component={InviteAndShare} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Circle" component={CircleScreen} />
            <Stack.Screen name="EditCircle" component={EditCircleScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppStripeProvider>
          <AppContent />
        </AppStripeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
