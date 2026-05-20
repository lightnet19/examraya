# Development Log (DevLog)
## Portal Ujian — Web App QR Code & Token Verification

Dokumen ini digunakan untuk melacak semua aktivitas pengembangan, perubahan kode, dan keputusan teknis yang dibuat selama proses pembangunan aplikasi.

---

### [18 Mei 2026] - Tahap Perencanaan (Planning Phase)
- **Tugas Dilakukan:** Pembuatan dokumen perencanaan arsitektur dan persyaratan sistem.
- **File Dibuat / Diubah:**
  - `implementation_plan.md`: Menyusun arsitektur dasar, alur kerja (Admin & Mahasiswa), serta pemilihan *tech stack* (Vanilla HTML/CSS/JS + localStorage).
  - `prd.md`: Menyusun *Product Requirement Document* yang mencakup *Executive Summary*, *User Personas*, *Feature Requirements*, dan *User Flow*.
  - *Update (PRD & Plan):* Menambahkan fitur **Secure Exam Mode** (Google Form *embedded* dalam iframe) dan **Anti-Cheat System** (wajib *fullscreen*, *tab/focus tracking*, blokir klik kanan).
  - *Update (PRD & Plan):* Menambahkan alternatif **Kode Ruangan** 6-karakter bagi mahasiswa yang menggunakan laptop agar tidak perlu melakukan *scan* QR Code.
  - `devplan.md`: Membuat *Development Plan* yang memecah eksekusi proyek menjadi 7 Fase (Phase 1 hingga Phase 7).
  - `devlog.md`: Membuat file log ini untuk melacak riwayat pengembangan.
- **Status:** Perencanaan selesai. Siap untuk masuk ke Phase 1 (Project Setup & UI Foundation).

### [18 Mei 2026] - Eksekusi Phase 1 (UI Foundation & Setup)
- **Tugas Dilakukan:** Pembuatan pondasi aplikasi *Single Page Application* (SPA), sistem *routing*, dan *Design System*.
- **File Dibuat:**
  - `index.html`: Entry point aplikasi yang mengimpor *library* (QRCode.js, CryptoJS, Lucide Icons).
  - `css/style.css`: Mendesain tema dasar aplikasi (Dark Mode + Glassmorphism) menggunakan *CSS Variables*. Membuat komponen dasar (`.btn`, `.form-control`, `.glass-panel`, `.toast`).
  - `js/app.js`: Membangun *Router* berbasis *hash* untuk sistem SPA. Menyiapkan kerangka tampilan (View) untuk halaman awal (`home`) dan login dosen (`admin`).
  - `js/utils.js`, `js/token.js`, `js/tracker.js`, `js/admin.js`: Membuat file kosong (stub) agar siap digunakan untuk fase selanjutnya tanpa error 404 dari browser.
- **Status:** Phase 1 Selesai. Lanjut ke Phase 2 (State Management).

### [18 Mei 2026] - Refaktor Arsitektur Role (Super Admin & Dosen)
- **Tugas Dilakukan:** Memperbarui kode dari Fase 1 dan dokumen perencanaan untuk mencerminkan pemisahan peran antara Super Admin dan Dosen.
- **File Diubah / Dibuat:**
  - `implementation_plan.md` & `devplan.md`: Memperbarui skema peran, memisahkan dashboard Super Admin (manajemen user/kelayakan) dan Dosen (manajemen ujian/token).
  - `index.html`: Mengganti rujukan `admin.js` menjadi `superadmin.js` dan `dosen.js`.
  - `js/app.js`: Memperbarui sistem perutean (*routing*) untuk mengakomodasi Dasbor Super Admin dan Dasbor Dosen, serta halaman login terpadu dengan pintasan (bypass).
  - `js/superadmin.js` & `js/dosen.js`: Dibuat sebagai kerangka modul logika. File lama `admin.js` dihapus.
- **Status:** Refaktor Role selesai.

