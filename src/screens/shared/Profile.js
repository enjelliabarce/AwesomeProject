import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, TextInput, ScrollView, StatusBar, Modal,
} from 'react-native';
import {
  signOut, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential, deleteUser,
} from 'firebase/auth';
import { ref, get, update, remove } from 'firebase/database';
import { auth, database } from '../../config/FirebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../../theme/colors';

const Profile = ({ navigation }) => {
  const { top } = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // edit profil
  const [editModal, setEditModal] = useState(false);
  const [editNama, setEditNama] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // change password
  const [passModal, setPassModal] = useState(false);
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // delete account
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePass, setDeletePass] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const snap = await get(ref(database, 'users/' + auth.currentUser.uid));
        if (snap.exists()) {
          const data = snap.val();
          setUserData(data);
          setEditNama(data.nama || '');
          setEditPhone(data.phone || '');
        }
      } catch (e) { console.log(e); }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!editNama.trim()) { Alert.alert('Error', 'Nama tidak boleh kosong'); return; }
    setSaving(true);
    try {
      await update(ref(database, 'users/' + auth.currentUser.uid), {
        nama: editNama.trim(), phone: editPhone.trim(),
      });
      setUserData(prev => ({ ...prev, nama: editNama.trim(), phone: editPhone.trim() }));
      setEditModal(false);
    } catch (e) { Alert.alert('Error', 'Gagal menyimpan profil'); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currPass || !newPass || !confirmPass) {
      Alert.alert('Error', 'Semua field wajib diisi'); return;
    }
    if (newPass.length < 6) {
      Alert.alert('Error', 'Password baru minimal 6 karakter'); return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok'); return;
    }
    setPassLoading(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      setPassModal(false);
      setCurrPass(''); setNewPass(''); setConfirmPass('');
      Alert.alert('Berhasil', 'Password berhasil diubah');
    } catch (e) {
      const msg = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
        ? 'Password saat ini salah'
        : 'Gagal mengubah password';
      Alert.alert('Error', msg);
    }
    setPassLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePass) { Alert.alert('Error', 'Masukkan password untuk konfirmasi'); return; }
    setDeleteLoading(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, deletePass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await remove(ref(database, 'users/' + auth.currentUser.uid));
      await deleteUser(auth.currentUser);
      navigation.navigate('Login');
    } catch (e) {
      const msg = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
        ? 'Password salah'
        : 'Gagal menghapus akun';
      Alert.alert('Error', msg);
    }
    setDeleteLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin logout?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await signOut(auth);
        navigation.navigate('Login');
      }},
    ]);
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  const initials = userData?.nama
    ? userData.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── PROFILE HERO ── */}
        <View style={[s.hero, { paddingTop: top + 24 }]}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>{initials}</Text>
            </View>
          </View>
          <Text style={s.heroName}>{userData?.nama || '—'}</Text>
          <Text style={s.heroEmail}>{userData?.email || auth.currentUser?.email}</Text>
          <View style={s.rolePill}>
            <Text style={s.roleTxt}>{userData?.role === 'admin' ? 'Admin' : 'Pengguna'}</Text>
          </View>
        </View>

        {/* ── INFO SECTION ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Informasi Akun</Text>
          <View style={s.card}>
            <InfoRow label="Nama" value={userData?.nama || '—'} />
            <InfoRow label="No. Telepon" value={userData?.phone || '—'} />
            <InfoRow label="Email" value={userData?.email || '—'} last />
          </View>
        </View>

        {/* ── SETTINGS SECTION ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Pengaturan</Text>
          <View style={s.card}>
            <SettingRow
              label="Edit Profil"
              onPress={() => { setEditNama(userData?.nama || ''); setEditPhone(userData?.phone || ''); setEditModal(true); }}
            />
            <SettingRow
              label="Ganti Password"
              onPress={() => setPassModal(true)}
            />
            <SettingRow
              label="Logout"
              color={C.danger}
              onPress={handleLogout}
            />
            <SettingRow
              label="Hapus Akun"
              color={C.danger}
              onPress={() => setDeleteModal(true)}
              last
            />
          </View>
        </View>

      </ScrollView>

      {/* ── EDIT PROFIL MODAL ── */}
      <BottomModal visible={editModal} onClose={() => setEditModal(false)} title="Edit Profil">
        <Label>Nama</Label>
        <Input value={editNama} onChangeText={setEditNama} placeholder="Nama lengkap" />
        <Label>No. Telepon</Label>
        <Input value={editPhone} onChangeText={setEditPhone} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" />
        <View style={s.modalBtnRow}>
          <TouchableOpacity style={s.btnOutline} onPress={() => setEditModal(false)}>
            <Text style={s.btnOutlineTxt}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={C.dark} size="small" /> : <Text style={s.btnPrimaryTxt}>Simpan</Text>}
          </TouchableOpacity>
        </View>
      </BottomModal>

      {/* ── GANTI PASSWORD MODAL ── */}
      <BottomModal visible={passModal} onClose={() => setPassModal(false)} title="Ganti Password">
        <Label>Password Saat Ini</Label>
        <Input value={currPass} onChangeText={setCurrPass} placeholder="••••••••" secureTextEntry />
        <Label>Password Baru</Label>
        <Input value={newPass} onChangeText={setNewPass} placeholder="Min. 6 karakter" secureTextEntry />
        <Label>Konfirmasi Password Baru</Label>
        <Input value={confirmPass} onChangeText={setConfirmPass} placeholder="Ulangi password baru" secureTextEntry />
        <View style={s.modalBtnRow}>
          <TouchableOpacity style={s.btnOutline} onPress={() => { setPassModal(false); setCurrPass(''); setNewPass(''); setConfirmPass(''); }}>
            <Text style={s.btnOutlineTxt}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, passLoading && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={passLoading}>
            {passLoading ? <ActivityIndicator color={C.dark} size="small" /> : <Text style={s.btnPrimaryTxt}>Simpan</Text>}
          </TouchableOpacity>
        </View>
      </BottomModal>

      {/* ── HAPUS AKUN MODAL ── */}
      <BottomModal visible={deleteModal} onClose={() => setDeleteModal(false)} title="Hapus Akun">
        <Text style={s.deleteWarning}>
          Akun Anda akan dihapus permanen beserta semua data. Tindakan ini tidak dapat dibatalkan.
        </Text>
        <Label>Konfirmasi Password</Label>
        <Input value={deletePass} onChangeText={setDeletePass} placeholder="Masukkan password Anda" secureTextEntry />
        <View style={s.modalBtnRow}>
          <TouchableOpacity style={s.btnOutline} onPress={() => { setDeleteModal(false); setDeletePass(''); }}>
            <Text style={s.btnOutlineTxt}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnDanger, deleteLoading && { opacity: 0.6 }]} onPress={handleDeleteAccount} disabled={deleteLoading}>
            {deleteLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnDangerTxt}>Hapus Akun</Text>}
          </TouchableOpacity>
        </View>
      </BottomModal>

    </View>
  );
};

