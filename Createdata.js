import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert
} from 'react-native';

import { database } from './FirebaseConfig';
import { ref, push, set } from 'firebase/database';

const Createdata = () => {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [kelas, setKelas] = useState('');
  const [foodQuantity, setFoodQuantity] = useState(0);
  const [drinkQuantity, setDrinkQuantity] = useState(0);

  const incrementFoodQuantity = () => setFoodQuantity(foodQuantity + 1);
  const decrementFoodQuantity = () => {
    if (foodQuantity > 0) setFoodQuantity(foodQuantity - 1);
  };

  const incrementDrinkQuantity = () => setDrinkQuantity(drinkQuantity + 1);
  const decrementDrinkQuantity = () => {
    if (drinkQuantity > 0) setDrinkQuantity(drinkQuantity - 1);
  };

  const submit = async () => {
    if (!first_name || !last_name) {
      Alert.alert("Error", "Nama penyewa dan plat motor wajib diisi");
      return;
    }

    const data = {
      nama_penyewa: first_name,
      plat_motor: last_name,
      tujuan: kelas,
      lama_pinjam: foodQuantity,
      jumlah_helm: drinkQuantity,
      status: "dipinjam",
      createdAt: new Date().toISOString(),
    };

    try {
      const peminjamanRef = push(ref(database, 'peminjaman'));
      await set(peminjamanRef, data);

      Alert.alert("Sukses", "✅ Data peminjaman berhasil disimpan");

      setFirstName('');
      setLastName('');
      setKelas('');
      setFoodQuantity(0);
      setDrinkQuantity(0);
    } catch (error) {
      Alert.alert("Gagal", error.message);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://source.unsplash.com/featured/?motorcycle' }}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Form Peminjaman Motor</Text>

        <ScrollView contentContainerStyle={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nama Penyewa"
            value={first_name}
            onChangeText={setFirstName}
          />

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Lama Peminjaman (Hari)</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={decrementFoodQuantity}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{foodQuantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={incrementFoodQuantity}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Plat Nomor Motor"
            value={last_name}
            onChangeText={setLastName}
          />

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Jumlah Helm</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={decrementDrinkQuantity}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{drinkQuantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={incrementDrinkQuantity}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Tujuan / Catatan Peminjaman"
            value={kelas}
            onChangeText={setKelas}
          />

          <TouchableOpacity style={styles.submitButton} onPress={submit}>
            <Text style={styles.submitButtonText}>Ajukan Peminjaman</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Createdata;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backgroundImage: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityLabel: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  quantityButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
