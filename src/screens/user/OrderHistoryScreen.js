import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ref, onValue, update } from 'firebase/database';
import { database, auth } from '../../config/FirebaseConfig';
import TrackingLocation from '../../utils/TrackingLocation';
import { StatusBadge } from '../../components/StatusBadge';
import { InfoChip } from '../../components/InfoChip';
import { fmtDate } from '../../utils/dateFormatter';
import C from '../../theme/colors';

const OrderHistoryScreen = () => {
  const { top } = useSafeAreaInsets();

  const [dataPeminjaman, setDataPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('aktif');
  const [trackingId, setTrackingId] = useState(null);

  useEffect(() => {
    const unsub = onValue(ref(database, 'peminjaman'), snapshot => {
      const data = snapshot.val();
      if (data) {
        const all = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setDataPeminjaman(all.filter(item => item.uid_penyewa === auth.currentUser?.uid));
      } else {
        setDataPeminjaman([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const batalPinjam = (id, namaMotor) => {
    Alert.alert(
      'Batalkan Pesanan',
      `Yakin ingin membatalkan pesanan ${namaMotor}? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: () => {
            update(ref(database, `peminjaman/${id}`), { status: 'dibatalkan', batalAt: Date.now() });
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (!trackingId) return;
    const trackedItem = dataPeminjaman.find(i => i.id === trackingId);
    if (!trackedItem || trackedItem.status === 'selesai' || trackedItem.status === 'dibatalkan') {
      setTrackingId(null);
    }
  }, [dataPeminjaman, trackingId]);

  const handleTerimaMotor = (itemId) => {
    Alert.alert(
      'Konfirmasi Penerimaan Motor',
      'Dengan menekan "Terima & Bagikan", Anda mengkonfirmasi sudah menerima motor dan menyetujui berbagi lokasi secara real-time kepada admin selama masa sewa berlangsung.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terima & Bagikan',
          onPress: () => {
            update(ref(database, `peminjaman/${itemId}`), { trackingAktif: true });
            setTrackingId(itemId);
          },
        },
      ]
    );
  };

  const filteredData = dataPeminjaman.filter(item =>
    activeTab === 'aktif'
      ? item.status === 'dipinjam'
      : item.status === 'selesai' || item.status === 'dibatalkan'
  );

  const aktifCount = dataPeminjaman.filter(i => i.status === 'dipinjam').length;
  const selesaiCount = dataPeminjaman.filter(i => i.status === 'selesai' || i.status === 'dibatalkan').length;

  const renderItem = ({ item }) => {
    const isAktif = item.status === 'dipinjam';
    const isTracking = trackingId === item.id;

    return (
      <View style={s.card}>
        <View style={s.cardTopRow}>
          <StatusBadge status={item.status} />
          <Text style={s.cardDate}>{fmtDate(item.startDate)} – {fmtDate(item.endDate)}</Text>
        </View>

        <Text style={s.motorName}>{item.nama_motor || item.plat_motor}</Text>

        <View style={s.chipRow}>
          <InfoChip label="Plat" value={item.plat_motor} />
          <InfoChip label="Durasi" value={`${item.lama_pinjam} hr`} />
          <InfoChip label="Helm" value={`${item.jumlah_helm}`} />
          <InfoChip label="Metode" value={item.metode_pengambilan === 'antar' ? 'Antar' : 'Ambil'} />
        </View>

        {isAktif && (
          isTracking ? (
            item.trackingAktif === false ? (
              <View style={s.btnTrackingPaused}>
                <Text style={s.btnTrackingPausedTxt}>● Berbagi lokasi dijeda oleh admin</Text>
                <Text style={s.btnTrackingSub}>Akan dilanjutkan kembali oleh admin</Text>
              </View>
            ) : (
              <View style={s.btnTracking}>
                <Text style={s.btnTrackingTxt}>● Sedang Berbagi Lokasi</Text>
                <Text style={s.btnTrackingSub}>Otomatis berhenti saat pesanan selesai</Text>
              </View>
            )
          ) : (
            <View style={s.userBtnCol}>
              <TouchableOpacity
                style={[s.btnFill, { backgroundColor: C.primary }]}
                onPress={() => handleTerimaMotor(item.id)}
                activeOpacity={0.85}
              >
                <Text style={[s.btnFillTxt, { color: C.dark }]}>Motor Telah Diterima</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.btnBatal}
                onPress={() => batalPinjam(item.id, item.nama_motor || item.plat_motor)}
                activeOpacity={0.8}
              >
                <Text style={s.btnBatalTxt}>Batalkan Pesanan</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {trackingId && <TrackingLocation peminjamanId={trackingId} />}

      <View style={[s.header, { paddingTop: top + 12 }]}>
        <Text style={s.headerTitle}>Riwayat Pesanan</Text>
      </View>

      <View style={s.tabWrap}>
        {[
          { key: 'aktif', label: 'Aktif', count: aktifCount },
          { key: 'selesai', label: 'Selesai', count: selesaiCount },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[s.tabTxt, activeTab === tab.key && s.tabTxtActive]}>{tab.label}</Text>
            {tab.count > 0 && (
              <View style={[s.tabBadge, activeTab === tab.key && s.tabBadgeActive]}>
                <Text style={[s.tabBadgeTxt, activeTab === tab.key && s.tabBadgeTxtActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={s.empty}>Memuat data...</Text>
      ) : filteredData.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>{activeTab === 'aktif' ? '🏍' : '✓'}</Text>
          <Text style={s.empty}>
            {activeTab === 'aktif' ? 'Tidak ada pesanan aktif' : 'Belum ada pesanan selesai'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default OrderHistoryScreen;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: C.dark },

  tabWrap: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    backgroundColor: '#EFEFEF',
  },
  tabActive: { backgroundColor: C.dark },
  tabTxt: { fontSize: 14, fontWeight: '700', color: C.textSecondary },
  tabTxtActive: { color: '#FFFFFF' },
  tabBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: { backgroundColor: C.primary },
  tabBadgeTxt: { fontSize: 11, fontWeight: '800', color: C.textSecondary },
  tabBadgeTxtActive: { color: C.dark },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardDate: { fontSize: 11, color: C.textSecondary, fontWeight: '500' },
  motorName: { fontSize: 17, fontWeight: '800', color: C.dark, marginBottom: 10 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },

  userBtnCol: { gap: 8 },
  btnFill: {
    width: '100%', paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  btnFillTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  btnBatal: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  btnBatalTxt: { color: C.danger, fontWeight: '700', fontSize: 13 },
  btnTracking: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: C.success,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  btnTrackingTxt: { fontSize: 13, fontWeight: '700', color: C.success },
  btnTrackingSub: { fontSize: 11, color: C.success, opacity: 0.7, marginTop: 2 },
  btnTrackingPaused: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#AAAAAA',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  btnTrackingPausedTxt: { fontSize: 13, fontWeight: '700', color: '#666666' },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  empty: { textAlign: 'center', color: C.textSecondary, fontSize: 14, fontWeight: '500' },
});
