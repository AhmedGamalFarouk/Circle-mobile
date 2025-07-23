import { StyleSheet } from 'react-native';
import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Explore = () => {

  const DEFAULT_LOCATION = { latitude: -23.5489, longitude: -46.6388 };
  const DEFAULT_LOCATION = { latitude: 30.0444, longitude: 31.2357 };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}
        initialRegion={{
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
          }}
          image={require('../../assets/favicon.png')}
        />
      </MapView>
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
});