import { useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/FirebaseConfig';
import { showNotif, CHANNELS } from '../utils/NotificationService';

export const useOrderNotifications = (role, userId) => {
  const notifiedOrders = useRef(new Set());
  const notifiedCompleted = useRef(new Set());

  useEffect(() => {
    if (!role || !userId) return;

    const peminjamanRef = ref(database, 'peminjaman');
    onValue(peminjamanRef, snapshot => {
      const val = snapshot.val();
      if (!val) return;

      Object.entries(val).forEach(([id, data]) => {
        if (role === 'admin') {
          if (
            data.status === 'dipinjam' &&
            data.createdAt &&
            Date.now() - data.createdAt < 10_000 &&
            !notifiedOrders.current.has(id)
          ) {
            notifiedOrders.current.add(id);
            showNotif(
              CHANNELS.ADMIN,
              'Pesanan Baru Masuk',
              `${data.nama_penyewa || 'Pengguna'} memesan ${data.nama_motor || 'motor'}`,
            );
          }
        } else {
          if (
            data.uid_penyewa === userId &&
            data.status === 'selesai' &&
            !notifiedCompleted.current.has(id)
          ) {
            notifiedCompleted.current.add(id);
            showNotif(
              CHANNELS.USER,
              'Peminjaman Selesai',
              `Terima kasih! Peminjaman ${data.nama_motor || 'motor'} telah diselesaikan oleh admin.`,
            );
          }
        }
      });
    });

    return () => off(peminjamanRef);
  }, [role, userId]);
};
