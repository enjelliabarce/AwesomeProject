import { useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import BackgroundService from 'react-native-background-actions';
import { ref, update } from 'firebase/database';
import { database } from '../config/FirebaseConfig';
import { restartNotificationService } from './NotificationBackgroundService';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Task yang jalan di background (foreground service Android)
const trackingTask = async (taskData) => {
  const { peminjamanId } = taskData;

  const watchId = Geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy, speed } = position.coords;
      update(ref(database, `peminjaman/${peminjamanId}/lokasi`), {
        latitude,
        longitude,
        accuracy: accuracy ?? 0,
        speed: speed ?? 0,
        updatedAt: Date.now(),
      });
    },
    (error) => console.log('BG tracking error:', error.code, error.message),
    {
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: 2000,
      fastestInterval: 1000,
      forceRequestLocation: true,
      showLocationDialog: true,
    }
  );

  // Jaga task tetap hidup selama service berjalan
  while (BackgroundService.isRunning()) {
    await sleep(2000);
  }

  Geolocation.clearWatch(watchId);
};

const requestPermissions = async () => {
  if (Platform.OS === 'ios') {
    const result = await Geolocation.requestAuthorization('whenInUse');
    return result === 'granted';
  }

  // Android: cukup minta foreground location
  // Background location (Allow all the time) harus di-set manual di Settings
  const fg = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Izin Lokasi',
      message: 'Aplikasi membutuhkan akses lokasi untuk berbagi posisi motor ke admin.',
      buttonPositive: 'Izinkan',
      buttonNegative: 'Tolak',
    }
  );

  return fg === PermissionsAndroid.RESULTS.GRANTED;
};

const TrackingLocation = ({ peminjamanId }) => {
  useEffect(() => {
    if (!peminjamanId) return;

    const start = async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Izin Ditolak', 'Aktifkan izin lokasi agar admin dapat melacak motor.');
        return;
      }

      const options = {
        taskName: 'MelajuRentTracking',
        taskTitle: 'Berbagi Lokasi Aktif',
        taskDesc: 'Lokasi Anda sedang dibagikan ke admin rental.',
        taskIcon: { name: 'ic_launcher', type: 'mipmap' },
        color: '#F5BC1B',
        foregroundServiceType: ['location'],
        parameters: { peminjamanId },
      };

      try {
        await BackgroundService.start(trackingTask, options);
      } catch (e) {
        console.log('BackgroundService start error:', e);
      }
    };

    start();

    return () => {
      BackgroundService.stop().then(() => restartNotificationService());
    };
  }, [peminjamanId]);

  return null;
};

export default TrackingLocation;
