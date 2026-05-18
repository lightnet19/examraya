# Product Requirement Document (PRD)
## Portal Ujian — Web App QR Code & Token Verification

**Tanggal Dokumen:** 18 Mei 2026
**Status:** Perencanaan
**Target Pengguna:** Dosen/Admin Perguruan Tinggi & Mahasiswa

---

## 1. Executive Summary
Portal Ujian adalah aplikasi berbasis web yang dirancang khusus untuk perguruan tinggi guna mengamankan dan melacak akses ke soal ujian (UTS/UAS) yang menggunakan Google Form. Sistem ini bertindak sebagai "gatekeeper" yang memvalidasi hak akses mahasiswa menggunakan kombinasi QR Code dan Token unik sebelum mereka diarahkan ke link ujian sebenarnya. Hal ini menyelesaikan masalah distribusi link Google Form yang sering bocor dan diakses secara ilegal oleh mahasiswa yang tidak memenuhi persyaratan (misalnya: belum bayar SPP, kehadiran kurang, dll).

## 2. Latar Belakang & Masalah
- **Masalah Saat Ini:** Dosen menggunakan Google Form untuk UTS/UAS. Link sering dibagikan di grup WhatsApp atau via QR Code biasa. Link ini mudah disebar ke mahasiswa lain yang sebenarnya tidak memenuhi syarat untuk ikut ujian. Google Form standar tidak memiliki mekanisme validasi perorangan sebelum ujian dimulai (kecuali pembatasan domain email).
- **Kebutuhan:** Sebuah portal perantara yang bisa memastikan hanya mahasiswa yang membawa "karcis" (Token) resmi yang bisa membuka soal ujian, sekaligus mencatat (tracking) siapa saja yang mencoba masuk secara ilegal.

## 3. Tujuan Produk (Goals)
1. **Keamanan Akses:** Mencegah mahasiswa yang tidak berhak mengakses ujian UTS/UAS.
2. **Validasi Individu:** Memastikan satu mahasiswa hanya bisa masuk menggunakan satu token unik yang telah diberikan.
3. **Pelacakan (Tracking):** Memberikan transparansi kepada dosen terkait aktivitas akses (legal maupun ilegal).
4. **Kemudahan Penggunaan:** UI/UX yang modern, profesional, dan mudah digunakan baik oleh dosen (admin) maupun mahasiswa (end-user).

## 4. Target Pengguna (User Personas)
### 4.1 Super Admin
- **Tugas:** Manajemen pengguna (Dosen & Mahasiswa). Mengunggah data mahasiswa, memverifikasi kelayakan ujian (berdasarkan SPP, absensi, dll), dan memantau keseluruhan sistem.
- **Kebutuhan:** Antarmuka CRUD User, fitur upload massal data mahasiswa, dan pengaturan kelayakan ujian global.

### 4.2 Dosen
- **Tugas:** Membuat sesi ujian, menginput link Google Form, mengatur izin akses mahasiswa khusus untuk mata kuliahnya, mendownload QR Code, dan memantau log akses ujiannya.
- **Kebutuhan:** Antarmuka yang bersih untuk manajemen ujian, generate token, dan akses tracker spesifik kelasnya.

### 4.3 Mahasiswa
- **Tugas:** Melakukan scan QR Code di ruang ujian (atau input Kode Ruangan), memasukkan token, dan mengerjakan ujian.
- **Kebutuhan:** Halaman verifikasi yang cepat, responsif di HP, dan pesan error jelas jika token salah atau status tidak layak.

## 5. Fitur Produk (Feature Requirements)

### 5.1 Dashboard Super Admin
- **Manajemen Pengguna (Dosen):** CRUD akun Dosen (Username, Nama, Password).
- **Manajemen Pengguna (Mahasiswa):**
  - CRUD Data Mahasiswa (NIM, Nama, Jurusan).
  - Bulk Import Mahasiswa (opsional via CSV).
  - Mengubah **Status Kelayakan Ujian** (Eligible / Not Eligible) berdasarkan syarat akademik/administrasi secara global.
- **System Settings:** Memantau log sistem secara global.

