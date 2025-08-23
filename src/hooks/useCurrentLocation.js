import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export default function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null); // Clear previous errors

    if (Platform.OS === 'android' && !Device.isDevice) {
      setErrorMsg(
        'Location services are not available in the emulator. Please test on a physical device.'
      );
      setIsLoading(false);
      return;
    }

    try {
      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        setErrorMsg('Location services are disabled. Please enable location services in your device settings and try again.');
        setIsLoading(false);
        return;
      }

      // Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Please grant location access in your device settings to view nearby events.');
        setIsLoading(false);
        return;
      }

      setHasLocationPermission(true);

      // Get current location with timeout and accuracy settings
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // 15 second timeout
        maximumAge: 60000, // Accept cached location up to 1 minute old
      });
      
      setLocation(currentLocation);
      setErrorMsg(null); // Clear any previous errors

      // Reverse geocoding to get location name
      try {
        let geocode = await Location.reverseGeocodeAsync(currentLocation.coords);
        if (geocode && geocode.length > 0) {
          const { district, subregion, city, region } = geocode[0];
          const primaryLocation = district || subregion || region || city;
          const addressParts = [primaryLocation].filter(Boolean);
          setLocationName(addressParts.join(', '));
        } else {
          setLocationName('Unknown location');
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed:', geocodeError);
        setLocationName('Location found');
      }

    } catch (error) {
      console.error("Error getting location:", error);
      
      // Provide more specific error messages based on error type
      if (error.message?.includes('Location request timed out')) {
        setErrorMsg('Location request timed out. Please check your GPS signal and try again.');
      } else if (error.message?.includes('Location provider is unavailable')) {
        setErrorMsg('Location services are currently unavailable. Please check your device settings and try again.');
      } else if (error.message?.includes('Network')) {
        setErrorMsg('Network error while getting location. Please check your internet connection.');
      } else {
        setErrorMsg('Unable to get your current location. Please ensure location services are enabled and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryLocation = () => {
    getCurrentLocation();
  };

  return { 
    location, 
    locationName, 
    error: errorMsg ? { message: errorMsg } : null, // Keep compatibility with existing error handling
    errorMsg, 
    isLoading, 
    hasLocationPermission,
    getCurrentLocation,
    retryLocation
  };
}