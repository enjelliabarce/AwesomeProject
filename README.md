# Melaju Rent

## Deskripsi
Melaju Rent adalah aplikasi mobile untuk penyewaan motor berbasis React Native. Pengguna dapat melihat daftar motor yang tersedia, membuat pesanan sewa (dengan opsi jumlah helm dan pengantaran), melacak lokasi motor secara real-time, serta melihat riwayat pesanan. Admin memiliki dashboard terpisah untuk mengelola data motor dan riwayat pesanan seluruh pengguna.

## Fitur Utama
- **Autentikasi**: Login & registrasi dengan Firebase Auth, redirect otomatis sesuai role (admin/user).
- **Daftar Motor**: Melihat motor yang tersedia untuk disewa.
- **Pemesanan**: Membuat pesanan sewa motor beserta ringkasan pesanan.
- **Tracking Lokasi**: Pelacakan lokasi motor secara real-time di peta.
- **Riwayat Pesanan**: Melihat status dan histori pesanan (user & admin).
- **Dashboard Admin**: Kelola data motor dan pantau riwayat pesanan semua pengguna.

## Cara Penggunaan
1. Install dependencies:
   ```bash
   npm install
   ```
2. Jalankan Metro bundler:
   ```bash
   npm start
   ```
3. Jalankan aplikasi di device/emulator:
   ```bash
   npm run android
   # atau
   npm run ios
   ```
4. Registrasi/login untuk masuk sebagai user, lalu pilih motor dan buat pesanan sewa. Admin login dengan akun bertipe admin untuk mengakses dashboard pengelolaan motor & riwayat pesanan.

## Teknologi
- React Native 0.75
- Firebase (Authentication & Realtime Database)
- React Navigation (Bottom Tabs)
