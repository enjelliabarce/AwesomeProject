import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const MapTest = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -6.200000,
          longitude: 106.816666,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* OPENSTREETMAP TILE */}
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        <Marker
          coordinate={{
            latitude: -6.200000,
            longitude: 106.816666,
          }}
          title="Motor Aktif"
          description="OpenStreetMap"
        />
      </MapView>
    </View>
  );
};

export default MapTest;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
