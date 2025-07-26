import { useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export default function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null); // Clear previous errors

    if (Platform.OS === 'android' && !Device.isDevice) {
      setErrorMsg(
        'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
      );
      setIsLoading(false);
      return;
    }

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Reverse geocoding to get location name
      let geocode = await Location.reverseGeocodeAsync(currentLocation.coords);
      if (geocode && geocode.length > 0) {
        console.log("Full Location Details:", geocode[0]); // Log full details
        const { district, subregion, city, region } = geocode[0]; // Removed country from destructuring
        const primaryLocation = district || subregion || region || city;
        const addressParts = [primaryLocation].filter(Boolean); // Removed country from addressParts
        setLocationName(addressParts.join(', '));
      } else {
        setLocationName('Unknown location');
      }

    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMsg('Failed to get location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { location, locationName, errorMsg, isLoading, getCurrentLocation };
}