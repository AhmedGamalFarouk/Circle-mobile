import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { COLORS } from '../../../constants/constants';
import {
  AuthContainer,
  Logo,
  Title,
  AuthInput,
  ForgotPasswordLink,
  SubmitButton,
  BottomLink,
} from '../Components/AuthUI';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Validation Error", "Please enter your password");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "Welcome back!");
      navigation.navigate('Main', { screen: 'Home' });
    } catch (error) {
      let errorMessage = "An error occurred during sign in";

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        default:
          errorMessage = error.message;
      }

      Alert.alert("Sign In Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen or show modal
    Alert.alert("Forgot Password", "This feature will be implemented soon!");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.darker }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ backgroundColor: COLORS.darker }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthContainer>
          <Logo />
          <Title subtitle="Sign in to continue to your account">
            Welcome back!
          </Title>

          <AuthInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
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

          <ForgotPasswordLink onPress={handleForgotPassword} />

          <SubmitButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
          />

          <BottomLink
            text="Don't have an account?"
            linkText="Sign up"
            onPress={() => navigation.navigate('SignUp')}
          />
        </AuthContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;