import React from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import useCurrentLocation from '../hooks/useCurrentLocation';
import { COLORS } from '../constants/constants';

const circles = [
  {
    id: 1,
    name: "cairo dogs club",
    lat: 30.06263,
    lng: 31.24967,
  },
  {
    id: 2,
    name: "cairo developers hub",
    lat: 30.36166,
    lng: 31.35255,
  },
  {
    id: 3,
    name: "cairo cats lovers",
    lat: 30.13333,
    lng: 31.25,
  },
  {
    id: 4,
    name: "motorbike group",
    lat: 30.1,
    lng: 31.7,
  },
  {
    id: 5,
    name: "cairo developers hub",
    lat: 30,
    lng: 31,
  },
];

const CircleCallout = React.memo(({ circle, onJoin }) => (
  <View style={styles.calloutContent} accessible accessibilityLabel={`Circle: ${circle.name}`}>
    <Text style={styles.calloutTitle}>{circle.name}</Text>
    <Text style={styles.calloutText}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</Text>
    <Button title="Join" onPress={onJoin} />
  </View>
));

const Explore = () => {
  const { location, error } = useCurrentLocation();

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Error: {error.message || 'Failed to get location.'}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {circles.map((circle) => (
        <Marker
          key={circle.id}
          coordinate={{
            latitude: circle.lat,
            longitude: circle.lng,
          }}
          image={require('../../assets/circle.gif')}
          accessibilityLabel={`Marker for ${circle.name}`}
        >
          <Callout style={styles.calloutContainer} tooltip={false}>
            <CircleCallout circle={circle} onJoin={() => { /* handle join */ }} />
          </Callout>
        </Marker>
      ))}
    </MapView>
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
    backgroundColor: COLORS.darker,
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
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'normal',
    marginBottom: 8,
    textAlign: 'center',
  },
});