import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../FirebaseConfig";

import { getDatabase, ref, get } from "firebase/database";

const Login = ({ navigation }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Email dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Login sukses:", user.email);

      // 🔥 AMBIL DATA ROLE
      const db = getDatabase();
      const userRef = ref(db, 'users/' + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const dataUser = snapshot.val();

        console.log("Role:", dataUser.role);

        if (dataUser.role === 'admin') {
          navigation.navigate("AdminDashboard"); // 🔥 ADMIN
        } else {
          navigation.navigate("Menu"); // 🔥 USER
        }

      } else {
        alert("User tidak ditemukan di database");
      }

    } catch (error) {
      alert("Email atau password salah");
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>

      <View style={styles.card}>

        <Text style={styles.title}>Rental Motor</Text>
        <Text style={styles.subtitle}>Silakan login</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            Belum punya akun? Register
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  title: { fontSize: 22, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 },
  button: { backgroundColor: 'blue', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center' }
});