# Phase 4 — UI Revisi

> Dikerjakan terakhir setelah semua fitur Phase 1-3 selesai dan stabil.
> Tujuan: konsistensi visual dan polish keseluruhan app.

---

## Prinsip UI yang Perlu Dijaga

- Konsistensi warna (definisikan color palette di satu tempat, misal `colors.js`)
- Loading state di semua screen yang fetch data
- Empty state jika tidak ada data
- Error handling yang tampil ke user (bukan hanya console.log)

---

## Task 4.1 — Mahasiswa.js (Browse Motor)

- [ ] Perbaiki card motor: tambah shadow, rounded corners konsisten
- [ ] Loading skeleton saat data motor belum loaded (ganti teks "loading" dengan placeholder card)
- [ ] Empty state jika tidak ada motor tersedia
- [ ] Harga ditampilkan dengan format Rupiah: `Rp 150.000/hari`
- [ ] Modal kalender: perbaiki tampilan date info box agar lebih clean

---

## Task 4.2 — Createdata.js

- [ ] Header "Cart" — konsistensi warna dengan color palette
- [ ] Tombol increment/decrement helm: lebih besar dan mudah di-tap
- [ ] Tombol delivery type: visual selected state lebih jelas (bukan hanya warna teks)
- [ ] Validasi form: tampilkan error inline jika ada field wajib yang kosong sebelum Navigate

---

## Task 4.3 — OrderSummary.js

- [ ] Layout kartu ringkasan yang rapi dengan separator antar item
- [ ] Total harga ditampilkan prominent (font besar, warna accent)
- [ ] Loading state saat submit (tombol disabled + spinner)

---

## Task 4.4 — Listdata.js (History)

- [ ] Tab bar "Aktif" / "Selesai" yang visually clear (animated indicator)
- [ ] Card order: layout info lebih terstruktur (grid 2 kolom kecil)
- [ ] Status badge: pill shape dengan warna background (orange/green)
- [ ] Empty state per tab: "Belum ada pesanan aktif" / "Belum ada pesanan selesai"

---

## Task 4.5 — AdminDashboard.js

- [ ] Grid motor: gambar motor konsisten ukurannya (aspect ratio terjaga)
- [ ] Tombol "+" add motor: floating action button (FAB) di pojok kanan bawah
- [ ] Tombol hapus motor: tambah konfirmasi alert sebelum delete
- [ ] Modal tambah motor: form lebih spacious, keyboard avoiding

---

## Task 4.6 — Profile.js

- [ ] Avatar inisial: background color generatif dari nama (bukan hardcoded)
- [ ] Layout info user: icon + label + value yang rapi
- [ ] Edit mode: toggle antara view dan edit inline
- [ ] Tombol logout: warna merah, di bagian bawah screen

---

## Task 4.7 — Login & Register

- [ ] Minor polish: pastikan keyboard avoiding bekerja di kedua screen
- [ ] Loading button state saat proses login/register
- [ ] Error message dari Firebase ditampilkan dalam bahasa yang user-friendly

---

## Color Palette Saran

Buat file `src/theme/colors.js` (atau `colors.js` di root):

```js
export const colors = {
  primary: '#F5A623',      // golden/orange — sudah ada di beberapa screen
  secondary: '#1A1A2E',    // dark navy
  success: '#4CAF50',      // status selesai
  warning: '#FF9800',      // status dipinjam
  danger: '#F44336',       // delete / error
  background: '#F5F5F5',
  surface: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
};
```

---

## Urutan Pengerjaan Phase 4

```
1. Buat colors.js dan terapkan ke semua screen
2. Mahasiswa.js → Createdata.js → OrderSummary.js (flow utama user dulu)
3. Listdata.js
4. Profile.js
5. AdminDashboard.js
6. Login & Register
7. Final review: screenshot tiap screen, bandingkan konsistensi
```
