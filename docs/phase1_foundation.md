# Phase 1 — Foundation Fixes

> Harus dikerjakan duluan karena phase lain bergantung pada ini.

---

## Task 1.1 — Role-Based Navigation

**Problem:**
`CrudMahasiswaNav.js` punya satu Tab Navigator tunggal. Semua user (admin & regular) dapat tab yang sama persis.

**File yang dimodifikasi:** `CrudMahasiswaNav.js`, `Login/Login.js`

**Yang perlu dilakukan:**

- [ ] Ubah struktur `CrudMahasiswaNav.js` menjadi Stack Navigator di top level
- [ ] Buat `UserTabNav` dengan tabs:
  - Menu (`Mahasiswa.js`) — icon: faBookOpen
  - Pesan Disini (`Createdata.js`) — icon: faPlusCircle
  - Pesanan (`Listdata.js`) — icon: faList
  - Maps (`Map.js`) — icon: faMap
  - Profile (`Profile.js`) — icon: faUser *(dibuat di Phase 2)*
- [ ] Buat `AdminTabNav` dengan tabs:
  - Dashboard Motor (`AdminDashboard.js`) — icon: faMotorcycle
  - Maps (`Map.js`) — icon: faMap
  - Profile (`Profile.js`) — icon: faUser *(dibuat di Phase 2)*
- [ ] Pass `role` dari Login ke navigator — bisa via `navigation.navigate('UserHome')` atau `navigation.navigate('AdminHome')` sebagai nama Stack screen masing-masing
- [ ] Hapus screen `Edit Pesanan` (EditData.js) dari navigator — file ini masih pakai JSON Server lama, tidak relevan

**Catatan teknis:**
Login.js sudah baca `users/{uid}.role` dari Firebase dan sudah ada conditional navigate. Tinggal pastikan nama screen yang di-navigate sesuai dengan Stack Navigator baru.

---

## Task 1.2 — History Order Masuk ke DB

**Problem:**
`Createdata.js` tidak punya satu pun Firebase call. Tombol "Continue" tidak melakukan apa-apa — data order tidak pernah tersimpan ke database.

**File yang dimodifikasi:** `Createdata.js`, `CrudMahasiswaNav.js`
**File baru:** `OrderSummary.js` *(detail implementasi di Phase 2, Task 2.1)*

**Yang perlu dilakukan:**

- [ ] Ubah tombol "Continue" di `Createdata.js` menjadi navigate ke `OrderSummary`:
  ```js
  navigation.navigate('OrderSummary', {
    nama_motor,
    plat_motor,
    harga_motor,   // perlu ditambahkan, dipass dari Mahasiswa.js
    startDate,
    endDate,
    helm,
    deliveryType,
    alamat,
    catatan,
  });
  ```
- [ ] Tambahkan `harga` ke params yang dikirim `Mahasiswa.js` → `Createdata.js`:
  - Di `Mahasiswa.js`, ubah `navigation.navigate('Pesan Disini', {...})` tambahkan `harga_motor: item.harga`
  - Di `Createdata.js`, terima `harga_motor` dari `route.params`
- [ ] Tambahkan screen `OrderSummary` ke navigator di `CrudMahasiswaNav.js`

**Firebase write dilakukan di `OrderSummary.js` (Phase 2.1), bukan di sini.**

**Struktur data yang akan ditulis ke Firebase:**
```
peminjaman/{pushId}: {
  nama_penyewa: string,       // dari users/{uid}.nama
  uid_penyewa: string,        // auth.currentUser.uid
  nama_motor: string,
  plat_motor: string,
  harga_motor: number,
  startDate: string,
  endDate: string,
  lama_pinjam: number,        // kalkulasi hari (endDate - startDate)
  jumlah_helm: number,
  metode_pengambilan: string, // 'ambil' | 'antar'
  alamat: string,             // kosong jika 'ambil'
  catatan: string,
  status: 'dipinjam',
  createdAt: timestamp,
}
```

---

## Urutan Pengerjaan Phase 1

```
1. Modifikasi CrudMahasiswaNav.js (role-based split)
2. Modifikasi Mahasiswa.js (tambah harga di params)
3. Modifikasi Createdata.js (terima harga, ubah tombol Continue)
4. Buat OrderSummary.js skeleton (lanjut lengkap di Phase 2.1)
5. Test login admin → dapat AdminTabNav
6. Test login user → dapat UserTabNav
```
