import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { auth, database } from '../../config/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const Register = ({ navigation }) => {

  const [nama, setNama] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = () => {
    setErrorMsg('');

    if (!nama || !phone || !email || !password || !confirmPassword) {
      setErrorMsg('Semua field wajib diisi.'); return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak sama.'); return;
    }
    const regex = /^(?=.*[0-9]).{6,}$/;
    if (!regex.test(password)) {
      setErrorMsg('Password minimal 6 karakter dan harus mengandung angka.'); return;
    }

    setLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        set(ref(database, 'users/' + user.uid), {
          nama, phone, email,
          role: 'user',
          createdAt: new Date().toISOString(),
        });
        setLoading(false);
        // Auto-navigate ke UserHome — tidak perlu login ulang
        navigation.replace('UserHome');
      })
      .catch((error) => {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          setErrorMsg('Email ini sudah terdaftar. Silakan login.');
        } else if (error.code === 'auth/invalid-email') {
          setErrorMsg('Format email tidak valid.');
        } else {
          setErrorMsg('Pendaftaran gagal. Coba lagi.');
        }
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

        {!!errorMsg && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorTxt}>{errorMsg}</Text>
          </View>
        )}

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
  errorWrap: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTxt: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
});