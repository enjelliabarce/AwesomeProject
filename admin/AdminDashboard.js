import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal
} from 'react-native';

import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update
} from "firebase/database";

const AdminDashboard = () => {

  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [nama, setNama] = useState('');
  const [plat, setPlat] = useState('');
  const [harga, setHarga] = useState('');
  const [foto, setFoto] = useState('');

  const db = getDatabase();

  // 🔥 AMBIL DATA
  useEffect(() => {
    const motorRef = ref(db, 'motor');

    onValue(motorRef, snapshot => {
      const val = snapshot.val();
      let arr = [];

      for (let id in val) {
        arr.push({ id, ...val[id] });
      }

      setData(arr);
    });
  }, []);

  // 🔥 TAMBAH MOTOR
  const tambahMotor = () => {
    if (!nama || !plat || !harga || !foto) {
      alert("Semua field wajib diisi!");
      return;
    }

    push(ref(db, 'motor'), {
      nama,
      plat,
      harga,
      foto
    });

    setNama('');
    setPlat('');
    setHarga('');
    setFoto('');
    setModalVisible(false);
  };

  // 🔥 HAPUS MOTOR
  const hapusMotor = (id) => {
    remove(ref(db, 'motor/' + id));
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Dashboard Admin</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>

            <Image
              source={{
                uri: item.foto || 'https://i.imgur.com/7yUvePI.jpg'
              }}
              style={styles.image}
            />

            <Text style={styles.nama}>{item.nama}</Text>
            <Text style={styles.harga}>Rp {item.harga}/day</Text>
            <Text style={styles.plat}>{item.plat}</Text>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => hapusMotor(item.id)}
            >
              <Text style={{ color: '#fff' }}>Hapus</Text>
            </TouchableOpacity>

          </View>
        )}
      />

      {/* BUTTON TAMBAH */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>

      {/* MODAL INPUT */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>

          <Text style={styles.modalTitle}>Tambah Motor</Text>

          <TextInput
            placeholder="Nama Motor"
            style={styles.input}
            value={nama}
            onChangeText={setNama}
          />

          <TextInput
            placeholder="Plat Motor"
            style={styles.input}
            value={plat}
            onChangeText={setPlat}
          />

          <TextInput
            placeholder="Harga / day"
            style={styles.input}
            value={harga}
            onChangeText={setHarga}
            keyboardType="numeric"
          />

          <TextInput
            placeholder="Link Foto"
            style={styles.input}
            value={foto}
            onChangeText={setFoto}
          />

          <TouchableOpacity style={styles.addBtn} onPress={tambahMotor}>
            <Text style={{ color: '#fff' }}>Tambah</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={{ marginTop: 15 }}>Batal</Text>
          </TouchableOpacity>

        </View>
      </Modal>

    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#F3F4F6' },

  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: 5,
    width: '47%'
  },

  image: { width: '100%', height: 100, borderRadius: 10 },

  nama: { fontWeight: 'bold', marginTop: 5 },

  harga: { color: '#6B7280' },

  plat: { fontSize: 12, color: '#9CA3AF' },

  deleteBtn: {
    backgroundColor: 'red',
    padding: 6,
    borderRadius: 6,
    marginTop: 5,
    alignItems: 'center'
  },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2563EB',
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },

  modal: { flex: 1, justifyContent: 'center', padding: 20 },

  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },

  addBtn: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});