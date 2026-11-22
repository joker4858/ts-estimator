# TS Estimator - Kalkulator Parameter Thiele-Small Speaker

Aplikasi berbasis web dan Android untuk memperkirakan/mengestimasi parameter Thiele-Small (TS) speaker secara empiris berdasarkan diameter dan jenis driver. Sangat berguna bagi DIYer audio, desainer box speaker, dan pehobi audio yang tidak memiliki alat ukur mahal seperti DATS.

Aplikasi ini dikembangkan oleh **Master Naga & Joker** (Joker System).

---

## 🚀 Fitur Utama

- **Estimasi Empiris Akurat**: Mengisi parameter TS secara logis hanya dengan input dimensi fisik dasar.
- **Nilai EBP**: Menampilkan EBP (Efficiency Bandwidth Product, = Fs/Qes) sebagai angka turunan setelah estimasi.
- **Ekspor Data Mudah**: Salin hasil estimasi langsung ke format Markdown untuk forum, atau unduh sebagai berkas konfigurasi teks.
- **PWA Ready**: Bisa diinstal sebagai aplikasi web progresif langsung dari browser Anda.

---

## 🌐 Cara Penggunaan

### 1. Jalankan Langsung di Browser (Web App)
Anda bisa menggunakan aplikasi ini secara instan tanpa instalasi apa pun di HP atau PC Anda:
👉 **[Buka TS Estimator Web App](https://joker4858.github.io/ts-estimator/)**

### 2. Pasang Aplikasi Android (APK)
Jika Anda lebih menyukai aplikasi Android native yang bisa diakses offline:
1. Masuk ke halaman **[Releases](https://github.com/joker4858/ts-estimator/releases)** di repositori ini.
2. Unduh file `.apk` terbaru (misal: `TS-Estimator.apk`).
3. Instal file APK tersebut di HP Android Anda (aktifkan izin instalasi dari sumber tidak dikenal jika diminta).

---

## 🛠️ Pengembangan & Kontribusi

Proyek ini dibangun menggunakan **HTML, CSS, Javascript (Vanilla)**, serta **Capacitor JS** untuk membungkusnya menjadi aplikasi Android native.

### Menjalankan secara Lokal
1. Clone repositori ini:
   ```bash
   git clone https://github.com/joker4858/ts-estimator.git
   ```
2. Jalankan file `index.html` langsung di browser Anda. Catatan: service worker hanya aktif lewat http/https — untuk menguji PWA offline, jalankan server lokal (mis. `npx serve` atau `python3 -m http.server`) lalu buka http://localhost:8000.

### Menjalankan Tes Solver
```bash
npm test
```
Tes (`test/solver.test.js`, tanpa dependensi) memeriksa konsistensi himpunan estimasi: kasus kosong per jenis/ukuran driver, kontrol datasheet, dan peringatan residu.

### Build APK Android Sendiri
1. Pastikan Anda sudah menginstal Node.js dan Android SDK.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Bangun aset web dan lakukan sinkronisasi dengan Android:
   ```bash
   npm run sync
   ```
4. Buka proyek Android di Android Studio:
   ```bash
   npx cap open android
   ```
5. Build APK melalui Android Studio atau gunakan gradle:
   ```bash
   cd android && ./gradlew assembleDebug
   ```

---

## 📋 Riwayat Versi

- **v1.8.1** — Perbaikan solver: Mms diturunkan dari Fs+Cms (bukan lagi heuristik Sd×0,18), cek residu akhir dengan peringatan, penyesuaian input dicatat; EBP ditampilkan di layar; klasifikasi box dihapus (di luar scope komponen driver); cache service worker v2; tes solver otomatis.

---

## 📄 Lisensi

Proyek ini bersifat open source dan disebarkan secara gratis untuk siapa saja yang membutuhkan. Lisensi ISC.