### [18 Mei 2026] - Eksekusi Phase 2 (State Management & Data Layer)
- **Tugas Dilakukan:** Mengimplementasikan skema database lokal menggunakan `localStorage` beserta utilitas fungsionalnya.
- **File Diubah:**
  - `js/utils.js`:
    - Membuat inisialisasi awal skema tabel: `db_users`, `db_mahasiswa`, `db_exams`, `db_tokens`, `db_logs`.
    - Melakukan injeksi data default otomatis untuk akun Super Admin (`admin`/`admin123`) bila database kosong saat awal aplikasi dimuat.
    - Menambahkan helper CRUD lengkap (`get`, `set`, `insert`, `update`, `delete`, `findBy`, `findOneBy`).
    - Membangun *utility methods* seperti `generateId()`, `hash()` menggunakan CryptoJS, fungsi *formatting* tanggal, dan fitur *copy to clipboard*.
- **Status:** Phase 2 Selesai. Lanjut ke Phase 3 (Role Dashboards).

### [18 Mei 2026] - Eksekusi Phase 3 (Role Dashboards)
- **Tugas Dilakukan:** Mengimplementasikan fitur utama Dasbor untuk peran manajemen (Super Admin & Dosen) berikut fungsionalitas CRUD dasarnya.
- **File Diubah:**
  - `js/app.js`: 
    - Mengintegrasikan mekanisme otentikasi login asli (`App.handleLogin`) yang memvalidasi *username* & *password* melalui `db_users`.
    - Menyimpan *session* login ke `localStorage` agar sesi tetap terjaga saat *reload*.
    - Menambahkan sistem proteksi perutean *(route protection)* sehingga rute `/superadmin` dan `/dosen` tidak bisa diakses secara bebas jika belum login.
  - `js/superadmin.js`:
    - Membuat antarmuka tab "Kelola Dosen" dan "Kelola Mahasiswa".
    - Membuat fitur form tambah Dosen & Mahasiswa dan menyimpannya ke tabel masing-masing.
    - Membuat fitur ubah status kelayakan ujian *(Toggle Eligibility)* bagi mahasiswa (Layak/Diblokir).
  - `js/dosen.js`:
    - Membuat antarmuka tab "Daftar Ujian" dan "Buat Ujian Baru".
    - Mengimplementasikan logika "Pembuatan Ujian" yang mana saat disimpan, sistem akan secara otomatis memproduksi Kode Ruangan 6-karakter acak.
- **Status:** Phase 3 Selesai. Lanjut ke Phase 4 (Student Verification Flow).

### [18 Mei 2026] - Eksekusi Phase 4 (Student Verification Flow)
- **Tugas Dilakukan:** Mengimplementasikan halaman awal untuk verifikasi mahasiswa dan alur otentikasi Kode Ruangan, NIM, serta eligibilitas.
- **File Diubah:**
  - `index.html`: Menambahkan *script tag* untuk *library* `html5-qrcode` (pemindai QR Code) dan `js/student.js`.
  - `js/app.js`: 
    - Mengubah tampilan rute `home` untuk dikendalikan penuh oleh komponen `Student`.
    - Menambahkan rute `exam` sementara (beserta sistem perlindungannya yang membaca variabel *localStorage* `active_exam_session`) sebagai persiapan Phase 5.
  - `js/student.js`:
    - Membuat antarmuka Halaman Awal untuk Input Kode Ruangan atau pindai QR Code.
    - Mengintegrasikan fitur pemindai QR (*QR Scanner*) dengan HTML5-QRCode.
    - Membuat alur *Student Verification*: Input Kode Ruangan -> Cari di `db_exams` -> Minta Input NIM -> Cek `db_mahasiswa` -> Cek status kelayakan (`eligible`).
    - Membangun *generator Token Ujian* (`generateExamToken()`) yang otomatis memasukkan data sesi ke `db_tokens` dengan status "active".
- **Status:** Phase 4 Selesai. Lanjut ke Phase 5 (Secure Exam Mode).

