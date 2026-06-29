import BackgroundService from 'react-native-background-actions';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/FirebaseConfig';
import { showNotif, CHANNELS } from './NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Simpan credentials agar bisa restart setelah tracking selesai
let _role = null;
let _userId = null;
// Di-resolve saat notifTask benar-benar keluar dari loop-nya (untuk handoff)
let _notifEnded = null;

const notifTask = async (taskData) => {
  const { role, userId } = taskData;

  const notifiedOrders = new Set();
  const notifiedCancelled = new Set();

  // Load ID pesanan selesai yang sudah pernah dinotif (persist across restarts)
  const stored = await AsyncStorage.getItem('notif_completed_ids');
  const notifiedCompleted = new Set(stored ? JSON.parse(stored) : []);

  const peminjamanRef = ref(database, 'peminjaman');

  onValue(peminjamanRef, async snapshot => {
    const val = snapshot.val();
    if (!val) return;

    const now = Date.now();

    for (const [id, data] of Object.entries(val)) {
      if (role === 'admin') {
        // Pesanan baru masuk
        if (
          data.status === 'dipinjam' &&
          data.createdAt &&
          now - data.createdAt < 15_000 &&
          !notifiedOrders.has(id)
        ) {
          notifiedOrders.add(id);
          showNotif(
            CHANNELS.ADMIN,
            'Pesanan Baru Masuk',
            `${data.nama_penyewa || 'Pengguna'} memesan ${data.nama_motor || 'motor'}`,
          );
        }

        // Pesanan dibatalkan user
        if (
          data.status === 'dibatalkan' &&
          data.batalAt &&
          now - data.batalAt < 15_000 &&
          !notifiedCancelled.has(id)
        ) {
          notifiedCancelled.add(id);
          showNotif(
            CHANNELS.ADMIN,
            'Pesanan Dibatalkan',
            `${data.nama_penyewa || 'Pengguna'} membatalkan pesanan ${data.nama_motor || 'motor'}`,
          );
        }
      } else {
        // Peminjaman selesai untuk user ini
        if (
          data.uid_penyewa === userId &&
          data.status === 'selesai' &&
          !notifiedCompleted.has(id)
        ) {
          notifiedCompleted.add(id);
          await AsyncStorage.setItem(
            'notif_completed_ids',
            JSON.stringify([...notifiedCompleted]),
          );
          showNotif(
            CHANNELS.USER,
            'Peminjaman Selesai',
            `Terima kasih! Peminjaman ${data.nama_motor || 'motor'} telah diselesaikan oleh admin.`,
          );
        }
      }
    }
  });

  // Jaga task tetap hidup
  while (BackgroundService.isRunning()) {
    await sleep(1500);
  }

  off(peminjamanRef);
  if (_notifEnded) {
    _notifEnded();
    _notifEnded = null;
  }
};

export const startNotificationService = async (role, userId) => {
  _role = role;
  _userId = userId;

  // Jika sudah ada service lain berjalan (misal: tracking), simpan credentials saja
  // Tracking foreground service sudah menjaga JS thread tetap hidup
  if (BackgroundService.isRunning()) return;

  try {
    await BackgroundService.start(notifTask, {
      taskName: 'MelajuRentNotif',
      taskTitle: 'Melaju Rent',
      taskDesc: 'Menunggu notifikasi pesanan...',
      taskIcon: { name: 'ic_launcher', type: 'mipmap' },
      color: '#F5BC1B',
      foregroundServiceType: ['dataSync'],
      parameters: { role, userId },
    });
  } catch (e) {
    console.log('NotifService start error:', e);
  }
};

// wait: true → handoff ke tracking. Kredensial dipertahankan agar notif bisa
// di-restart setelah tracking selesai, dan kita tunggu task benar-benar keluar
// supaya auto-stop library tidak mematikan tracking yang baru start.
export const stopNotificationService = async ({ wait = false } = {}) => {
  if (!wait) {
    _role = null;
    _userId = null;
  }
  if (!BackgroundService.isRunning()) return;
  const ended = wait ? new Promise((res) => { _notifEnded = res; }) : null;
  await BackgroundService.stop();
  if (ended) {
    await Promise.race([ended, sleep(2500)]);
    _notifEnded = null;
    await sleep(150); // beri jeda agar auto-stop library mereda
  }
};

// Dipanggil oleh TrackingLocation setelah tracking selesai
export const restartNotificationService = async () => {
  if (_role && _userId && !BackgroundService.isRunning()) {
    await startNotificationService(_role, _userId);
  }
};
