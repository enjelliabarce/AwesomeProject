import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { ref, push, get } from 'firebase/database';
import { database, auth } from '../../config/FirebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../../theme/colors';
import { fmtDate } from '../../utils/dateFormatter';

const calcDays = (start, end) => {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

const formatRupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const OrderSummary = ({ route, navigation }) => {
  const {
    nama_motor, plat_motor, harga_motor, startDate, endDate,
    helm, deliveryType, alamat, catatan, ktp_url,
  } = route.params || {};

  const { top } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const lama_pinjam = calcDays(startDate, endDate);
  const totalHarga = Number(harga_motor) * lama_pinjam;

  const handleKonfirmasi = async () => {
    setLoading(true);
    try {
      const userSnap = await get(ref(database, 'users/' + auth.currentUser.uid));
      const nama_penyewa = userSnap.val()?.nama || auth.currentUser.email;
      await push(ref(database, 'peminjaman'), {
        nama_penyewa,
        uid_penyewa: auth.currentUser.uid,
        nama_motor, plat_motor,
        harga_motor: Number(harga_motor),
        startDate, endDate, lama_pinjam,
        jumlah_helm: helm,
        metode_pengambilan: deliveryType,
        alamat: deliveryType === 'antar' ? alamat : '',
        catatan: catatan || '',
        ktp_url: ktp_url || '',
        status: 'dipinjam',
        createdAt: Date.now(),
      });
      navigation.navigate('UserHome', { screen: 'Pesanan' });
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan pesanan. Coba lagi.');
    }
    setLoading(false);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── HEADER ── */}
      <View style={[s.header, { paddingTop: top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Konfirmasi Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── TOTAL BIAYA ── */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Total Biaya</Text>
          <Text style={s.totalValue}>{formatRupiah(totalHarga)}</Text>
          <View style={s.totalDivider} />
          <Text style={s.totalNote}>{formatRupiah(harga_motor)} × {lama_pinjam} hari</Text>
        </View>

        {/* ── DETAIL MOTOR ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Detail Motor</Text>
          <Row label="Motor" value={nama_motor} bold />
          <Row label="Plat" value={plat_motor} />
          <Row label="Tanggal Mulai" value={fmtDate(startDate)} />
          <Row label="Tanggal Selesai" value={fmtDate(endDate)} />
          <Row label="Durasi" value={`${lama_pinjam} hari`} bold last />
        </View>

        {/* ── DETAIL PESANAN ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Detail Pesanan</Text>
          <Row label="Jumlah Helm" value={`${helm} helm`} />
          <Row label="Metode" value={deliveryType === 'antar' ? 'Diantar' : 'Ambil di Tempat'} />
          {deliveryType === 'antar' && <Row label="Alamat" value={alamat} />}
          {catatan ? <Row label="Catatan" value={catatan} last /> : null}
        </View>

        {/* ── BUTTON ── */}
        <TouchableOpacity
          style={[s.btn, loading && { opacity: 0.6 }]}
          onPress={handleKonfirmasi}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={C.dark} />
            : <Text style={s.btnTxt}>Pesan Sekarang</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const Row = ({ label, value, bold, last }) => (
  <View style={[s.row, last && { borderBottomWidth: 0 }]}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={[s.rowValue, bold && { color: C.dark, fontWeight: '700' }]}>{value}</Text>
  </View>
);

export default OrderSummary;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },

  /* HEADER */
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: C.dark, lineHeight: 24 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.dark },

  scroll: { padding: 20, paddingBottom: 48 },

  /* TOTAL CARD */
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  totalLabel: {
    fontSize: 12, fontWeight: '600',
    color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 1,
  },
  totalValue: {
    fontSize: 36, fontWeight: '900',
    color: C.dark, marginTop: 6,
  },
  totalDivider: {
    width: 40, height: 2,
    backgroundColor: C.primary,
    borderRadius: 2, marginVertical: 10,
  },
  totalNote: {
    fontSize: 13, color: C.textSecondary,
  },

  /* CARDS */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardTitle: {
    fontSize: 11, fontWeight: '700',
    color: C.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  rowLabel: { fontSize: 14, color: C.textSecondary },
  rowValue: {
    fontSize: 14, fontWeight: '600',
    color: C.textPrimary,
    flexShrink: 1, textAlign: 'right', maxWidth: '60%',
  },

  /* BUTTON */
  btn: {
    backgroundColor: C.primary,
    borderRadius: 16, padding: 17,
    alignItems: 'center', marginTop: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  btnTxt: { color: C.dark, fontWeight: '800', fontSize: 16 },
});
