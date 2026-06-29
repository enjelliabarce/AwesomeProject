import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Image, StatusBar, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../config/FirebaseConfig';
import { StatusBadge } from '../../components/StatusBadge';
import { InfoChip } from '../../components/InfoChip';
import { fmtDate } from '../../utils/dateFormatter';
import C from '../../theme/colors';

const AdminOrderHistoryScreen = ({ navigation }) => {
  const { top } = useSafeAreaInsets();

  const [dataPeminjaman, setDataPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('aktif');
  const [searchQuery, setSearchQuery] = useState('');
  const [ktpModal, setKtpModal] = useState(null);

  useEffect(() => {
    const unsub = onValue(ref(database, 'peminjaman'), snapshot => {
      const data = snapshot.val();
      if (data) {
        setDataPeminjaman(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setDataPeminjaman([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const selesaiPinjam = (id) => {
    update(ref(database, `peminjaman/${id}`), { status: 'selesai', selesaiAt: Date.now() });
  };

  const filteredData = dataPeminjaman
    .filter(item => activeTab === 'aktif'
      ? item.status === 'dipinjam'
      : item.status === 'selesai' || item.status === 'dibatalkan')
    .filter(item => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.nama_motor?.toLowerCase().includes(q) ||
        item.plat_motor?.toLowerCase().includes(q) ||
        item.nama_penyewa?.toLowerCase().includes(q)
      );
    });

  const aktifCount = dataPeminjaman.filter(i => i.status === 'dipinjam').length;
  const selesaiCount = dataPeminjaman.filter(i => i.status === 'selesai' || i.status === 'dibatalkan').length;

  const renderItem = ({ item }) => {
    const isAktif = item.status === 'dipinjam';

    return (
      <View style={s.card}>
        <View style={s.cardTopRow}>
          <StatusBadge status={item.status} />
          <Text style={s.cardDate}>{fmtDate(item.startDate)} – {fmtDate(item.endDate)}</Text>
        </View>

        <Text style={s.penyewa}>{item.nama_penyewa}</Text>
        <Text style={s.motorName}>{item.nama_motor || item.plat_motor}</Text>

        <View style={s.chipRow}>
          <InfoChip label="Plat" value={item.plat_motor} />
          <InfoChip label="Durasi" value={`${item.lama_pinjam} hr`} />
          <InfoChip label="Helm" value={`${item.jumlah_helm}`} />
          <InfoChip label="Metode" value={item.metode_pengambilan === 'antar' ? 'Antar' : 'Ambil'} />
        </View>

        <TouchableOpacity
          style={[s.btnOutline, !item.ktp_url && s.btnDisabled]}
          onPress={() => item.ktp_url && setKtpModal(item.ktp_url)}
          disabled={!item.ktp_url}
        >
          <Text style={[s.btnOutlineTxt, !item.ktp_url && { color: C.textSecondary }]}>
            {item.ktp_url ? 'Lihat KTP' : 'KTP Tidak Tersedia'}
          </Text>
        </TouchableOpacity>

        {isAktif && (
          <>
            <View style={s.trackingRow}>
              <Text style={s.trackingLabel}>GPS Tracking</Text>
              <View style={s.trackingRight}>
                <Text style={[s.trackingStatus, { color: item.trackingAktif !== false ? C.success : '#AAAAAA' }]}>
                  {item.trackingAktif !== false ? 'Aktif' : 'Dimatikan'}
                </Text>
                <Switch
                  value={item.trackingAktif !== false}
                  onValueChange={(v) =>
                    update(ref(database, `peminjaman/${item.id}`), { trackingAktif: v })
                  }
                  trackColor={{ false: '#DDDDDD', true: C.success + '66' }}
                  thumbColor={item.trackingAktif !== false ? C.success : '#BBBBBB'}
                />
              </View>
            </View>
            <View style={s.btnRow}>
              <TouchableOpacity
                style={[s.btnFill, { backgroundColor: '#0EA5E9' }]}
                onPress={() => navigation.navigate('Peta', { peminjamanId: item.id })}
              >
                <Text style={s.btnFillTxt}>Lacak Motor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnFill, { backgroundColor: C.success }]}
                onPress={() => selesaiPinjam(item.id)}
              >
                <Text style={s.btnFillTxt}>Selesaikan</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Modal visible={!!ktpModal} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setKtpModal(null)}>
        <TouchableOpacity style={s.ktpOverlay} activeOpacity={1} onPress={() => setKtpModal(null)}>
          <Image source={{ uri: ktpModal }} style={s.ktpImage} resizeMode="contain" />
          <Text style={s.ktpClose}>Tap untuk tutup</Text>
        </TouchableOpacity>
      </Modal>

      <View style={[s.header, { paddingTop: top + 12 }]}>
        <Text style={s.headerTitle}>Semua Pesanan</Text>
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

      <View style={s.searchWrap}>
        <Text style={s.searchIco}>⌕</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Cari motor, plat, atau penyewa..."
          placeholderTextColor={C.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
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

export default AdminOrderHistoryScreen;

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

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIco: { fontSize: 18, color: C.textSecondary, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: C.dark },
  clearBtn: { color: C.textSecondary, fontSize: 14, padding: 4 },

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
  penyewa: { fontSize: 12, color: C.textSecondary, marginBottom: 2 },
  motorName: { fontSize: 17, fontWeight: '800', color: C.dark, marginBottom: 10 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },

  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
  },
  trackingLabel: { fontSize: 13, fontWeight: '700', color: C.dark },
  trackingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackingStatus: { fontSize: 12, fontWeight: '600' },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btnFill: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  btnFillTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  btnOutline: {
    borderWidth: 1.5, borderColor: C.primary,
    borderRadius: 10, paddingVertical: 9,
    alignItems: 'center', marginBottom: 8,
  },
  btnOutlineTxt: { color: C.primary, fontWeight: '700', fontSize: 13 },
  btnDisabled: { borderColor: C.border },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  empty: { textAlign: 'center', color: C.textSecondary, fontSize: 14, fontWeight: '500' },

  ktpOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  ktpImage: { width: '95%', height: '70%', borderRadius: 12 },
  ktpClose: { color: 'rgba(255,255,255,0.45)', marginTop: 16, fontSize: 13 },
});
