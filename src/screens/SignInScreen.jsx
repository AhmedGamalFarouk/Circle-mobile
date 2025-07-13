import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { COLORS, RADII } from '../constants/constants';
import { Ionicons } from '@expo/vector-icons';
import { auth, googleProvider } from './firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully!");
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  };

  const redirectUri = makeRedirectUri({
    useProxy: true,
    path: 'auth', // This path should match your Expo redirect URI setup
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '141731835688-n2l055sgl1h5bna83k7f5s50lkop8epg.apps.googleusercontent.com', // Your webClientId
      scopes: ['profile', 'email'],
      redirectUri: redirectUri,
    },
    {
      projectNameForProxy: 'YOUR_EXPO_USERNAME/YOUR_PROJECT_SLUG', // IMPORTANT: Replace with your actual Expo username and project slug
    }
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const credential = GoogleAuthProvider.credential(authentication.idToken);
      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert("Success", "Logged in with Google successfully!");
          navigation.navigate('Home');
        })
        .catch((error) => {
          Alert.alert("Google Login Error", error.message);
        });
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icon.png')} // Assuming this is the happy face icon
        style={styles.logo}
      />
      <Text style={styles.welcomeText}>Welcome back!</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.text}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.text}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-facebook" size={30} color={COLORS.light} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn} disabled={!request}>
          <Ionicons name="logo-google" size={30} color={COLORS.light} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={30} color={COLORS.light} />
        </TouchableOpacity>
      </View>

      <Text style={styles.signUpText}>
        Don't have an account? <Text style={styles.signUpLink} onPress={() => navigation.navigate('SignUp')}>Sign up</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darker,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
    borderRadius: RADII.pill, // Make it circular
    backgroundColor: COLORS.primary, // Blue background for the circle
    resizeMode: 'contain', // Ensure the icon fits
  },
  welcomeText: {
    color: COLORS.light,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderColor: COLORS.text,
    borderWidth: 1,
    borderRadius: RADII.rounded,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: COLORS.light,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 50,
    borderRadius: RADII.rounded,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginButtonText: {
    color: COLORS.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.text,
  },
  orText: {
    color: COLORS.text,
    marginHorizontal: 10,
    fontSize: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 50,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: RADII.largeRounded,
    backgroundColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.text,
  },
  signUpText: {
    color: COLORS.light,
    fontSize: 16,
  },
  signUpLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default SignInScreen;