import React, { useState } from 'react';
import { Alert, Platform, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../../firebase/config'; // Import auth
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import Constants from "expo-constants";
import DateTimePicker from '@react-native-community/datetimepicker';
import useCurrentLocation from '../../../src/hooks/useCurrentLocation'; // Import the hook
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
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { location, errorMsg: locationErrorMsg } = useCurrentLocation();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (dateOfBirth > eighteenYearsAgo) {
      Alert.alert("Error", "You must be at least 18 years old to sign up.");
      return;
    }

    if (locationErrorMsg) {
      Alert.alert("Location Error", locationErrorMsg);
      return;
    }

    if (!location) {
      Alert.alert("Location Error", "Could not retrieve your current location. Please ensure location services are enabled.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Here you would typically save dateOfBirth and location to your user profile in Firestore or a similar database
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate('Main', { screen: 'Home' });
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
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
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ width: '80%', marginBottom: 10, padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}>
        <Text style={{ color: dateOfBirth ? '#000' : '#888' }}>
          {dateOfBirth.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()} // Cannot select a future date
        />
      )}
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
      {locationErrorMsg && <Text style={{ color: 'red', marginBottom: 10 }}>{locationErrorMsg}</Text>}
      {location && (
        <Text style={{ marginBottom: 10 }}>
          Location: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      )}
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