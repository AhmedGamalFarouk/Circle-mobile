import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import doc and setDoc
import { auth, db } from '../../../firebase/config'; // Import auth and db
import { validateUsername, isUsernameUnique } from '../../../utils/userValidation'; // Import username validation
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
      const validation = await validateUsername(usernameToCheck);
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
      // Validate username format and uniqueness
      // Use cached validation if available and current, otherwise validate again
      let currentUsernameValidation = usernameValidation;
      if (usernameValidation.isValid === null || isCheckingUsername) {
        currentUsernameValidation = await validateUsername(username);
      }

      if (!currentUsernameValidation.isValid) {
        Alert.alert("Username Error", currentUsernameValidation.error);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username.toLowerCase().trim(), // Store normalized username
        email: user.email,
        phoneNumber: '', // Placeholder for phone number
        avatarPhoto: '', // Placeholder for profile image
        coverPhoto: '', // Placeholder for cover image
        bio: '', // Placeholder for bio
        dateOfBirth: dateOfBirth.toISOString(), // Store as ISO string
        location: locationText,
        interests: selectedInterests, // Store selected interests
        createdAt: new Date().toISOString(), // Account creation timestamp
        friends: [], // Empty friends array
        friendRequests: {
          sent: [],
          received: []
        },
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
              ✓ Username is available
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