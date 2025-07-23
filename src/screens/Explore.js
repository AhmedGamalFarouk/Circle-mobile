import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LeafletView } from 'react-native-leaflet-view';

const Explore = () => {

    const DEFAULT_LOCATION = { latitude: -23.5489, longitude: -46.6388 };

    return (
      <LeafletView
        mapCenterPosition={{
          lat: DEFAULT_LOCATION.latitude,
          lng: DEFAULT_LOCATION.longitude,
        }}
      />
    );
  };

export default Explore

const styles = StyleSheet.create({})