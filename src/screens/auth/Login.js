import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, StatusBar, KeyboardAvoidingView,
  Platform, Animated, Image,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/FirebaseConfig';
import C from '../../theme/colors';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) { setErrorMsg('Email dan password wajib diisi.'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigasi ditangani oleh onAuthStateChanged di AppNavigator
    } catch {
      setErrorMsg('Email atau password salah. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ═══ DARK TOP — BRAND ═══ */}
      <View style={styles.topSection}>
        {/* Decorative corner lines */}
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          {/* LOGO MARK */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/app-logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>

        </Animated.View>
      </View>

      {/* ═══ FORM SHEET ═══ */}
      <Animated.View
        style={[styles.sheet, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <Text style={styles.heading}>Masuk</Text>
        <Text style={styles.subheading}>Selamat datang kembali 👋</Text>

        {/* EMAIL */}
        <View style={[styles.inputWrap, focusEmail && styles.inputWrapFocus]}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan alamat email Anda"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusEmail(true)}
            onBlur={() => setFocusEmail(false)}
          />
        </View>

        {/* PASSWORD */}
        <View style={[styles.inputWrap, focusPass && styles.inputWrapFocus]}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Masukkan kata sandi Anda"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusPass(true)}
              onBlur={() => setFocusPass(false)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              style={styles.eyeBtn}
              activeOpacity={0.7}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                size={16}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ERROR MESSAGE */}
        {!!errorMsg && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorTxt}>{errorMsg}</Text>
          </View>
        )}

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={C.dark} />
            : <Text style={styles.loginBtnText}>Masuk</Text>
          }
        </TouchableOpacity>

        {/* REGISTER LINK */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Daftar sekarang</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.dark,
  },

  /* ─── TOP ─────────────────── */
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute', top: 50, left: 20,
    width: 60, height: 60,
    borderTopWidth: 1.5, borderLeftWidth: 1.5,
    borderColor: 'rgba(245,188,27,0.2)',
    borderTopLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute', bottom: 30, right: 20,
    width: 60, height: 60,
    borderBottomWidth: 1.5, borderRightWidth: 1.5,
    borderColor: 'rgba(245,188,27,0.2)',
    borderBottomRightRadius: 8,
  },
  logoWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImg: {
    width: 180,
    height: 180,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '900',
    color: C.textPrimary,
    letterSpacing: 6,
  },
  brandDivider: {
    width: 40, height: 1,
    backgroundColor: C.primary,
    marginVertical: 10,
    opacity: 0.6,
  },
  brandTagline: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '400',
    letterSpacing: 1.5,
  },

  /* ─── SHEET ─────────────────── */
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: C.textBody,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
  },
  inputWrap: {
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWrapFocus: {
    borderColor: C.primary,
    backgroundColor: 'rgba(245,188,27,0.04)',
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    color: C.textBody,
    padding: 0,
    fontWeight: '500',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 2,
  },
  loginBtn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  loginBtnText: {
    color: C.dark,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorWrap: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTxt: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: { color: '#9CA3AF', fontSize: 14 },
  registerLink: {
    color: C.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});
