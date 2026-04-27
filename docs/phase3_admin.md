# Phase 3 — Admin Features

> Bisa dikerjakan paralel dengan Phase 2, tapi Phase 1 harus selesai dulu.

---

## Task 3.1 — Upload Foto dari Gallery (AdminDashboard)

**Problem:**
Input foto di `AdminDashboard.js` adalah TextInput biasa untuk URL. Tidak praktis dan error-prone.

**File yang dimodifikasi:** `admin/AdminDashboard.js`, `FirebaseConfig.js`

**Dependency yang perlu dicek/install:**
```bash
# Cek dulu apakah sudah ada:
npm list react-native-image-picker

# Jika belum:
npm install react-native-image-picker
cd ios && pod install
```

**Yang perlu dilakukan di `FirebaseConfig.js`:**
- [ ] Tambahkan export `storage`:
  ```js
  import { getStorage } from 'firebase/storage';
  export const storage = getStorage(app);
  ```

**Yang perlu dilakukan di `AdminDashboard.js`:**
- [ ] Hapus TextInput untuk field `foto`
- [ ] Tambah state `fotoUri` (local URI hasil pilih gallery) dan `uploading` (loading state)
- [ ] Tambah tombol "Pilih Foto" yang trigger gallery picker:
  ```js
  import { launchImageLibrary } from 'react-native-image-picker';

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (!response.didCancel && response.assets?.[0]) {
        setFotoUri(response.assets[0].uri);
      }
    });
  };
  ```
- [ ] Preview foto yang dipilih (Image component kecil di dalam modal)
- [ ] Saat tombol "Simpan" ditekan → upload ke Firebase Storage dulu, baru push ke DB:
  ```js
  import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

  const uploadFoto = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = storageRef(storage, `motors/${Date.now()}.jpg`);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  // Di handleSimpan:
  const downloadURL = await uploadFoto(fotoUri);
  await push(ref(db, 'motor'), { nama, plat, harga, foto: downloadURL });
  ```
- [ ] Handle state `uploading` agar tombol disabled saat upload berlangsung

---

## Task 3.2 — Maps Alerts Berbagai Situasi

**Problem:**
`Map.js` saat ini hanya handle 2 situasi: geolocation error generic dan "not supported". Tidak ada alert operasional yang berguna.

**File yang dimodifikasi:** `Map.js`

**Situasi yang perlu di-handle:**

| Situasi | Kondisi | Alert/Aksi |
|---|---|---|
| GPS tidak diizinkan | error.code === 1 | Alert: "Izin GPS ditolak. Aktifkan di pengaturan." |
| GPS tidak tersedia | error.code === 2 | Alert: "Sinyal GPS tidak tersedia." |
| GPS timeout | error.code === 3 | Alert: "GPS timeout. Coba lagi." |
| Browser tidak support | !navigator.geolocation | Alert: "Perangkat tidak mendukung GPS." |
| Akurasi rendah | accuracy > 50 | Warning badge merah di info box: "Akurasi rendah (Xm)" |
| Koneksi Firebase lost | (di RN layer) | Toast/banner: "Koneksi terputus — data mungkin tidak update" |

**Implementasi di HTML string dalam Map.js:**
```js
// Ganti error handler dari:
alert(err.message)

// Menjadi:
function handleError(err) {
  const messages = {
    1: 'Izin lokasi ditolak. Aktifkan GPS di pengaturan perangkat.',
    2: 'Sinyal GPS tidak tersedia. Pastikan berada di area terbuka.',
    3: 'GPS timeout. Periksa koneksi internet dan sinyal GPS.',
  };
  alert(messages[err.code] || err.message);
}
```

**Untuk akurasi rendah — update info box:**
```js
// Di dalam success callback watchPosition:
const accuracyWarning = accuracy > 50 
  ? '<span style="color:red">⚠ Akurasi rendah</span>' 
  : '';
document.getElementById('info').innerHTML = `
  Lat: ${lat.toFixed(6)}<br>
  Lng: ${lng.toFixed(6)}<br>
  Akurasi: ${accuracy.toFixed(1)}m ${accuracyWarning}
`;
```

---

## Task 3.3 — Maps Tracking Integration

**Problem:**
`Map.js` dan `TrackingLocation.js` tidak terhubung sama sekali:
- `TrackingLocation.js` → tulis lokasi ke Firebase ✅
- `Map.js` → hanya pakai browser geolocation sendiri, tidak baca Firebase ❌

**Alur yang benar (dikonfirmasi client):**
```
[Smartphone Penyewa]                [Admin / Map.js]
TrackingLocation.js                  Map.js
  GPS → Firebase                   Firebase → Leaflet
peminjaman/{id}/lokasi  ────────→  onValue listener
  { lat, lng, updatedAt }            injectJavaScript
                                     updateMarker(lat, lng)
```

**File yang dimodifikasi:** `Map.js`, `TrackingLocation.js`

### Fix `TrackingLocation.js`:

- [ ] Fix bug dependency array:
  ```js
  // Sebelum (bug):
  useEffect(() => { ... }, [])

  // Sesudah:
  useEffect(() => { ... }, [peminjamanId])
  ```
- [ ] Tambah proper error handling:
  ```js
  (error) => {
    if (error.code === 1) Alert.alert('GPS Error', 'Izin lokasi ditolak');
    else if (error.code === 2) Alert.alert('GPS Error', 'Posisi tidak tersedia');
    else console.log('Location error:', error.message);
  }
  ```

### Fix `Map.js`:

- [ ] Tambah `useRef` untuk WebView ref:
  ```js
  const webViewRef = useRef(null);
  ```
- [ ] Tambah Firebase `onValue` listener ke `peminjaman/{peminjamanId}/lokasi`:
  ```js
  import { ref, onValue } from 'firebase/database';
  import { database } from './FirebaseConfig';

  useEffect(() => {
    if (!peminjamanId) return;
    const lokasiRef = ref(database, `peminjaman/${peminjamanId}/lokasi`);
    const unsubscribe = onValue(lokasiRef, (snapshot) => {
      const lokasi = snapshot.val();
      if (lokasi && webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.updateMarker(${lokasi.latitude}, ${lokasi.longitude});
          true;
        `);
      }
    });
    return () => unsubscribe();
  }, [peminjamanId]);
  ```
- [ ] Tambah `peminjamanId` sebagai prop/param (dikirim dari Listdata.js saat tap order aktif)
- [ ] Di dalam HTML Leaflet string, expose `window.updateMarker`:
  ```js
  window.updateMarker = function(lat, lng) {
    marker.setLatLng([lat, lng]);
    accuracyCircle.setLatLng([lat, lng]);
    map.flyTo([lat, lng], map.getZoom());
    document.getElementById('info').innerHTML = 
      'Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6);
  };
  ```

---

## Urutan Pengerjaan Phase 3

```
1. Fix FirebaseConfig.js — export storage (Task 3.1)
2. Update AdminDashboard.js — ganti TextInput foto dengan ImagePicker (Task 3.1)
3. Fix TrackingLocation.js — dependency array + error handling (Task 3.3)
4. Update Map.js — tambah alerts (Task 3.2) + Firebase listener + injectJavaScript (Task 3.3)
5. Test upload foto motor dari gallery → muncul di listing
6. Test tracking: jalankan TrackingLocation dengan peminjamanId → lihat marker bergerak di Map
```