/* ── HELPERS ─────────────────────────────────── */
const InfoRow = ({ label, value, last }) => (
  <View style={[s.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

const SettingRow = ({ label, onPress, color, last }) => (
  <TouchableOpacity style={[s.settingRow, last && { borderBottomWidth: 0 }]} onPress={onPress} activeOpacity={0.7}>
    <Text style={[s.settingLabel, color && { color }]}>{label}</Text>
    <Text style={[s.settingChevron, color && { color }]}>›</Text>
  </TouchableOpacity>
);

const BottomModal = ({ visible, onClose, title, children }) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose} />
      <View style={[s.modalSheet, { paddingBottom: Math.max(bottom, 16) + 16 }]}>
        <View style={s.modalHandle} />
        <Text style={s.modalTitle}>{title}</Text>
        {children}
      </View>
    </Modal>
  );
};

const Label = ({ children }) => <Text style={s.inputLabel}>{children}</Text>;
const Input = (props) => <TextInput style={s.input} placeholderTextColor={C.textSecondary} {...props} />;

export default Profile;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* HERO */
  hero: {
    alignItems: 'center',
    paddingBottom: 28,
    backgroundColor: '#F8F8F8',
  },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 3, borderColor: C.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarTxt: { color: C.dark, fontSize: 26, fontWeight: '900' },
  heroName: { fontSize: 20, fontWeight: '800', color: C.dark },
  heroEmail: { fontSize: 13, color: C.textSecondary, marginTop: 4 },
  rolePill: {
    marginTop: 10,
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(245,188,27,0.3)',
  },
  roleTxt: { color: '#92680A', fontSize: 12, fontWeight: '700' },

  /* SECTIONS */
  section: { paddingHorizontal: 20, marginBottom: 6 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700',
    color: C.textSecondary, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1, borderColor: '#EEEEEE',
    overflow: 'hidden',
  },

  /* INFO ROWS */
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  infoLabel: { fontSize: 14, color: C.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: C.dark },

  /* SETTING ROWS */
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: C.dark },
  settingChevron: { fontSize: 22, color: '#CCCCCC', lineHeight: 26 },

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
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: '#E5E7EB',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.dark, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: C.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#E8E8E8',
    borderRadius: 10, padding: 12,
    fontSize: 14, color: C.dark,
    backgroundColor: '#FAFAFA',
  },
  deleteWarning: {
    fontSize: 13, color: C.danger,
    backgroundColor: '#FEF2F2',
    borderRadius: 10, padding: 12,
    lineHeight: 20, marginBottom: 4,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnOutline: {
    flex: 1, padding: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E8E8E8', alignItems: 'center',
  },
  btnOutlineTxt: { fontWeight: '600', color: C.textSecondary, fontSize: 14 },
  btnPrimary: {
    flex: 1, padding: 13, borderRadius: 12,
    backgroundColor: C.primary, alignItems: 'center',
  },
  btnPrimaryTxt: { fontWeight: '800', color: C.dark, fontSize: 14 },
  btnDanger: {
    flex: 1, padding: 13, borderRadius: 12,
    backgroundColor: C.danger, alignItems: 'center',
  },
  btnDangerTxt: { fontWeight: '800', color: '#FFFFFF', fontSize: 14 },
});
