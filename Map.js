import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<style>
  html, body, #map {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .control-btn {
    position: absolute;
    bottom: 20px;
    right: 15px;
    z-index: 999;
    background: white;
    padding: 10px 14px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,.25);
    font-family: sans-serif;
    font-size: 14px;
    cursor: pointer;
  }

  .info-box {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    background: rgba(0,0,0,.7);
    color: white;
    padding: 8px 14px;
    border-radius: 12px;
    font-family: monospace;
    font-size: 12px;
  }
</style>
</head>

<body>
<div id="map"></div>
<div class="info-box" id="info">Waiting for GPS...</div>
<div class="control-btn" onclick="centerMap()">📍 Center</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
  const map = L.map('map', { zoomControl: false }).setView([-6.2, 106.816666], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const userIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  let marker = L.marker([-6.2, 106.816666], {
    icon: userIcon
  }).addTo(map);

  let accuracyCircle = L.circle([-6.2, 106.816666], {
    radius: 0,
    color: '#1e90ff',
    fillColor: '#1e90ff',
    fillOpacity: 0.15
  }).addTo(map);

  function updateInfo(lat, lng, acc) {
    document.getElementById("info").innerHTML =
      "Lat: " + lat.toFixed(6) + "<br/>Lng: " + lng.toFixed(6) +
      "<br/>Accuracy: ±" + Math.round(acc) + " m";
  }

  function centerMap() {
    map.flyTo(marker.getLatLng(), 17, { duration: 1 });
  }

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        marker.setLatLng([lat, lng]);
        accuracyCircle.setLatLng([lat, lng]);
        accuracyCircle.setRadius(acc);

        updateInfo(lat, lng, acc);
      },
      (err) => alert(err.message),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
  } else {
    alert("Geolocation not supported");
  }
</script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});