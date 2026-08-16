import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { COLORS, RADII } from '../constants/constants';
import Logo from '../components/Logo';

const avatars = [
  { id: 1, uri: 'https://i.pravatar.cc/100?img=1' },
  { id: 2, uri: 'https://i.pravatar.cc/100?img=2' },
  { id: 3, uri: 'https://i.pravatar.cc/100?img=3' },
  { id: 4, uri: 'https://i.pravatar.cc/100?img=4' },
  { id: 5, uri: 'https://i.pravatar.cc/100?img=5' },
  { id: 6, uri: 'https://i.pravatar.cc/100?img=6' },
  { id: 7, uri: 'https://i.pravatar.cc/100?img=7' },
  { id: 8, uri: 'https://i.pravatar.cc/100?img=8' },
  { id: 9, uri: 'https://i.pravatar.cc/100?img=9' },
  { id: 10, uri: 'https://i.pravatar.cc/100?img=10' },
  { id: 11, uri: 'https://i.pravatar.cc/100?img=11' },
  { id: 12, uri: 'https://i.pravatar.cc/100?img=12' },
];


const LandingScreen = ({ navigation }) => {
  // useRef ensures the same Animated.Value instance is used across re-renders.
  // Without this, useEffect animates the first render's value while the JSX
  // reads a brand-new (frozen at 0deg) value created on every re-render.
  const outerSpinValue = React.useRef(new Animated.Value(0)).current;
  const innerSpinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(
        outerSpinValue,
        {
          toValue: 1,
          duration: 40000,
          easing: Easing.linear,
          useNativeDriver: true,
        }
      )
    ).start();

    Animated.loop(
      Animated.timing(
        innerSpinValue,
        {
          toValue: 1,
          duration: 40000,
          easing: Easing.linear,
          useNativeDriver: true,
        }
      )
    ).start();
  }, []);

  const outerSpin = outerSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const innerSpin = innerSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.container}> 

      {/* Rotating Avatars and Icons */}
      <View style={styles.circleContainer}>
        <Animated.View style={[styles.outerCircle, { transform: [{ rotate: outerSpin }] }]}>
          {avatars.slice(0, 8).map((avatar, index) => {
            const outerRadius = 150; // Half of outerCircle width/height
            const avatarHalfWidth = 25; // Half of avatar width/height
            const effectiveRadius = outerRadius - avatarHalfWidth;

            const angle = (index / 8) * 2 * Math.PI;
            const left = outerRadius + outerRadius * Math.cos(angle) - avatarHalfWidth;
            const top = outerRadius + outerRadius * Math.sin(angle) - avatarHalfWidth;

            const avatarOuterCounterSpin = outerSpinValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '-360deg'], // Counter-rotate avatars
            });
            return (
              <Animated.Image
                key={avatar.id}
                source={{ uri: avatar.uri }}
                style={[
                  styles.avatar,
                  {
                    left: left,
                    top: top,
                    transform: [{ rotate: avatarOuterCounterSpin }],
                  },
                ]}
              />
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.innerCircle, { transform: [{ rotate: innerSpin }] }]}>
          {avatars.slice(8, 12).map((avatar, index) => {
            const innerRadius = 75; // Half of innerCircle width/height
            const avatarHalfWidth = 25; // Half of avatar width/height
            const effectiveRadius = innerRadius - avatarHalfWidth;

            const angle = (index / 4) * 2 * Math.PI;
            const left = innerRadius + innerRadius * Math.cos(angle) - avatarHalfWidth;
            const top = innerRadius + innerRadius * Math.sin(angle) - avatarHalfWidth;

            const avatarInnerCounterSpin = innerSpinValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'], // Counter-rotate avatars
            });
            return (
              <Animated.Image
                key={avatar.id}
                source={{ uri: avatar.uri }}
                style={[
                  styles.avatar,
                  {
                    left: left,
                    top: top,
                    transform: [{ rotate: avatarInnerCounterSpin }],
                  },
                ]}
              />
            );
          })}
        </Animated.View>
      </View>

      {/* Text Content */}
      <View style={styles.textContent}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Logo size={120} />
        </View>
        <Text style={styles.logoText}>Where intention becomes connection.</Text>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darker,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  statusBarPlaceholder: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
 
  circleContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 50,
  },
  outerCircle: {
    width: 300,
    height: 300,
    borderRadius: RADII.circle,
    borderWidth: 1,
    borderColor: COLORS.light,
    position: 'absolute',
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: RADII.circle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: RADII.pill / 2,
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.light,
  },

  textContent: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    color: COLORS.light,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoSup: {
    fontSize: 12,
    verticalAlign: 'super',
  },
  title: {
    color: COLORS.light,
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: COLORS.light,
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: RADII.largeRounded,
  },
  buttonText: {
    color: COLORS.darker,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LandingScreen;