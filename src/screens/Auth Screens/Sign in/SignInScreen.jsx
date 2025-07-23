import React, { useState } from 'react';
import { Alert } from 'react-native';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
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

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      // TODO: Uncomment the following lines to enable Firebase authentication
      // await signInWithEmailAndPassword(auth, email, password);
      // Alert.alert("Success", "Logged in successfully!");
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
    <AuthContainer>
      <Logo />
      <Title>Welcome back!</Title>
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
      <SubmitButton title="Login" onPress={handleLogin} />
      <OrDivider />
      <SocialButtons onGooglePress={handleGoogleSignIn} disabled={!request} />
      <BottomLink
        text="Don't have an account?"
        linkText="Sign up"
        onPress={() => navigation.navigate('SignUp')}
      />
    </AuthContainer>
  );
};

export default SignInScreen;