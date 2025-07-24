import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import DynamicNativeStack from './src/navigation/DynamicNativeStack';


export default function App() {
  return (
    <NavigationContainer>
      <DynamicNativeStack />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
