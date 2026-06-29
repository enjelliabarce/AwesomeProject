import { useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import BackgroundService from 'react-native-background-actions';
import { ref, update, onValue } from 'firebase/database';
import { database } from '../config/FirebaseConfig';
import {
  stopNotificationService,
  restartNotificationService,
} from './NotificationBackgroundService';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Di-resolve saat trackingTask benar-benar keluar dari loop-nya.
// Dipakai agar handoff balik ke notif tidak ter-stop oleh auto-stop library.
let _trackingEnded = null;

// Task yang jalan di background (foreground service Android)
const trackingTask = async (taskData) => {
  const { peminjamanId } = taskData;

  // Kirim lokasi awal segera via network location (lebih cepat, andal di emulator)
  Geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude, accuracy, speed } }) => {
      update(ref(database, `peminjaman/${peminjamanId}/lokasi`), {
        latitude,
        longitude,
        accuracy: accuracy ?? 0,
        speed: speed ?? 0,
        updatedAt: Date.now(),
      });
    },
    (err) => console.log('Initial location error:', err.code, err.message),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
  );

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
      distanceFilter: 0,    // kirim update berbasis waktu meski diam
      interval: 15000,      // update setiap 15 detik (hemat vs 2 detik sebelumnya)
      fastestInterval: 10000,
      forceRequestLocation: true,
      showLocationDialog: true,
    }
  );

  // Jaga task tetap hidup selama service berjalan.
  // Interval kecil hanya untuk responsif saat stop — bukan interval GPS
  // (interval GPS diatur di opsi watchPosition di atas).
  while (BackgroundService.isRunning()) {
    await sleep(1500);
  }

  Geolocation.clearWatch(watchId);
  if (_trackingEnded) {
    _trackingEnded();
    _trackingEnded = null;
  }
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
  const isTrackingRef = useRef(false);

  useEffect(() => {
    if (!peminjamanId) return;

    const serviceOptions = {
      taskName: 'MelajuRentTracking',
      taskTitle: 'Berbagi Lokasi Aktif',
      taskDesc: 'Lokasi Anda sedang dibagikan ke admin rental.',
      taskIcon: { name: 'ic_launcher', type: 'mipmap' },
      color: '#F5BC1B',
      foregroundServiceType: ['location'],
      parameters: { peminjamanId },
    };

    const startService = async () => {
      if (isTrackingRef.current) return; // tracking sudah jalan
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Izin Ditolak', 'Aktifkan izin lokasi agar admin dapat melacak motor.');
        return;
      }
      // react-native-background-actions hanya mendukung 1 task global.
      // Hentikan service notifikasi (tunggu benar-benar berhenti) sebelum
      // start tracking — kalau tidak, BackgroundService.start akan diabaikan
      // dan lokasi tidak pernah tertulis ke Firebase.
      await stopNotificationService({ wait: true });
      try {
        await BackgroundService.start(trackingTask, serviceOptions);
        isTrackingRef.current = true;
      } catch (e) {
        console.log('BackgroundService start error:', e);
      }
    };

    const stopService = async () => {
      if (!isTrackingRef.current) return; // bukan kita yang memegang slot
      isTrackingRef.current = false;
      if (BackgroundService.isRunning()) {
        const ended = new Promise((res) => { _trackingEnded = res; });
        await BackgroundService.stop();
        // Tunggu trackingTask benar-benar keluar agar auto-stop library
        // tidak mematikan service notifikasi yang akan di-restart.
        await Promise.race([ended, sleep(2500)]);
        await sleep(150);
      }
      restartNotificationService();
    };

    // Dengarkan flag trackingAktif dari admin di Firebase
    const flagRef = ref(database, `peminjaman/${peminjamanId}/trackingAktif`);
    const unsubscribe = onValue(flagRef, snapshot => {
      // field belum ada (null) dianggap true (default menyala)
      const aktif = snapshot.val() !== false;
      if (aktif) {
        startService();
      } else {
        stopService();
      }
    });

    return () => {
      unsubscribe();
      stopService();
    };
  }, [peminjamanId]);

  return null;
};

export default TrackingLocation;
