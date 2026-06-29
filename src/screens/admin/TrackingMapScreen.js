import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/FirebaseConfig';
import { showNotif, CHANNELS } from '../../utils/NotificationService';

const CENTER_LAT = -7.799134060320984;
const CENTER_LNG = 110.3726333995719;
const RADIUS_KM = 5;

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function TrackingMapScreen({ route }) {
  const webViewRef = useRef(null);
  const peminjamanId = route?.params?.peminjamanId ?? null;
  const [webViewReady, setWebViewReady] = useState(false);

  // { [id]: { lat, lng, acc, speed, namaMotor, platMotor } }
  const activeMotors = useRef({});
  const pendingUpdates = useRef([]);  // buffer sebelum WebView siap
  const hasCentered = useRef(false);
  const geofenceAlerted = useRef({});  // { [id]: timestamp }
  const gpsOffAlerted = useRef({});    // { [id]: timestamp }

  const injectJS = (js) => {
    webViewRef.current?.injectJavaScript(js + '; true;');
  };

  const processUpdate = (id, lat, lng, acc, speed, label) => {
    injectJS(`window.updateMarker('${id}', ${lat}, ${lng}, ${acc}, ${speed}, '${label}')`);
  };

  useEffect(() => {
    const peminjamanRef = ref(database, 'peminjaman');

    const unsubscribe = onValue(peminjamanRef, snapshot => {
      const val = snapshot.val();
      if (!val) return;

      // Hapus marker motor yang sudah selesai
      Object.keys(activeMotors.current).forEach(id => {
        if (!val[id] || val[id].status !== 'dipinjam') {
          if (webViewReady) {
            injectJS(`window.removeMarker('${id}')`);
          }
          delete activeMotors.current[id];
        }
      });

      // Update/tambah marker motor aktif
      Object.entries(val).forEach(([id, data]) => {
        if (data.status !== 'dipinjam' || !data.lokasi) return;

        const { latitude: lat, longitude: lng, accuracy: acc, speed, updatedAt } = data.lokasi;
        const namaMotor = data.nama_motor ?? data.namaMotor ?? 'Motor';
        const platMotor = data.plat_motor ?? data.platMotor ?? '';
        const label = platMotor ? `${namaMotor} · ${platMotor}` : namaMotor;
        const trackingAktif = data.trackingAktif !== false;

        // Simpan state lokal termasuk updatedAt dan flag trackingAktif
        activeMotors.current[id] = { lat, lng, acc: acc ?? 0, speed: speed ?? 0, namaMotor, platMotor, updatedAt: updatedAt ?? Date.now(), trackingAktif };

        // Geofence check
        const dist = haversineKm(CENTER_LAT, CENTER_LNG, lat, lng);
        const lastAlert = geofenceAlerted.current[id] || 0;
        if (dist > RADIUS_KM && Date.now() - lastAlert > 5 * 60 * 1000) {
          geofenceAlerted.current[id] = Date.now();
          showNotif(
            CHANNELS.ADMIN,
            'Motor Keluar Area',
            `${namaMotor}${platMotor ? ' (' + platMotor + ')' : ''} berada ${dist.toFixed(1)} km dari titik pusat.`,
          );
        }

        if (webViewReady) {
          processUpdate(id, lat, lng, acc ?? 0, speed ?? 0, label);

          // Centering hanya sekali
          if (!hasCentered.current) {
            hasCentered.current = true;
            if (peminjamanId) {
              // Center ke motor yang dipilih
              if (id === peminjamanId) {
                injectJS(`window.centerOnMotor(${lat}, ${lng})`);
              }
            } else {
              // Tunggu semua motor ter-update dulu, lalu fitAll
              setTimeout(() => injectJS('window.fitAllMotors()'), 300);
            }
          }
        } else {
          pendingUpdates.current.push({ id, lat, lng, acc: acc ?? 0, speed: speed ?? 0, label });
        }
      });

      // Update info panel
      if (webViewReady) {
        const count = Object.keys(activeMotors.current).length;
        const countLabel = count === 0 ? 'Tidak ada motor aktif' : `${count} motor dipantau`;
        injectJS(`document.getElementById('info-panel').innerHTML = '<div><span class=\\"live-dot\\"></span>${countLabel}</div>'`);
      }
    });

    // GPS staleness checker — cek setiap 30 detik (interval GPS naik jadi 15 dtk)
    const staleChecker = setInterval(() => {
      Object.entries(activeMotors.current).forEach(([id, motor]) => {
        // Jangan alert jika admin sengaja mematikan tracking
        if (!motor.trackingAktif) return;
        const stale = Date.now() - (motor.updatedAt || 0) > 60_000;
        const lastGpsAlert = gpsOffAlerted.current[id] || 0;
        if (stale && Date.now() - lastGpsAlert > 5 * 60 * 1000) {
          gpsOffAlerted.current[id] = Date.now();
          showNotif(
            CHANNELS.ADMIN,
            'GPS Motor Mati',
            `Sinyal GPS ${motor.namaMotor} (${motor.platMotor}) tidak update lebih dari 1 menit.`,
          );
        }
      });
    }, 30_000);

    return () => {
      unsubscribe();
      clearInterval(staleChecker);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webViewReady, peminjamanId]);

  const handleWebViewReady = () => {
    setWebViewReady(true);

    // Flush pending updates
    if (pendingUpdates.current.length > 0) {
      pendingUpdates.current.forEach(({ id, lat, lng, acc, speed, label }) => {
        processUpdate(id, lat, lng, acc, speed, label);
      });

      // Center setelah flush
      if (!hasCentered.current) {
        hasCentered.current = true;
        if (peminjamanId) {
          const motor = activeMotors.current[peminjamanId];
          if (motor) {
            injectJS(`window.centerOnMotor(${motor.lat}, ${motor.lng})`);
          }
        } else {
          setTimeout(() => injectJS('window.fitAllMotors()'), 300);
        }
      }

      pendingUpdates.current = [];
    }
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  * { box-sizing: border-box; }
  html, body, #map { height: 100%; margin: 0; padding: 0; }

  #info-panel {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 999;
    background: rgba(15,15,15,0.88);
    backdrop-filter: blur(12px);
    color: white;
    padding: 12px 18px;
    border-radius: 18px;
    font-family: -apple-system, sans-serif;
    font-size: 13px;
    text-align: center;
    min-width: 200px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .live-dot {
    display: inline-block;
    width: 8px; height: 8px; border-radius: 50%;
    background: #4ade80;
    animation: pulse 1.5s infinite;
    margin-right: 6px;
    vertical-align: middle;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  #center-btn {
    position: absolute; top: 16px; right: 16px; z-index: 999;
    background: white;
    border: none;
    width: 42px; height: 42px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    font-size: 18px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }

  .leaflet-tooltip {
    background: rgba(15,15,15,0.85);
    border: none;
    color: white;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 8px;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  }
  .leaflet-tooltip::before { display: none; }
</style>
</head>
<body>
<div id="map"></div>
<div id="info-panel"><span style="color:rgba(255,255,255,0.5)">Menunggu lokasi...</span></div>
<button id="center-btn" onclick="fitAll()">📍</button>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('map', { zoomControl: false }).setView([-7.799134060320984, 110.3726333995719], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap'
  }).addTo(map);

  // Titik pusat geofence — lingkaran radius 5km
  L.circle([-7.799134060320984, 110.3726333995719], {
    radius: 5000,
    color: '#F5BC1B',
    fillColor: '#F5BC1B',
    fillOpacity: 0.12,
    weight: 2,
    opacity: 0.6,
  }).addTo(map);

  const motorIcon = L.divIcon({
    className: '',
    html: \`<div style="
      width:20px;height:20px;border-radius:50%;
      background:#F5BC1B;border:3px solid #fff;
      box-shadow:0 0 0 4px rgba(245,188,27,0.35), 0 2px 8px rgba(0,0,0,0.3);
    "></div>\`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    tooltipAnchor: [0, -14],
  });

  const markers = {};

  window.updateMarker = function(id, lat, lng, acc, speed, label) {
    if (!markers[id]) {
      markers[id] = L.marker([lat, lng], { icon: motorIcon }).addTo(map);
      markers[id].bindTooltip(label, {
        permanent: true,
        direction: 'top',
        offset: [0, -4],
        className: '',
      });
    }
    markers[id].setLatLng([lat, lng]);
  };

  window.removeMarker = function(id) {
    if (markers[id]) {
      map.removeLayer(markers[id]);
      delete markers[id];
    }
  };

  window.centerOnMotor = function(lat, lng) {
    map.flyTo([lat, lng], 17, { duration: 1.5 });
  };

  window.fitAllMotors = function() {
    const all = Object.values(markers);
    if (all.length === 0) return;
    if (all.length === 1) { map.setView(all[0].getLatLng(), 16); return; }
    const group = L.featureGroup(all);
    map.fitBounds(group.getBounds().pad(0.3));
  };

  function fitAll() {
    window.fitAllMotors();
  }
</script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={handleWebViewReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
