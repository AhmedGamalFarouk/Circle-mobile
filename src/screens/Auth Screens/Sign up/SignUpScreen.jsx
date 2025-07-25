import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../../firebase/config'; // Import auth
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import Constants from "expo-constants";
import {
  AuthContainer,
  Logo,
  Title,
  AuthInput,
  SubmitButton,
  OrDivider,
  SocialButtons,
  BottomLink,
} from '../Components/AuthUI';

WebBrowser.maybeCompleteAuthSession();

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate('Main', { screen: 'Home' });
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  const redirectUri = makeRedirectUri({
    useProxy: true,
    path: 'auth', // This path should match your Expo redirect URI setup
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Constants.expoConfig.extra.webClientId,
      androidClientId: Constants.expoConfig.extra.androidClientId,
      iosClientId: Constants.expoConfig.extra.iosClientId,
      scopes: ['profile', 'email'],
      redirectUri: redirectUri,
    },
    {
      projectNameForProxy: '@ahmed-gamal/Circle-mobile',
    }
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const { idToken, accessToken } = authentication;
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert("Success", "Account created with Google successfully!");
          navigation.navigate('Main', { screen: 'Home' });
        })
        .catch((error) => {
          Alert.alert("Google Sign Up Error", error.message);
        });
    }
  }, [response]);

  const handleGoogleSignUp = () => {
    promptAsync();
  };

  return (
    <AuthContainer>
      <Logo />
      <Title>Join Circle!</Title>
      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
      />
      <AuthInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        showPassword={showConfirmPassword}
        toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />
      <SubmitButton title="Sign Up" onPress={handleSignUp} />
      <OrDivider />
      <SocialButtons onGooglePress={handleGoogleSignUp} disabled={!request} />
      <BottomLink
        text="Already have an account?"
        linkText="Sign In"
        onPress={() => navigation.navigate('SignIn')}
      />
    </AuthContainer>
  );
};

export default SignUpScreen;