### [18 Mei 2026] - Eksekusi Phase 5 (Secure Exam Mode)
- **Tugas Dilakukan:** Mengimplementasikan mode ujian aman dengan *fullscreen enforcement*, *iFrame* Google Form, dan deteksi kecurangan dasar.
- **File Diubah:**
  - `index.html`: Menambahkan referensi script untuk `js/exam.js`.
  - `js/app.js`: Mengganti antarmuka sementara pada rute `exam` agar memanggil fungsi inisialisasi dari komponen `Exam`.
  - `js/exam.js` (Baru):
    - Membuat antarmuka persiapan (Pre-Exam UI) yang menampilkan Token ujian sebelum mahasiswa masuk mode layar penuh.
    - Membangun `renderActiveExamUI()` yang merender *iFrame* dari *link* Google Form tersimpan beserta informasi peserta.
    - Menambahkan sistem keamanan (*bindSecurityEvents*):
      - Mencegah klik kanan (`contextmenu`).
      - Deteksi keluar dari mode layar penuh (`fullscreenchange`) dan menahan layar dengan *overlay* peringatan.
      - Deteksi pergantian *tab* atau *minimize* (`visibilitychange`) dan hilangnya fokus dari jendela browser (`blur`).
    - Membuat fungsi `logAction()` untuk mencatat segala bentuk pelanggaran (*EXIT_FULLSCREEN*, *TAB_SWITCH*, *WINDOW_BLUR*) serta waktu mulai/selesai ujian ke dalam `db_logs`.
    - Menonaktifkan/merubah status Token menjadi "used" saat mahasiswa menyelesaikan ujian.
- **Status:** Phase 5 Selesai. Lanjut ke Phase 6 (Access Tracker / Log Management).

### [18 Mei 2026] - Eksekusi Phase 6 (Access Tracker / Log Management)
- **Tugas Dilakukan:** Mengimplementasikan fitur *Monitoring Tracker* (Log Keamanan) pada Dasbor Dosen untuk melacak pelanggaran mahasiswa.
- **File Diubah:**
  - `js/dosen.js`:
    - Menambahkan tab menu "Monitoring Tracker".
    - Membuat antarmuka tabel laporan yang menampilkan waktu, Mahasiswa (NIM), nama Ujian, dan Aksi Pelanggaran.
    - Menambahkan filter *dropdown* berdasarkan ujian yang dikelola oleh dosen yang *login*.
    - Membangun logika `loadLogs()` yang akan menarik data dari `db_logs`, mencocokkannya dengan `db_mahasiswa` (untuk nama) dan `db_exams` (untuk memfilter ujian milik Dosen), lalu merendernya dengan *highlighting* warna khusus (merah untuk pelanggaran).
- **Status:** Phase 6 Selesai. Lanjut ke Phase 7 (Final Polish & Exporting).

### [18 Mei 2026] - Eksekusi Phase 7 (Final Polish & Exporting)
- **Tugas Dilakukan:** Finalisasi antarmuka dan penyelesaian fitur ekspor data log ke dalam format CSV.
- **File Diubah:**
  - `js/dosen.js`:
    - Mengganti status tabel "Kelola Token" menjadi fungsional, menampilkan jumlah token `Aktif` dan `Selesai` secara dinamis dari tabel `db_tokens`.
    - Menambahkan tombol "Reset Token" bagi Dosen jika terjadi malfungsi teknis dan mahasiswa perlu mengulang ujian.
    - Menambahkan tombol **Export CSV** di tab *Monitoring Tracker*. Tombol ini akan merakit data *log* keamanan (berdasarkan filter ujian saat itu) dan membuat berkas CSV yang akan diunduh secara otomatis dengan nama file *laporan_pelanggaran_TIMESTAMP.csv*.
    - Menyempurnakan pemanggilan *Lucide Icons* di setiap proses *render* tab agar desain *Glassmorphism* tetap premium.
- **Status:** Phase 7 Selesai. Proyek INTI SELESAI.

### [18 Mei 2026] - Perbaikan Akses Protokol File Lokal (`file:///`) & Sinkronisasi Variabel
- **Tugas Dilakukan:** Mengatasi masalah tampilan hitam saat memuat aplikasi secara lokal via `file:///` dan menyelaraskan field kelayakan mahasiswa.
- **File Diubah:**
  - `js/utils.js`: Membuat wrapper `safeStorage` global yang otomatis beralih ke penyimpanan dalam memori (*in-memory fallback*) apabila browser memblokir `localStorage` (seperti saat dijalankan langsung dari folder lokal tanpa server).
  - `js/app.js`, `js/exam.js`, `js/student.js`: Mengganti semua pemanggilan raw `localStorage` dengan `safeStorage` untuk menjamin kompatibilitas total.
  - `js/student.js`: Memperbaiki bug status kelayakan mahasiswa dengan mendukung pengecekan field `student.isEligible` secara konsisten (sebelumnya `student.eligible` memicu pemblokiran permanen karena ketidakcocokan nama properti dari halaman admin).