### 5.2 Dashboard Dosen
- **Autentikasi:** Login menggunakan akun dari Super Admin.
- **Manajemen Ujian (CRUD):**
  - Membuat sesi ujian baru (Mata Kuliah, Link Google Form).
  - Mengedit status ujian (Aktif/Selesai).
- **Manajemen Peserta & Token:**
  - Hanya dapat men-generate token untuk mahasiswa yang **berstatus Layak Ujian** dari Super Admin.
  - Dosen dapat mengizinkan atau memblokir akses mahasiswa tertentu secara spesifik (override) di kelasnya.
  - Generate token tunggal/massal (12 karakter `A1B2-C3D4-E5F6`).
  - Export Token ke CSV/Excel.
- **QR Code & Room Code Generator:**
  - Secara otomatis membuat QR Code yang mengarah ke URL Halaman Verifikasi.
  - Secara otomatis men-generate **Kode Ruangan (6 Karakter)** untuk mahasiswa yang menggunakan laptop (sebagai alternatif pengganti scan QR).
  - Fitur Download QR Code (PNG) yang sudah disertai Kode Ruangan tercetak di bawahnya untuk ditampilkan di proyektor/dicetak.
- **Access Tracker (Log Aktivitas):**
  - Dashboard monitoring real-time/historis.
  - Tabel log yang mencatat: Waktu, IP Address/Browser (User Agent), Metode Akses, dan Status.
  - *Identifikasi Ancaman:* Mendeteksi dan melabeli percobaan scan tanpa token atau percobaan masuk menggunakan direct link verifikasi tanpa prosedur yang benar.

### 5.2 Halaman Verifikasi & Ujian (Sisi Mahasiswa)
- **Entry Point Utama:** Portal Ujian menyediakan halaman awal untuk memasukkan "Kode Ruangan" bagi mahasiswa ber-laptop.
- **Entry Point QR:** Diakses langsung setelah mahasiswa melakukan scan QR Code dari HP. Keduanya akan mengarah ke Halaman Verifikasi.
- **Form Verifikasi:** Input field untuk memasukkan Token 12 karakter.
- **Validasi Cerdas:** 
  - Mengecek apakah token valid untuk ujian tersebut.
  - Mengecek apakah token sudah pernah digunakan (Single-use policy).
- **Secure Exam Mode (Embedded Google Form):** 
  - Jika token valid, halaman tidak melakukan redirect. Sebaliknya, Google Form akan dimuat di dalam aplikasi (menggunakan `iframe`) secara penuh layar.
  - Token langsung ditandai "Terpakai".
- **Tracking Otomatis:** Saat halaman dibuka dan ujian berlangsung, sistem mencatat aktivitas secara real-time.

### 5.3 Sistem Proteksi Anti-Kecurangan (Anti-Cheat)
- **Wajib Fullscreen:** Mahasiswa diwajibkan mengaktifkan mode Fullscreen untuk memuat soal. Jika keluar dari Fullscreen, soal akan ditutupi oleh layar peringatan.
- **Tab/Window Focus Tracking:** Mendeteksi jika mahasiswa berpindah tab browser atau membuka aplikasi lain. Layar soal akan otomatis di-blur/terkunci sementara, dan pelanggaran akan dikirim ke Log Admin (Tracker).
- **Disable Interaksi Parent:** Menonaktifkan klik kanan (Context Menu), pintasan keyboard (Ctrl+C, Ctrl+V, F12, Print) pada aplikasi pembungkus.
- **Watermark Identitas:** Menampilkan overlay transparan nama/NIM mahasiswa secara dinamis di atas layar untuk mencegah perekaman layar atau pemotretan soal.

## 6. Alur Penggunaan (User Flow)

