import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from './src/context/ThemeContext';
import { COLORS } from './src/constants/constants';
import { NavigationContainer } from '@react-navigation/native';
import DynamicNativeStack from './src/navigation/DynamicNativeStack';

// Import localization
import './src/localization/i18n';
import { LanguageProvider } from './src/context/LanguageContext';

import { ThemeProvider } from './src/context/ThemeContext';

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <DynamicNativeStack />
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
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
