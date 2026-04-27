import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Image, Modal, ActivityIndicator, Alert,
  StatusBar, Dimensions, ScrollView,
} from 'react-native';
import { getDatabase, ref, push, onValue, remove } from 'firebase/database';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../../theme/colors';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';

const { width } = Dimensions.get('window');
const CARD_W = (width - 20 * 2 - 12) / 2;
const IMG_H = Math.round(CARD_W * 0.65);

const AdminMotorScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nama, setNama] = useState('');
  const [plat, setPlat] = useState('');
  const [harga, setHarga] = useState('');
  const [fotoUri, setFotoUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const db = getDatabase();

  useEffect(() => {
    const motorRef = ref(db, 'motor');
    const unsub = onValue(motorRef, snapshot => {
      const val = snapshot.val();
      setData(val ? Object.keys(val).map(id => ({ id, ...val[id] })) : []);
    });
    return () => unsub();
  }, []);

  const pilihFoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (!response.didCancel && response.assets?.[0]) {
        setFotoUri(response.assets[0].uri);
      }
    });
  };

  const tambahMotor = async () => {
    if (!nama || !plat || !harga || !fotoUri) {
      Alert.alert('Lengkapi Data', 'Semua field termasuk foto wajib diisi.');
      return;
    }
    setUploading(true);
    try {
      const downloadURL = await uploadToCloudinary(fotoUri, 'motor.jpg');
      await push(ref(db, 'motor'), { nama, plat, harga: Number(harga), foto: downloadURL });
      resetForm();
    } catch (e) {
      Alert.alert('Error', 'Gagal menambah motor. Coba lagi.');
    }
    setUploading(false);
  };

  const hapusMotor = (id) => {
    Alert.alert('Hapus Motor', 'Yakin ingin menghapus motor ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => remove(ref(db, 'motor/' + id)) },
    ]);
  };

  const resetForm = () => {
    setNama(''); setPlat(''); setHarga(''); setFotoUri(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={[s.card, { width: CARD_W }]}>
      <View style={s.imageWrap}>
        <Image
          source={{ uri: item.foto || 'https://i.imgur.com/7yUvePI.jpg' }}
          style={[s.image, { height: IMG_H }]}
          resizeMode="cover"
        />
        <TouchableOpacity style={s.deleteBtn} onPress={() => hapusMotor(item.id)} activeOpacity={0.8}>
          <Text style={s.deleteBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={s.cardBody}>
        <Text style={s.nama} numberOfLines={1}>{item.nama}</Text>
        <Text style={s.plat}>{item.plat}</Text>
        <View style={s.priceRow}>
          <Text style={s.harga}>Rp {Number(item.harga).toLocaleString('id-ID')}</Text>
          <Text style={s.hargaUnit}>/hari</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[s.header, { paddingTop: top + 16 }]}>
        <Text style={s.headerTitle}>Kelola Motor</Text>
        <View style={s.countPill}>
          <Text style={s.countTxt}>{data.length} motor</Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={[s.listContent, { paddingBottom: Math.max(bottom, 16) + 90 }]}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={s.colWrap}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🏍</Text>
            <Text style={s.empty}>Belum ada motor terdaftar</Text>
          </View>
        }
        renderItem={renderItem}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[s.fab, { bottom: Math.max(bottom, 16) + 72 }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL TAMBAH MOTOR */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={resetForm}
      >
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={resetForm} />
        <View style={[s.modalSheet, { paddingBottom: Math.max(bottom, 16) + 16 }]}>
          <View style={s.modalHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.modalTitle}>Tambah Motor</Text>

            <Label>Nama Motor</Label>
            <StyledInput
              placeholder="Honda Vario, Yamaha NMAX..."
              value={nama}
              onChangeText={setNama}
            />

            <Label>Plat Nomor</Label>
            <StyledInput
              placeholder="AB 1234 XY"
              value={plat}
              onChangeText={setPlat}
              autoCapitalize="characters"
            />

            <Label>Harga / Hari (Rp)</Label>
            <StyledInput
              placeholder="50000"
              value={harga}
              onChangeText={setHarga}
              keyboardType="numeric"
            />

            <Label>Foto Motor</Label>
            <TouchableOpacity style={s.fotoPicker} onPress={pilihFoto} activeOpacity={0.85}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={s.fotoPreview} resizeMode="cover" />
              ) : (
                <View style={s.fotoPlaceholder}>
                  <View style={s.fotoIconBox}>
                    <Text style={s.fotoIconTxt}>📷</Text>
                  </View>
                  <Text style={s.fotoPickerText}>Pilih Foto dari Galeri</Text>
                  <Text style={s.fotoPickerSub}>JPG / PNG</Text>
                </View>
              )}
            </TouchableOpacity>
            {fotoUri && (
              <TouchableOpacity onPress={() => setFotoUri(null)}>
                <Text style={s.gantiText}>Ganti foto</Text>
              </TouchableOpacity>
            )}

            <View style={s.modalBtnRow}>
              <TouchableOpacity style={s.btnOutline} onPress={resetForm}>
                <Text style={s.btnOutlineTxt}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnPrimary, uploading && { opacity: 0.6 }]}
                onPress={tambahMotor}
                disabled={uploading}
              >
                {uploading
                  ? <ActivityIndicator color={C.dark} size="small" />
                  : <Text style={s.btnPrimaryTxt}>Tambah Motor</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const Label = ({ children }) => <Text style={s.inputLabel}>{children}</Text>;
const StyledInput = (props) => (
  <TextInput
    style={s.input}
    placeholderTextColor={C.textSecondary}
    {...props}
  />
);

export default AdminMotorScreen;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },

  /* HEADER */
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: C.dark },
  countPill: {
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(245,188,27,0.3)',
  },
  countTxt: { fontSize: 12, fontWeight: '700', color: '#92680A' },

  /* LIST */
  listContent: { paddingHorizontal: 20, paddingTop: 16 },
  colWrap: { gap: 12, marginBottom: 12 },

  /* CARD */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%' },
  deleteBtn: {
    position: 'absolute',
    top: 8, right: 8,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtnTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', lineHeight: 14 },
  cardBody: { padding: 10 },
  nama: { fontWeight: '800', color: C.dark, fontSize: 13, marginBottom: 2 },
  plat: { color: C.textSecondary, fontSize: 11, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  harga: { fontWeight: '800', color: C.dark, fontSize: 14 },
  hargaUnit: { fontSize: 10, color: C.textSecondary, fontWeight: '500' },

  /* EMPTY */
  emptyWrap: { flex: 1, alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  empty: { color: C.textSecondary, fontSize: 14, fontWeight: '500' },

  /* FAB */
  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: C.primary,
    width: 52, height: 52,
    borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  fabText: { color: C.dark, fontSize: 28, fontWeight: '700', lineHeight: 32 },

  /* MODAL */
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: '#E5E7EB',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.dark, marginBottom: 16 },
  inputLabel: {
    fontSize: 12, fontWeight: '600', color: C.textSecondary,
    marginBottom: 6, marginTop: 12,
  },
  input: {
    borderWidth: 1, borderColor: '#E8E8E8',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.dark, backgroundColor: '#FAFAFA',
  },
  fotoPicker: {
    borderWidth: 1.5, borderColor: '#E8E8E8', borderStyle: 'dashed',
    borderRadius: 12, height: 110, overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  fotoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
  fotoIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFF8E6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  fotoIconTxt: { fontSize: 18 },
  fotoPickerText: { fontSize: 13, fontWeight: '600', color: C.dark },
  fotoPickerSub: { fontSize: 11, color: C.textSecondary },
  fotoPreview: { width: '100%', height: '100%' },
  gantiText: { color: C.primary, fontWeight: '700', fontSize: 13, marginTop: 6 },

  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnOutline: {
    flex: 1, padding: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E8E8E8', alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnOutlineTxt: { fontWeight: '600', color: C.textSecondary, fontSize: 14 },
  btnPrimary: {
    flex: 2, padding: 13, borderRadius: 12,
    backgroundColor: C.primary, alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnPrimaryTxt: { fontWeight: '800', color: C.dark, fontSize: 14 },
});
