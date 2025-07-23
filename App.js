import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from './src/constants/constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DynamicNativeStack from './src/navigation/DynamicNativeStack';
import DynamicBottomTab from './src/navigation/DynamicBottomTab';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <DynamicNativeStack />
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
