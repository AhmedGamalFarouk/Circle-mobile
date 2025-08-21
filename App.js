import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from './src/context/ThemeContext';
import { COLORS } from './src/constants/constants';
import { NavigationContainer } from '@react-navigation/native';
import DynamicNativeStack from './src/navigation/DynamicNativeStack';

// Import localization
import i18n from './src/localization/i18n'; // Import the i18n instance
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider
import { LanguageProvider } from './src/context/LanguageContext';

import { ThemeProvider } from './src/context/ThemeContext';
import AppStripeProvider from './src/providers/StripeProvider';

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
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <LanguageProvider>
          <AppStripeProvider>
            <AppContent />
          </AppStripeProvider>
        </LanguageProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
