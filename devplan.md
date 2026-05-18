# Development Plan (DevPlan)
## Portal Ujian — Web App QR Code & Token Verification

Dokumen ini memecah *Product Requirement Document (PRD)* menjadi langkah-langkah pengembangan terstruktur (Task Breakdown). Kita akan menggunakan pendekatan iteratif, membangun fitur dari pondasi hingga sistem anti-kecurangan.

---

## 🛠️ Phase 1: Project Setup & UI Foundation
**Tujuan:** Membangun kerangka dasar aplikasi (Single Page Application) dan Design System.
1. **Setup Struktur Folder:**
   - Membuat `index.html` (Entry point).
   - Membuat folder `css/` dan `js/`.
   - Mengimpor library pihak ketiga via CDN (QRCode.js, CryptoJS, Lucide Icons, Google Fonts).
2. **Design System & Styling (`style.css`):**
   - Mendefinisikan *CSS Variables* untuk warna (Dark Theme/Glassmorphism).
   - Membuat kelas utilitas (utilities) untuk layouting (Flexbox/Grid).
   - Membangun komponen UI dasar: *Buttons, Cards, Forms, Modals, Badges, Toast Notifications*.
3. **Router & Navigation (`app.js`):**
   - Membuat sistem routing sederhana berbasis ID/Hash untuk SPA (mengganti tampilan tanpa reload browser).

## 🗄️ Phase 2: State Management & Data Layer
**Tujuan:** Menyiapkan struktur penyimpanan di `localStorage`.
1. **Schema Users (`db_users`):** ID User, Role (SuperAdmin/Dosen/Mahasiswa), Username, Password (hashed), Nama.
2. **Schema Mahasiswa (`db_mahasiswa`):** NIM, Nama, Jurusan, Status Kelayakan (Eligible/Not Eligible).
3. **Schema Ujian (`db_exams`):** ID Ujian, ID Dosen, Nama, Mata Kuliah, Kode Ruangan, Link G-Form asli, Status.
4. **Schema Token (`db_tokens`):** Token ID, ID Ujian, NIM, Status (Aktif/Terpakai).
5. **Schema Logs (`db_logs`):** ID Log, Timestamp, ID Ujian, NIM/Nama, Metode Akses, Tipe (Success, Failed, Cheat Attempt).
6. **CRUD Utilities (`utils.js`):** Fungsi helper untuk read/write ke `localStorage`.

## 🛡️ Phase 3: Role Dashboards (Super Admin & Dosen)
**Tujuan:** Membangun fungsionalitas sisi manajemen.
1. **Login System & RBAC:** Form login yang mendeteksi role (Super Admin vs Dosen) dan redirect ke dashboard yang sesuai.
2. **Super Admin Dashboard (`superadmin.js`):**
   - CRUD Dosen.
   - CRUD Mahasiswa (individual dan bulk import).
   - Fitur update "Status Kelayakan Ujian" mahasiswa.
3. **Dosen Dashboard & Manajemen Ujian (`dosen.js`):**
   - Form tambah ujian baru (generate 6-digit Kode Ruangan otomatis).
   - Mengatur izin mahasiswa peserta ujian (otomatis filter yang Eligible).
   - Menampilkan tabel daftar ujian.
4. **Token Generation (`token.js`):**
   - Generate token 12 karakter `XXXX-XXXX-XXXX` untuk mahasiswa yang diizinkan.
5. **QR Code Generator:**
   - Menggunakan `qrcode.js` untuk QR berisi *Link Verifikasi + Kode Ruangan*.
   - Fitur download/tampilkan QR.

## 🎓 Phase 4: Student Verification Flow
**Tujuan:** Membangun gerbang validasi (Sisi Mahasiswa).
1. **Landing Page Utama:** Form input 6-digit "Kode Ruangan" (untuk pengguna Laptop).
2. **Halaman Verifikasi Ujian:**
   - Entry dari QR Code atau dari Landing Page.
   - Menampilkan detail ujian (Mata Kuliah) berdasarkan Kode Ruangan.
   - Form input "Token 12 Karakter".
3. **Validasi Token:**
   - Cek token di `localStorage` (cocok dengan ujian, belum terpakai).
   - Jika gagal: Tampilkan Toast error, rekam di tabel logs.
   - Jika berhasil: Lanjut ke Phase 5.

## 👁️‍🗨️ Phase 5: Secure Exam Mode & Anti-Cheat
**Tujuan:** Mengamankan pelaksanaan ujian di browser.
1. **Penerapan Iframe & Layout:**
   - Jika verifikasi berhasil, ganti tampilan ke mode layar penuh berisi `iframe` Google Form.
   - Tampilkan *Watermark Overlay* (Nama & NIM) melayang transparan.
2. **Fullscreen Enforcement:**
   - Menambahkan tombol "Mulai Ujian" yang mewajibkan API `requestFullscreen()`.
   - Jika keluar fullscreen (`fullscreenchange` event), `iframe` disembunyikan/blur sampai masuk fullscreen lagi.
3. **Focus Tracking (Tab/Window Tracking):**
   - Listener untuk `window.onblur` (pindah tab/aplikasi lain).
   - Menampilkan layar "Peringatan Kecurangan!" saat `blur` terdeteksi.
   - Mencatat event "Cheat Attempt (Focus Lost)" ke `db_logs`.
4. **Block Shortcuts:** Intercept `contextmenu` (klik kanan) dan keydown event untuk kombinasi tombol (Ctrl+C/V).

## 📊 Phase 6: Access Tracker & Analytics
**Tujuan:** Fitur monitoring untuk Dosen.
1. **Tracker UI (`tracker.js`):**
   - Menampilkan tabel log aktivitas.
   - Filter log berdasarkan ID Ujian atau Tipe Ancaman (Cheat Attempt).
   - Real-time refresh (jika memungkinkan secara lokal).

## ✨ Phase 7: Polish & Export Features
**Tujuan:** Finishing dan fitur pelengkap.
1. **Export to CSV/Excel:** Menambahkan kemampuan mendownload daftar token atau laporan log untuk diarsipkan dosen.
2. **Final Testing:**
   - Menguji *User Flow* Super Admin (CRUD User, Kelayakan).
   - Menguji *User Flow* Dosen (Manajemen Ujian, Token, Tracker).
   - Menguji *User Flow* Mahasiswa (HP & Laptop).
   - Verifikasi *Mobile-Responsive UI*.

---
**Catatan:** Pengembangan akan dilakukan berurutan dari Phase 1 hingga Phase 7.
