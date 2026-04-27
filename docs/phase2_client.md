# Phase 2 — Client Features

> Bergantung pada Phase 1. Kerjakan setelah Phase 1 selesai.

---

## Task 2.1 — OrderSummary Page (Halaman Setelah Continue)

**Problem:**
Tidak ada halaman konfirmasi sebelum order dikirim. User langsung bisa submit tanpa review ulang.

**File baru:** `OrderSummary.js`
**File yang dimodifikasi:** `CrudMahasiswaNav.js`

**Route params yang diterima dari `Createdata.js`:**
- `nama_motor`, `plat_motor`, `harga_motor`
- `startDate`, `endDate`
- `helm`, `deliveryType`, `alamat`, `catatan`

**UI yang perlu dibuat:**
- [ ] Header "Konfirmasi Pesanan"
- [ ] Card ringkasan order:
  - Nama motor + plat
  - Tanggal sewa: startDate → endDate
  - Durasi: `lama_pinjam` hari (auto hitung: `Math.ceil((endDate - startDate) / 86400000)`)
  - Jumlah helm
  - Metode pengambilan (Ambil di Tempat / Diantar ke `alamat`)
  - Catatan (jika ada)
- [ ] Kalkulasi total harga: `harga_motor × lama_pinjam`
- [ ] Tombol "Kembali" → `navigation.goBack()`
- [ ] Tombol "Konfirmasi Pesanan" → Firebase write + navigate ke Pesanan

**Firebase write saat Konfirmasi:**
```js
import { auth } from './FirebaseConfig';
import { database } from './FirebaseConfig';
import { ref, push, get } from 'firebase/database';

// Ambil nama user dari Firebase
const userSnap = await get(ref(database, 'users/' + auth.currentUser.uid));
const nama_penyewa = userSnap.val().nama;

// Push order
await push(ref(database, 'peminjaman'), {
  nama_penyewa,
  uid_penyewa: auth.currentUser.uid,
  nama_motor, plat_motor, harga_motor,
  startDate, endDate, lama_pinjam,
  jumlah_helm: helm,
  metode_pengambilan: deliveryType,
  alamat: deliveryType === 'antar' ? alamat : '',
  catatan,
  status: 'dipinjam',
  createdAt: Date.now(),
});

navigation.navigate('Pesanan'); // → Listdata.js
```

- [ ] Tambahkan loading state saat proses submit
- [ ] Tampilkan error alert jika Firebase write gagal

---

## Task 2.2 — Tab Filter di Atas Halaman History

**Problem:**
`Listdata.js` menampilkan semua data peminjaman dari semua user tanpa filter apapun.

**File yang dimodifikasi:** `Listdata.js`

**Yang perlu dilakukan:**

- [ ] Tambah filter berdasarkan user: hanya tampilkan order milik `auth.currentUser.uid`
  ```js
  const myOrders = dataPeminjaman.filter(item => item.uid_penyewa === auth.currentUser.uid);
  ```
- [ ] Tambah `useState` untuk active tab: `'aktif'` | `'selesai'`
- [ ] Render custom top tab bar di atas FlatList:
  ```
  [ Aktif ]  [ Selesai ]
  ```
  - Tab aktif: border bottom / background highlight
  - Tidak perlu library tambahan, cukup `TouchableOpacity`
- [ ] Filter FlatList data berdasarkan tab yang aktif:
  - Tab "Aktif" → `status === 'dipinjam'`
  - Tab "Selesai" → `status === 'selesai'`
- [ ] Tampilkan empty state jika tidak ada data di tab tersebut

**Contoh struktur state:**
```js
const [activeTab, setActiveTab] = useState('aktif');

const filteredData = myOrders.filter(item =>
  activeTab === 'aktif' ? item.status === 'dipinjam' : item.status === 'selesai'
);
```

---

## Task 2.3 — Profile Page

**Problem:**
Tidak ada profile page sama sekali. User tidak bisa lihat info akun atau logout.

**File baru:** `Profile.js`
**File yang dimodifikasi:** `CrudMahasiswaNav.js` (sudah ditambahkan di Phase 1)

**Data yang dibaca dari Firebase:** `users/{auth.currentUser.uid}`
- `nama`, `phone`, `email`, `role`

**UI yang perlu dibuat:**
- [ ] Avatar placeholder dengan inisial nama (lingkaran berwarna + 2 huruf pertama nama)
- [ ] Display info: Nama, No. Telepon, Email
- [ ] Tombol "Edit Profil" → modal atau inline edit untuk nama & phone
  - Firebase update: `update(ref(database, 'users/' + uid), { nama, phone })`
- [ ] Tombol "Logout":
  ```js
  import { signOut } from 'firebase/auth';
  import { auth } from './FirebaseConfig';

  await signOut(auth);
  navigation.navigate('Login');
  ```
- [ ] Loading state saat fetch data

**Import yang dibutuhkan:**
```js
import { auth, database } from './FirebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
```

---

## Urutan Pengerjaan Phase 2

```
1. Buat OrderSummary.js (Task 2.1) — bergantung pada Phase 1.2
2. Update Listdata.js dengan tab filter + user filter (Task 2.2)
3. Buat Profile.js (Task 2.3)
4. Test full flow: Browse motor → Pilih tanggal → Createdata → OrderSummary → Konfirmasi → muncul di Listdata tab "Aktif"
5. Test tab "Selesai" setelah klik "Selesaikan Peminjaman"
```
