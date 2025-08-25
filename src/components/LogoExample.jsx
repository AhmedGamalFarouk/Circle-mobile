import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const LogoExample = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Circle Logo Examples</Text>
      
      {/* Small logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.label}>Small (24x24)</Text>
        <Logo width={24} height={24} />
      </View>
      
      {/* Medium logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.label}>Medium (48x48)</Text>
        <Logo width={48} height={48} />
      </View>
      
      {/* Large logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.label}>Large (72x72)</Text>
        <Logo width={72} height={72} />
      </View>
      
      {/* Extra large logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.label}>Extra Large (96x96)</Text>
        <Logo width={96} height={96} />
      </View>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 15,
    padding: 15,
    backgroundColor: colors.card,
    borderRadius: 12,
    minWidth: 150,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
});

export default LogoExample;