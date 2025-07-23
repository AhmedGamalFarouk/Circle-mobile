import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LeafletView } from 'react-native-leaflet-view';
import '../../assets/leaflet.html'


const Explore = () => {

    const DEFAULT_LOCATION = { latitude: -23.5489, longitude: -46.6388 };

    return (
      <LeafletView
          mapCenterPosition={{
            lat: DEFAULT_LOCATION.latitude,
            lng: DEFAULT_LOCATION.longitude,
          }}
          mapLayers={[
            {
              baseLayer: true,
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              minNativeZoom: 11,
              maxNativeZoom: 18,
              minZoom: 11,
              maxZoom: 20,
            },
          ]}
          mapMarkers={[
            {
              id: 'my-marker',
              position: { lat: DEFAULT_LOCATION.latitude, lng: DEFAULT_LOCATION.longitude },
              icon: 'https://cdn-icons-png.flaticon.com/64/2776/2776067.png',
              size: [64, 64],
              iconAnchor: [32, 64],
            },
          ]}
          onMessage={(message) => console.log('Message from Leaflet:', message)}
        />
      );
  };

export default Explore

const styles = StyleSheet.create({})