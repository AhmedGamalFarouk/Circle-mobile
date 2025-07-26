import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import doc and setDoc
import { auth, db } from '../../../firebase/config'; // Import auth and db
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import Constants from "expo-constants";
import useCurrentLocation from '../../../hooks/useCurrentLocation'; // Import the hook
import {
  AuthContainer,
  Logo,
  Title,
  AuthInput,
  DateOfBirthInput,
  LocationInput,
  SubmitButton,
  OrDivider,
  SocialButtons,
  BottomLink,
} from '../Components/AuthUI';

WebBrowser.maybeCompleteAuthSession();

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [locationText, setLocationText] = useState('');
  const { location, locationName, errorMsg: locationErrorMsg, isLoading, getCurrentLocation } = useCurrentLocation();

  const handleSignUp = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your username.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    if (!dateOfBirth) {
      Alert.alert("Error", "Please select your date of birth.");
      return;
    }

    if (!locationText.trim()) {
      Alert.alert("Error", "Please enter your location or use GPS to get current location.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    // Age validation
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (dateOfBirth > eighteenYearsAgo) {
      Alert.alert("Error", "You must be at least 18 years old to sign up.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: user.email,
        dateOfBirth: dateOfBirth.toISOString(), // Store as ISO string
        location: locationText,
        profileImage: '', // Placeholder for profile image
        coverImage: '', // Placeholder for cover image
        bio: '', // Placeholder for bio
        followers: 0,
        following: 0,
        posts: 0,
      });

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate('Main', { screen: 'Home' });
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  const handleGetLocation = async () => {
    await getCurrentLocation();
  };

  // Update location text when GPS location is retrieved
  React.useEffect(() => {
    if (locationName) {
      setLocationText(locationName);
    }
  }, [locationName]);

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
        .then(async (userCredential) => {
          const user = userCredential.user;
          // Save user profile data to Firestore for Google sign-up
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            username: user.displayName || user.email.split('@')[0], // Use Google display name or derive from email
            dateOfBirth: '', // Google sign-up doesn't provide DOB directly
            location: '', // Google sign-up doesn't provide location directly
            profileImage: user.photoURL || '',
            coverImage: '',
            bio: '',
            followers: 0,
            following: 0,
            posts: 0,
          });
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
      <Title
        subtitle="Create your account to join the community"
      >
        Join Circle!
      </Title>

      <AuthInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        icon="person-outline"
      />

      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        icon="mail-outline"
      />

      <DateOfBirthInput
        value={dateOfBirth}
        onChange={setDateOfBirth}
        placeholder="Select your date of birth"
      />

      <LocationInput
        value={locationText}
        onChangeText={setLocationText}
        onGetLocation={handleGetLocation}
        isLoading={isLoading}
        placeholder="Enter your location"
      />

      <AuthInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
        icon="lock-closed-outline"
      />

      <AuthInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        showPassword={showConfirmPassword}
        toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
        icon="lock-closed-outline"
      />

      {locationErrorMsg && (
        <Text style={{
          color: '#ff6b6b',
          fontSize: 14,
          marginBottom: 16,
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          {locationErrorMsg}
        </Text>
      )}

      <SubmitButton title="Create Account" onPress={handleSignUp} />
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