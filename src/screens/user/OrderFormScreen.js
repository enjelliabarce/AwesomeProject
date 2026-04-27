import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Alert, Image, ActivityIndicator, ScrollView, StatusBar,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../../theme/colors';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { fmtDate } from '../../utils/dateFormatter';

const OrderFormScreen = ({ route, navigation }) => {
  const { nama_motor, plat_motor, harga_motor, startDate, endDate } = route.params || {};
  const { top } = useSafeAreaInsets();

  const [helm, setHelm] = useState(0);
  const [deliveryType, setDeliveryType] = useState('ambil');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [ktpUri, setKtpUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pilihKtp = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (!response.didCancel && response.assets?.[0]) {
        setKtpUri(response.assets[0].uri);
      }
    });
  };

  const handleContinue = async () => {
    if (deliveryType === 'antar' && !alamat.trim()) {
      Alert.alert('Lengkapi Data', 'Alamat pengantaran wajib diisi.');
      return;
    }
    if (!ktpUri) {
      Alert.alert('KTP Diperlukan', 'Mohon upload foto KTP terlebih dahulu.');
      return;
    }
    setUploading(true);
    try {
      const ktp_url = await uploadToCloudinary(ktpUri, 'ktp.jpg');
      navigation.navigate('OrderSummary', {
        nama_motor, plat_motor, harga_motor, startDate, endDate,
        helm, deliveryType, alamat, catatan, ktp_url,
      });
    } catch (e) {
      Alert.alert('Error', 'Gagal upload KTP. Coba lagi.');
    }
    setUploading(false);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── HEADER ── */}
      <View style={[s.header, { paddingTop: top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── MOTOR INFO CARD ── */}
        <View style={s.motorCard}>
          <View style={s.motorCardLeft}>
            <Text style={s.motorName}>{nama_motor}</Text>
            <Text style={s.motorPlat}>{plat_motor}</Text>
          </View>
          <View style={s.dateChips}>
            <View style={s.chip}>
              <Text style={s.chipText}>{fmtDate(startDate)}</Text>
            </View>
            <Text style={s.chipArrow}>→</Text>
            <View style={s.chip}>
              <Text style={s.chipText}>{fmtDate(endDate)}</Text>
            </View>
          </View>
        </View>

        {/* ── JUMLAH HELM ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Jumlah Helm</Text>
          <View style={s.qtyRow}>
            <TouchableOpacity
              style={s.qtyBtn}
              onPress={() => helm > 0 && setHelm(helm - 1)}
              activeOpacity={0.7}
            >
              <Text style={s.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyNum}>{helm}</Text>
            <TouchableOpacity
              style={[s.qtyBtn, s.qtyBtnPlus]}
              onPress={() => setHelm(helm + 1)}
              activeOpacity={0.7}
            >
              <Text style={[s.qtyBtnText, { color: C.dark }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── METODE PENGAMBILAN ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Metode Pengambilan</Text>
          <View style={s.deliveryRow}>
            {['ambil', 'antar'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[s.deliveryBtn, deliveryType === type && s.deliveryBtnActive]}
                onPress={() => setDeliveryType(type)}
                activeOpacity={0.8}
              >
                <Text style={[s.deliveryBtnText, deliveryType === type && s.deliveryBtnTextActive]}>
                  {type === 'ambil' ? 'Ambil di Tempat' : 'Diantar'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {deliveryType === 'antar' && (
            <TextInput
              placeholder="Alamat pengantaran..."
              placeholderTextColor={C.textSecondary}
              style={s.input}
              value={alamat}
              onChangeText={setAlamat}
            />
          )}
        </View>

        {/* ── CATATAN ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Catatan <Text style={s.optional}>(Opsional)</Text></Text>
          <TextInput
            placeholder="Tambahkan catatan untuk pemilik..."
            placeholderTextColor={C.textSecondary}
            style={[s.input, s.inputMulti]}
            value={catatan}
            onChangeText={setCatatan}
            multiline
          />
        </View>

        {/* ── UPLOAD KTP ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Foto KTP</Text>
          <TouchableOpacity style={s.ktpBox} onPress={pilihKtp} activeOpacity={0.85}>
            {ktpUri ? (
              <Image source={{ uri: ktpUri }} style={s.ktpPreview} />
            ) : (
              <View style={s.ktpPlaceholder}>
                <View style={s.ktpIconBox}>
                  <Text style={s.ktpIconText}>ID</Text>
                </View>
                <Text style={s.ktpTitle}>Pilih Foto KTP</Text>
                <Text style={s.ktpSub}>JPG / PNG · Maks 5MB</Text>
              </View>
            )}
          </TouchableOpacity>
          {ktpUri && (
            <TouchableOpacity onPress={() => setKtpUri(null)} style={s.gantiBtn}>
              <Text style={s.gantiText}>Ganti foto KTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── BUTTONS ── */}
        <View style={s.btnRow}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.cancelTxt}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.continueBtn, uploading && { opacity: 0.6 }]}
            onPress={handleContinue}
            disabled={uploading}
            activeOpacity={0.85}
          >
            {uploading
              ? <ActivityIndicator color={C.dark} size="small" />
              : <Text style={s.continueTxt}>Lanjutkan →</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

export default OrderFormScreen;

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
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: C.dark, lineHeight: 24 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.dark },

  scroll: { padding: 20, paddingBottom: 48 },

  /* MOTOR CARD */
  motorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 12,
  },
  motorCardLeft: { gap: 3 },
  motorName: { fontSize: 17, fontWeight: '800', color: C.dark },
  motorPlat: { fontSize: 12, color: C.textSecondary },
  dateChips: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: {
    backgroundColor: '#FFF8E6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(245,188,27,0.25)',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: '#B8860B' },
  chipArrow: { fontSize: 13, color: C.primary, fontWeight: '700' },

  /* SECTIONS */
  section: { marginTop: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 10 },
  optional: { fontWeight: '400', color: C.textSecondary },

  /* QTY */
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnPlus: { backgroundColor: C.primary },
  qtyBtnText: { fontSize: 22, fontWeight: '600', color: C.dark, lineHeight: 26 },
  qtyNum: {
    width: 56, textAlign: 'center',
    fontSize: 22, fontWeight: '800', color: C.dark,
  },

  /* DELIVERY */
  deliveryRow: { flexDirection: 'row', gap: 10 },
  deliveryBtn: {
    flex: 1, paddingVertical: 13,
    borderRadius: 12, alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#E8E8E8',
  },
  deliveryBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  deliveryBtnText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  deliveryBtnTextActive: { color: C.dark },

  /* INPUT */
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: C.dark,
    borderWidth: 1, borderColor: '#E8E8E8',
    marginTop: 10,
  },
  inputMulti: { height: 80, textAlignVertical: 'top', paddingTop: 12 },

  /* KTP */
  ktpBox: {
    borderWidth: 1.5, borderColor: '#E8E8E8',
    borderStyle: 'dashed', borderRadius: 16,
    height: 130, overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  ktpPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6 },
  ktpIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFF8E6',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  ktpIconText: { fontSize: 13, fontWeight: '900', color: C.primary },
  ktpTitle: { fontSize: 14, fontWeight: '700', color: C.dark },
  ktpSub: { fontSize: 11, color: C.textSecondary },
  ktpPreview: { width: '100%', height: '100%' },
  gantiBtn: { marginTop: 8 },
  gantiText: { fontSize: 13, fontWeight: '700', color: C.primary },

  /* BUTTONS */
  btnRow: { flexDirection: 'row', marginTop: 32, gap: 10 },
  cancelBtn: {
    flex: 1, padding: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8E8E8',
    alignItems: 'center', backgroundColor: '#FFFFFF',
  },
  cancelTxt: { fontWeight: '600', color: C.textSecondary, fontSize: 15 },
  continueBtn: {
    flex: 2, padding: 15, borderRadius: 14,
    backgroundColor: C.primary, alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  continueTxt: { fontWeight: '800', color: C.dark, fontSize: 15 },
});