### 6.1 Flow Persiapan (Super Admin & Dosen)
1. **Super Admin:** Login, mendaftarkan akun Dosen, dan menginput/upload data Mahasiswa. Super Admin menandai mahasiswa mana saja yang *Layak Ujian* (Eligible).
2. **Dosen:** Login menggunakan akunnya, lalu membuat ujian baru dan memasukkan Link Google Form.
3. Portal menghasilkan URL Verifikasi, Kode Ruangan, dan QR Code.
4. **Dosen:** Memilih mahasiswa untuk ujiannya. Sistem hanya men-generate token untuk mahasiswa yang *Layak Ujian*. (Dosen bisa memblokir/mengizinkan mahasiswa secara manual jika diperlukan).
5. Dosen mendownload QR Code dan daftar Token (CSV).
6. Dosen membagikan token secara privat ke masing-masing mahasiswa yang diizinkan ujian.

### 6.2 Flow Pelaksanaan Ujian (Mahasiswa)
1. Dosen menampilkan QR Code dan Kode Ruangan di depan kelas.
2. **Opsi Akses HP:** Mahasiswa scan QR Code menggunakan smartphone.
3. **Opsi Akses Laptop:** Mahasiswa membuka portal utama, memasukkan Kode Ruangan 6 karakter.
4. Keduanya mengarah ke Halaman Verifikasi Portal Ujian.
5. Mahasiswa memasukkan Token pribadi mereka.
6. Sistem memvalidasi Token:
   - *Jika Invalid/Terpakai:* Tampil pesan error, log kegagalan dicatat.
   - *Jika Valid:* Mahasiswa diminta memberikan izin masuk Fullscreen.
6. Google Form terbuka di dalam aplikasi (Secure Mode).
7. Jika mahasiswa mencoba pindah aplikasi/tab, peringatan muncul dan dicatat ke server/log dosen.
8. Setelah submit form, mahasiswa menekan tombol "Selesai Ujian" untuk kembali.

### 6.3 Flow Analisis (Dosen & Super Admin)
1. Pasca ujian, Dosen membuka menu Tracker di dashboardnya.
2. Dosen melihat log akses untuk mendeteksi percobaan akses gagal atau *Cheat Attempt* (seperti tab focus lost).
3. Super Admin dapat melihat log global dari seluruh ujian jika diperlukan.

## 7. Desain & UX (Non-Functional Requirements)
- **Tema:** Dark theme premium (Glassmorphism), terlihat profesional untuk tingkat perguruan tinggi.
- **Responsivitas:** Halaman verifikasi mahasiswa harus 100% Mobile-Friendly (karena diakses via scan QR dari HP). Dashboard admin dioptimalkan untuk Desktop/Tablet.
- **Aksesibilitas:** Pesan error harus jelas (contoh: "Token Kadaluarsa", "Token Sudah Digunakan").
- **Kecepatan:** Waktu loading halaman verifikasi harus di bawah 2 detik.

## 8. Spesifikasi Teknis (Tech Stack Awal)
Mengingat ini adalah versi *Standalone/Prototype* untuk penggunaan personal dosen:
- **Frontend:** Vanilla HTML5, CSS3 (Custom Glassmorphism CSS), JavaScript ES6.
- **Penyimpanan Data:** `localStorage` browser (Client-side storage). *Note: Data hanya tersimpan di komputer dosen. Untuk skalabilitas (diakses dari berbagai perangkat), butuh migrasi ke Backend (misal: Firebase/Supabase).*
- **QR Code:** Library `qrcode.js`.
- **Keamanan Token:** Hashing sederhana menggunakan `CryptoJS` untuk mencegah tampering di sisi client.

## 9. Rencana Rilis (Roadmap)
- **Fase 1 (MVP - Minimum Viable Product):**
  - UI Dashboard Admin & Halaman Verifikasi.
  - Logika CRUD Ujian & Generate Token di `localStorage`.
  - Fitur Scan QR & Redirect.
- **Fase 2 (Enhancement):**
  - Advanced Access Tracker dengan grafik statistik.
  - Export data ke Excel/CSV.
  - Fitur print token (layout kartu).
- **Fase 3 (Future - Opsional):**
  - Integrasi Backend/Database Online agar dosen bisa login dari laptop mana saja.

---
*Dokumen ini adalah acuan pengembangan (blueprint) untuk proyek Portal Ujian. Semua fitur akan dibangun berdasarkan spesifikasi di atas.*