- **Status:** Perbaikan berhasil. Aplikasi kini dapat berjalan 100% lancar baik menggunakan server lokal maupun langsung di-double click via `file:///` dari Google Drive!

### [18 Mei 2026] - Penyesuaian Identitas Dosen (NIDN / NUPTK)
- **Tugas Dilakukan:** Mengganti penyebutan identitas dosen dari "NIP" menjadi "NIDN / NUPTK" agar sesuai dengan kebutuhan sistem akademik.
- **File Diubah:**
  - `js/app.js`: Mengubah teks placeholder pada input username login dosen/admin.
  - `js/superadmin.js`: Mengubah teks placeholder pada form pendaftaran Dosen baru.

### [18 Mei 2026] - Branding examRAYA, Git Push, & README.md
- **Tugas Dilakukan:**
  - Mengubah branding nama aplikasi secara menyeluruh menjadi **examRAYA** (Portal Ujian Secure khusus untuk **STAI Raden Abdullah Yaqin**).
  - Melakukan inisialisasi repositori Git lokal, membuat `.gitignore` standar, dan melakukan commit awal.
  - Membuat repositori publik baru bernama **examraya** di akun GitHub `lightnet19` dan men-push seluruh kode sumber ke `main`.
  - Merancang berkas `.github/workflows/deploy.yml` untuk pendeployan otomatis menggunakan **GitHub Actions** ke **GitHub Pages**.
  - Menulis berkas **`README.md`** yang sangat komprehensif dan estetis untuk tampilan beranda repositori di GitHub.
- **File Diubah / Baru:**
  - `index.html`, `js/app.js`, `js/student.js`: Re-branding tulisan & log menjadi "examRAYA - STAI Raden Abdullah Yaqin".
  - `.gitignore`, `.github/workflows/deploy.yml`: Konfigurasi filter Git dan otomatisasi pendeployan Pages.
  - `README.md`: Dokumentasi visual dan teknis terlengkap untuk GitHub.

### [20 Mei 2026] - Redesain Premium UI Google Stitch & Verifikasi End-to-End
- **Tugas Dilakukan:**
  - Melakukan perombakan desain antarmuka (*UI Redesign*) secara total menjadi gaya **Cyber Dark Glassmorphic** berdasarkan standar **Google Stitch**.
  - Mengintegrasikan tipografi geometric modern `Plus Jakarta Sans` dari Google Fonts secara global.
  - Memperbarui sistem keamanan *Anti-Cheat* dengan diagonal KTM watermark overlays di atas iframe ujian serta overlay peringatan merah menyala (`PELANGGARAN TERDETEKSI`) apabila terjadi pelanggaran layar penuh/visibility loss.
  - Mendesain ulang seluruh komponen dasbor Super Admin (pengelolaan dosen/mahasiswa dan status kelayakan ujian) serta dasbor Dosen (monitoring log pelanggaran mahasiswa, ekspor laporan CSV, popup kode QR layar lebar terintegrasi download).
  - Melakukan verifikasi end-to-end multi-role secara headless (Student -> Fullscreen Violation Trigger -> Confirm Finish -> Dosen Logs Tracker & Stats -> Super Admin eligibility status update).
- **File Diubah:**
  - `css/style.css`: Mendesain ulang design system, CSS variables, glassmorphic panel, gradient buttons, custom tables, status badges, dan toast animations.
  - `index.html`: Menambahkan preconnections font dan memuat Lucide Icons.
  - `js/app.js`: Integrasi layout grid, perlindungan rute SPA, dan toast engine.
  - `js/student.js`: Kartu validasi mahasiswa dan validasi kelayakan NIM.
  - `js/superadmin.js`: Pengelolaan dosen/mahasiswa dengan badge status Layak/Diblokir yang kontras.
  - `js/dosen.js`: Integrasi visual tab Dosen, stats grid, QR Code modal popup, dan monitoring tracker.
  - `js/exam.js`: Polishing secure exam headers, diagonal watermark repetitions, visibility/fullscreen breach handling, dan log penulisan otomatis.
  - `devlog.md`: Memperbarui riwayat pengembangan ini.
- **Status:** Seluruh pengujian berhasil lolos dengan sempurna dan antarmuka kini tampil ultra-premium serta fungsional. Siap dipublikasikan ke GitHub!

---
*(Proses Pembangunan Inti, Redesain Premium Google Stitch & Verifikasi Selesai dengan Sempurna)*
