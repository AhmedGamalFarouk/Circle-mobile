import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Linking, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import useCurrentLocation from '../hooks/useCurrentLocation';
import { COLORS } from '../constants/constants';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import useAuth from '../hooks/useAuth';
import * as Location from 'expo-location';

// Extract address from a Google Maps search URL like
// https://www.google.com/maps/search/?api=1&query=o's%20pasta
const extractAddressFromMapsUrl = (mapsUrl) => {
  try {
    const url = new URL(mapsUrl);
    const queryParam = url.searchParams.get('query');
    return queryParam ? decodeURIComponent(queryParam) : null;
  } catch (e) {
    return null;
  }
};

const EventCallout = React.memo(({ marker, onOpen }) => (
  <View style={styles.calloutContent} accessible accessibilityLabel={`Event: ${marker.title}`}>
    <Text style={styles.calloutTitle}>{marker.title}</Text>
    {marker.address ? (
      <Text style={styles.calloutText} numberOfLines={2}>{marker.address}</Text>
    ) : null}
    <TouchableOpacity style={styles.calloutButton} onPress={onOpen}>
      <Text style={styles.calloutButtonText}>View details</Text>
    </TouchableOpacity>
  </View>
));

const Explore = ({ navigation }) => {
  const { location, error } = useCurrentLocation();
  const { colors } = useTheme()
  const { user } = useAuth();
  const [eventMarkers, setEventMarkers] = useState([]);
  const geocodeCacheRef = useRef(new Map());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  useEffect(() => {
    let unsubscribers = [];

    const subscribeToJoinedCirclesEvents = async () => {
      if (!user?.uid) {
        setEventMarkers([]);
        return;
      }

      try {
        const userDocSnap = await getDoc(doc(db, 'users', user.uid));
        const joinedCircleIds = userDocSnap.exists() ? (userDocSnap.data().joinedCircles || []) : [];

        if (!Array.isArray(joinedCircleIds) || joinedCircleIds.length === 0) {
          setEventMarkers([]);
          return;
        }

        joinedCircleIds.forEach((circleId) => {
          const eventsRef = collection(db, 'circles', circleId, 'events');
          const unsubscribe = onSnapshot(eventsRef, async (snapshot) => {
            const eventsWithLocation = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              // Include ALL events from joined circles
              if (data) {
                eventsWithLocation.push({ id: docSnap.id, circleId, ...data });
              }
            });

            const markers = await Promise.all(eventsWithLocation.map(async (evt) => {
              // Try different location fields in order of preference
              let address = '';
              if (evt.Location) {
                address = extractAddressFromMapsUrl(evt.Location) || evt.place || evt.location || '';
              } else if (evt.place) {
                address = evt.place;
              } else if (evt.location) {
                address = evt.location;
              }
              
              let coords = null;
              
              if (address) {
                coords = geocodeCacheRef.current.get(address);
                if (!coords) {
                  try {
                    const results = await Location.geocodeAsync(address);
                    if (results && results.length > 0) {
                      coords = { latitude: results[0].latitude, longitude: results[0].longitude };
                      geocodeCacheRef.current.set(address, coords);
                    } else {
                      // Geocoding failed, will use fallback
                    }
                  } catch (e) {
                    // Geocoding error, will use fallback
                  }
                }
              }
              
              // Fallback to user's current location or default Cairo location
              if (!coords) {
                if (location?.coords) {
                  coords = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                  };
                } else {
                  coords = { latitude: 30.06263, longitude: 31.24967 }; // Default Cairo
                }
              }

              return {
                id: `${circleId}_${evt.id}`,
                circleId,
                title: evt.place || evt.activity || evt.title || 'Event',
                address: address || 'Location TBD',
                locationUrl: evt.Location || null,
                activity: evt.activity || null,
                place: evt.place || null,
                day: evt.day || null,
                status: evt.status || null,
                latitude: coords.latitude,
                longitude: coords.longitude,
              };
            }));

            const validMarkers = markers.filter(Boolean);

            setEventMarkers((prev) => {
              const others = prev.filter((m) => m.circleId !== circleId);
              const newOnes = validMarkers;
              return [...others, ...newOnes];
            });
          });

          unsubscribers.push(unsubscribe);
        });
      } catch (e) {
        console.error('Failed to subscribe to events for joined circles:', e);
        setEventMarkers([]);
      }
    };

    subscribeToJoinedCirclesEvents();

    return () => {
      unsubscribers.forEach((u) => {
        try { if (typeof u === 'function') u(); } catch (_) {}
      });
    };
  }, [user?.uid]);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader
          title="Explore"
          navigation={navigation}
        />
        <View style={[styles.loading, { backgroundColor: colors.background }]}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Error: {error.message || 'Failed to get location.'}</Text>
        </View>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader
          title="Explore"
          navigation={navigation}
        />
        <View style={[styles.loading, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        title="Explore"
        navigation={navigation}
      />
      <MapView
        style={[styles.map, { backgroundColor: colors.background }]}
        initialRegion={{
          latitude: location.coords.latitude || 30.06263,
          longitude: location.coords.longitude || 31.25,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {eventMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            image={require('../../assets/circle.gif')}
            accessibilityLabel={`Marker for ${marker.title}`}
            onPress={() => { setSelectedEvent(marker); setIsDetailsVisible(true); }}
          >

          </Marker>
        ))}
      </MapView>

      <Modal
        visible={isDetailsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsDetailsVisible(false)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsDetailsVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { backgroundColor: colors.background, }]}>
            {selectedEvent ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedEvent.title}</Text>
                {selectedEvent.activity ? (
                  <Text style={[styles.modalRow, { color: colors.textSecondary }]}>Activity: {selectedEvent.activity}</Text>
                ) : null}
                {selectedEvent.place ? (
                  <TouchableOpacity onPress={() => { if (selectedEvent.locationUrl) Linking.openURL(selectedEvent.locationUrl); }}>
                    <Text style={[styles.modalRow, { color: colors.primary }]}>Place: {selectedEvent.place} (open in Maps)</Text>
                  </TouchableOpacity>
                ) : null}
                {selectedEvent.day ? (
                  <Text style={[styles.modalRow, { color: colors.textSecondary }]}>Day: {selectedEvent.day}</Text>
                ) : null}
                {selectedEvent.status ? (
                  <Text style={[styles.modalRow, { color: colors.textSecondary }]}>Status: {selectedEvent.status}</Text>
                ) : null}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={() => { if (selectedEvent?.locationUrl) Linking.openURL(selectedEvent.locationUrl); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Open in Maps</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.surface }]}
                    onPress={() => setIsDetailsVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.text }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
  },
  calloutContainer: {
    width: 180,
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.darker,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    height: '100%',
  },
  calloutTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    fontWeight: 'normal',
    marginBottom: 8,
    textAlign: 'center',
  },
  calloutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  calloutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalRow: {
    fontSize: 14,
    marginBottom: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});