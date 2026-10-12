import React, { useState } from 'react';
import { Alert, Linking, Platform, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import doc and setDoc
import { auth, db } from '../../../firebase/config'; // Import auth and db
import { ageFrom } from '../../../shared/schema.mjs';
import { validateUsername } from '../../../utils/userValidation';
import useCurrentLocation from '../../../hooks/useCurrentLocation'; // Import the hook
import {
  AuthContainer,
  Title,
  AuthInput,
  DateOfBirthInput,
  LocationInput,
  SubmitButton,
  BottomLink,
  InterestsSelector,
} from '../Components/AuthUI';
import { styles } from '../Components/styles';

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
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [usernameValidation, setUsernameValidation] = useState({ isValid: null, error: '' });
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { location, locationName, errorMsg: locationErrorMsg, isLoading, getCurrentLocation } = useCurrentLocation();

  // Debounced username validation
  const checkUsernameValidation = React.useCallback(async (usernameToCheck) => {
    if (!usernameToCheck.trim()) {
      setUsernameValidation({ isValid: null, error: '' });
      return;
    }

    setIsCheckingUsername(true);
    try {
      const validation = await validateUsername(usernameToCheck, { checkAvailability: !!auth.currentUser });
      setUsernameValidation(validation);
    } catch (error) {
      setUsernameValidation({ isValid: false, error: 'Error checking username' });
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  // Debounce username validation
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        checkUsernameValidation(username);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameValidation]);

  const handleSignUp = async () => {
    // Basic validation
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
      const format = await validateUsername(username, { checkAvailability: false });
      if (!format.isValid) {
        Alert.alert("Username Error", format.error);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Profiles can only be queried once signed in, so check availability now
      // and undo the account if the name is taken (same as web).
      const availability = await validateUsername(username);
      if (!availability.isValid) {
        await user.delete();
        Alert.alert("Username Error", availability.error);
        return;
      }

      // Save user profile data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username.toLowerCase().trim(), // Store normalized username
        email: user.email,
        phoneNumber: '', // Placeholder for phone number
        avatarPhoto: '', // Placeholder for profile image
        coverPhoto: '', // Placeholder for cover image
        bio: '', // Placeholder for bio
        age: ageFrom(dateOfBirth), // The birth date itself is private (below)
        location: locationText,
        interests: selectedInterests, // Store selected interests
        createdAt: new Date(), // Stored as a Timestamp, like web
        connections: [],
        connectionRequests: [],
        joinedCircles: [], // Empty joined circles array
        joinedEvents: [], // Empty joined events array
        stats: {
          circles: 0,
          connections: 0,
          events: 0
        },
        reported: 0, // No reports initially
        isBlocked: false // Not blocked initially
      });

      // Only the user can read users/{uid}/private/*. Local date, so no time-zone shift.
      const y = dateOfBirth.getFullYear(), m = dateOfBirth.getMonth() + 1, d = dateOfBirth.getDate();
      await setDoc(doc(db, 'users', user.uid, 'private', 'profile'), {
        dateOfBirth: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate('Main', { screen: 'Home' });
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  const handleGetLocation = async () => {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location permission needed',
        canAskAgain
          ? 'Allow location access to fill in your city, or type it in.'
          : 'Location access is turned off for this app. Turn it on in Settings, or type your city in.',
        canAskAgain
          ? [{ text: 'OK' }]
          : [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }]
      );
      return;
    }
    // Permission alone isn't enough when the phone's location switch is off;
    // on Android, show the system "turn on location" dialog.
    if (!(await Location.hasServicesEnabledAsync()) && Platform.OS === 'android') {
      try {
        await Location.enableNetworkProviderAsync();
      } catch {
        Alert.alert('Location is off', 'Turn on location for your phone, or type your city in.');
        return;
      }
    }
    await getCurrentLocation();
  };

  // Update location text when GPS location is retrieved
  React.useEffect(() => {
    if (locationName) {
      setLocationText(locationName);
    }
  }, [locationName]);

  return (
    <AuthContainer scrollable>
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

      {/* Username validation feedback */}
      {username.trim() && (
        <View style={{ marginBottom: 16, marginTop: -8 }}>
          {isCheckingUsername ? (
            <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
              Checking username availability...
            </Text>
          ) : usernameValidation.isValid === true ? (
            <Text style={{ color: '#4CAF50', fontSize: 12 }}>
              {usernameValidation.availabilityChecked === false ? '✓ Username looks good' : '✓ Username is available'}
            </Text>
          ) : usernameValidation.isValid === false ? (
            <Text style={{ color: '#ff6b6b', fontSize: 12 }}>
              {usernameValidation.error}
            </Text>
          ) : null}
        </View>
      )}

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

      {locationErrorMsg && (
        <Text style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 16, marginTop: -8 }}>
          {locationErrorMsg}
        </Text>
      )}

      <InterestsSelector
        selectedInterests={selectedInterests}
        onInterestsChange={setSelectedInterests}
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

      <View style={styles.buttonSection}>
        <SubmitButton title="Create Account" onPress={handleSignUp} />
        <BottomLink
          text="Already have an account?"
          linkText="Sign In"
          onPress={() => navigation.navigate('SignIn')}
        />
      </View>
    </AuthContainer>
  );
};

export default SignUpScreen;