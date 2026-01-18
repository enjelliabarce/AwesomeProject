import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue, update } from 'firebase/database';
import { database } from './FirebaseConfig';

const History = () => {
  const [dataPeminjaman, setDataPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const peminjamanRef = ref(database, 'peminjaman');

    const unsubscribe = onValue(peminjamanRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const arrayData = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setDataPeminjaman(arrayData);
      } else {
        setDataPeminjaman([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const selesaiPinjam = (id) => {
    update(ref(database, `peminjaman/${id}`), {
      status: 'selesai',
      selesaiAt: Date.now(),
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nama}>{item.nama_penyewa}</Text>
      <Text>Plat Motor : {item.plat_motor}</Text>
      <Text>Tujuan     : {item.tujuan}</Text>
      <Text>Lama Pinjam: {item.lama_pinjam} hari</Text>
      <Text>Jumlah Helm: {item.jumlah_helm}</Text>

      <Text
        style={[
          styles.status,
          item.status === 'dipinjam'
            ? styles.aktif
            : styles.selesai,
        ]}
      >
        Status: {item.status}
      </Text>

      {item.status === 'dipinjam' && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => selesaiPinjam(item.id)}
        >
          <Text style={styles.buttonText}>Selesaikan Peminjaman</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>History Peminjaman</Text>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={dataPeminjaman}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
  },
  nama: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  status: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  aktif: {
    color: 'orange',
  },
  selesai: {
    color: 'green',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
