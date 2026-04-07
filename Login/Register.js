import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';

import { auth, database } from '../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const Register = ({ navigation }) => {

  const [nama, setNama] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {

    // VALIDASI
    if (!nama || !phone || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Semua field wajib diisi");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Konfirmasi password tidak sama");
      return;
    }

    const regex = /^(?=.*[0-9]).{6,}$/;
    if (!regex.test(password)) {
      Alert.alert("Error", "Password minimal 6 karakter & harus ada angka");
      return;
    }

    setLoading(true);

    // REGISTER KE FIREBASE AUTH
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {

        const user = userCredential.user;

        // 🔥 SIMPAN KE DATABASE
        set(ref(database, 'users/' + user.uid), {
          nama: nama,
          phone: phone,
          email: email,
          role: 'user',
          createdAt: new Date().toISOString()
        });

        setLoading(false);
        Alert.alert("Sukses", "Akun berhasil dibuat");

        navigation.navigate("Login");
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>

      <View style={styles.card}>

        <Text style={styles.title}>Buat Akun</Text>
        <Text style={styles.subtitle}>Daftar untuk mulai rental motor</Text>

        <TextInput
          placeholder="Nama Lengkap"
          style={styles.input}
          value={nama}
          onChangeText={setNama}
        />

        <TextInput
          placeholder="Nomor Telepon"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Konfirmasi Password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>
            Sudah punya akun? <Text style={styles.linkBold}>Login</Text>
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default Register;

//////////////////////
// STYLE PROFESIONAL
//////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6B7280',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
    color: '#6B7280',
  },
  linkBold: {
    color: '#2563EB',
    fontWeight: '600',
  },
});