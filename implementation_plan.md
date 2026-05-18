# Portal Ujian — Web App QR Code & Token Verification

Web application untuk mengelola ujian (UTS/UAS) dengan sistem QR Code, verifikasi token, dan pelacakan akses mahasiswa.

## Latar Belakang

Dosen/admin memerlukan cara untuk mendistribusikan link Google Form ujian ke mahasiswa yang **sudah memenuhi persyaratan**. Sistem ini akan:
- Menghasilkan QR Code yang mengarah ke halaman verifikasi (bukan langsung ke Google Form)
- Membuat token unik untuk setiap mahasiswa yang berhak
- Melacak siapa yang mengakses ujian secara resmi vs ilegal

## Arsitektur Sistem

```mermaid
flowchart TD
    SA[Super Admin Dashboard] -->|CRUD User| U[Manajemen Dosen & Mahasiswa]
    SA -->|Set Kelayakan| E[Verifikasi Syarat Ujian Mahasiswa]
    
    D[Dosen Dashboard] -->|Buat Ujian| B[Input Link Google Form]
    D -->|Generate Token| C[Token untuk Mahasiswa Layak]
    D -->|Lihat Tracker| L[Access Log Ujian]
    
    B --> Q[QR Code & Kode Ruangan Generated]
    Q -->|Scan QR (HP)| F[Halaman Verifikasi Token]
    Q -->|Input Kode (Laptop)| F
    F -->|Token Valid| G[Masuk Secure Exam Mode]
    G -->|Embed iframe| G1[Ujian Berlangsung]
    G1 -->|Pindah Tab/Keluar| G2[Akses Diblokir + Log Cheat]
    F -->|Token Invalid| H[Akses Ditolak + Logged]
    
    I[Akses Langsung via URL Form] -->|Di luar sistem| J[Tidak Terpantau Tracker]
```

## Fitur Utama

### 1. 🔑 Super Admin Dashboard
- Manajemen User: CRUD akun Dosen dan Mahasiswa (satu per satu & massal via CSV).
- Verifikasi Kelayakan: Menandai dan mengizinkan mahasiswa yang telah memenuhi persyaratan ujian (Eligible/Not Eligible).
- Monitor keseluruhan sistem.

### 2. 👨‍🏫 Dosen Dashboard
- CRUD ujian (nama ujian, mata kuliah, link Google Form, waktu mulai/selesai).
- Generate batch token (Hanya untuk mahasiswa yang berstatus "Layak" dari Super Admin).
- Override status kelayakan (Mengizinkan/memblokir mahasiswa tertentu untuk ujian spesifik).
- Export token ke CSV/Excel.
- Lihat statistik akses dan pelacakan ujian spesifik yang dikelolanya.

### 2. 📱 Akses Ruang Ujian (QR & Kode)
- QR Code mengarah ke halaman verifikasi.
- **Kode Ruangan (6 karakter)** untuk pengguna laptop (masuk lewat halaman portal depan).
- Download QR Code sebagai gambar PNG beserta keterangan Kode Ruangan.
- QR Code dan Kode mengandung parameter ujian terenkripsi.

### 3. 🎫 Token System
- Generate token unik (format: `XXXX-XXXX-XXXX`)
- Setiap token terikat ke: nama mahasiswa, NIM, mata kuliah, ujian
- Token single-use (sekali pakai)
- Token memiliki masa berlaku (sesuai jadwal ujian)
- Bulk generate untuk banyak mahasiswa sekaligus

### 4. 📊 Access Tracker
- Log setiap percobaan akses dengan detail:
  - **Waktu akses**
  - **Metode akses**: Token Resmi ✅ | QR Scan tanpa Token ⚠️ | Link Langsung 🚫
  - **IP Address** (jika tersedia)
  - **User Agent / Browser**
  - **Status**: Berhasil / Ditolak
- Filter dan pencarian log
- Export laporan akses

## Alur Kerja

### Alur Super Admin
1. Super Admin login ke dashboard.
2. Daftarkan akun Dosen dan input/import daftar Mahasiswa.
3. Super Admin menentukan dan memperbarui status "Kelayakan Ujian" bagi mahasiswa (misal: syarat SPP lunas).

### Alur Dosen
1. Dosen login ke dashboard menggunakan akun dari Super Admin.
2. Buat ujian baru → input nama ujian, mata kuliah, link Google Form, jadwal.
3. Pilih mahasiswa peserta ujian (hanya yang berstatus Layak yang akan di-generate tokennya secara otomatis, tapi dosen bisa override).
4. Generate token batch dan download/cetak untuk dibagikan.
5. Download/Tampilkan QR Code beserta Kode Ruangan di kelas.
6. Monitor akses real-time melalui tracker khusus untuk kelasnya.

### Alur Mahasiswa (Secure Mode)
1. Membuka akses ujian (Scan QR Code via HP, ATAU masukkan Kode Ruangan via Laptop)
2. Masuk ke halaman verifikasi
3. Input token yang diberikan dosen
4. Token divalidasi → Mahasiswa diminta masuk Fullscreen
5. Token ditandai "sudah digunakan"
6. Google Form dimuat di dalam aplikasi (iframe)
7. Mahasiswa mengerjakan soal. Jika pindah tab, terdeteksi pelanggaran.

### Alur Deteksi Kecurangan (Anti-Cheat)
- Jika mahasiswa scan QR tapi tidak punya token → tercatat sebagai **akses tanpa otorisasi**
- Jika mahasiswa menggunakan token orang lain yang sudah terpakai → tercatat sebagai **token reuse attempt**
- Jika saat ujian (dalam iframe) mahasiswa menekan tombol Windows, alt-tab, atau membuka aplikasi lain → tercatat sebagai **Cheat Attempt (Focus Lost)**
- Akses klik kanan dan shortcut keyboard (Ctrl+C, Ctrl+V, Print) dinonaktifkan di layar pembungkus.

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Vanilla HTML5 + CSS3 + JavaScript |
| QR Code | [qrcode.js](https://github.com/davidshimjs/qrcodejs) via CDN |
| Data Store | `localStorage` (client-side) |
| Token Security | Hashing dengan CryptoJS (SHA-256) |
| Export | FileSaver.js + xlsx.js untuk export Excel |
| Icons | Lucide Icons via CDN |
| Fonts | Google Fonts (Inter) |

> [!IMPORTANT]
> Karena ini menggunakan `localStorage`, data hanya tersimpan di browser yang sama. Untuk production, disarankan menggunakan backend (Supabase, Firebase, dll). Namun untuk prototype dan penggunaan personal dosen, `localStorage` sudah memadai.

## Proposed Changes

### File Structure

```
I:\My Drive\Web App Portal Ujian\
├── index.html          ← Entry point & routing
├── css/
│   └── style.css       ← Design system & all styles
├── js/
│   ├── app.js          ← Main app logic, routing, state management
│   ├── superadmin.js   ← Super Admin dashboard (User & Eligibility Management)
│   ├── dosen.js        ← Dosen dashboard (Exam & Tracking Management)
│   ├── token.js        ← Token generation & validation
│   ├── tracker.js      ← Access tracking & logging
│   └── utils.js        ← Utility functions (export, hash, etc.)
└── assets/
    └── (generated QR images will be here)
```

---

### [NEW] [index.html](file:///I:/My%20Drive/Web%20App%20Portal%20Ujian/index.html)
- Single Page Application entry point
- Semua view/halaman dirender secara dinamis
- CDN imports: QRCode.js, CryptoJS, Lucide Icons, Inter font
- Sections: Login, Dashboard Admin, Halaman Verifikasi, Tracker

### [NEW] [style.css](file:///I:/My%20Drive/Web%20App%20Portal%20Ujian/css/style.css)
- Dark theme premium dengan glassmorphism
- Color palette: Deep navy (#0a0e27), accent cyan (#00d4ff), accent purple (#7c3aed)
- Responsive design (mobile-first)
- Animasi micro-interactions
- Design components: cards, tables, modals, forms, badges, alerts

### [NEW] [app.js](file:///I:/My%20Drive/Web%20App%20Portal%20Ujian/js/app.js)
- Router SPA (hash-based routing)
- State management dengan localStorage
- View rendering engine
- Auth management (admin login/logout)
- Page components: Login, Dashboard, Exam Manager, Token Manager, Verify, Tracker

### [NEW] [superadmin.js](file:///I:/My%20Drive/Web%20App%20Portal%20Ujian/js/superadmin.js)
- CRUD user Dosen dan Mahasiswa
- Logika import massal data Mahasiswa (CSV)
- Pengaturan status kelayakan ujian secara global

### [NEW] [dosen.js](file:///I:/My%20Drive/Web%20App%20Portal%20Ujian/js/dosen.js)
- CRUD operasi ujian
- Logika pemilihan mahasiswa untuk ujian spesifik
- QR Code generation dan download
- Dashboard statistics untuk Dosen

### [NEW] [token.js](file:///I:/My%20Drive/Web%20App%20Portal%20Ujian/js/token.js)
- Token generation algorithm (format `XXXX-XXXX-XXXX`)
- Bulk token creation
- Token validation logic
- Token status management (active, used, expired)
- CSV/Excel export

### [NEW] [tracker.js](file:///I:/My%20Drive/Web%20App%20Portal%20Ujian/js/tracker.js)
- Access logging system
- Akses method detection (Token/QR/Direct)
- Log filtering & searching
- Statistics calculation
- Export laporan

### [NEW] [utils.js](file:///I:/My%20Drive/Web%20App%20Portal%20Ujian/js/utils.js)
- SHA-256 hashing functions
- Date/time formatting (locale Indonesia)
- CSV/Excel export helpers
- Clipboard utilities
- Notification system

## Design Preview

### Color System
- **Background**: `#0a0e27` (deep navy) → `#1a1f3a` (cards)
- **Primary Accent**: `#00d4ff` (cyan glow)
- **Secondary Accent**: `#7c3aed` (purple)
- **Success**: `#10b981` (green)
- **Warning**: `#f59e0b` (amber)
- **Danger**: `#ef4444` (red)
- **Text**: `#e2e8f0` (light gray)

### UI Components
- Glassmorphism cards dengan backdrop blur
- Gradient buttons dengan hover glow effect
- Animated stats cards dengan counter
- Data tables dengan zebra striping & sort
- Toast notifications
- Modal dialogs
- Badge system untuk status token

## Verification Plan

### Automated Tests
- Buka web app di browser menggunakan browser tool
- Test alur Super Admin: login → buat dosen → buat mahasiswa → set kelayakan
- Test alur Dosen: login → buat ujian → generate token → lihat QR
- Test alur mahasiswa: scan QR → input token → verifikasi → redirect
- Test tracker: pastikan log tercatat dengan benar
- Test edge cases: token expired, token sudah dipakai, akses tanpa token

### Manual Verification
- Screenshot semua halaman untuk review visual
- Test responsiveness pada viewport mobile
- Verifikasi QR Code bisa di-scan dengan aplikasi QR reader
- Pastikan export CSV/Excel berfungsi

## Open Questions

> [!IMPORTANT]
> **Password Admin**: Apakah Anda ingin mengatur password admin sendiri, atau gunakan default (misal: `admin123`) yang bisa diubah nanti?

> [!NOTE]
> **Data Persistence**: Saat ini menggunakan `localStorage` (data tersimpan di browser). Apakah ke depannya ingin integrasi dengan database online (Supabase/Firebase) agar data bisa diakses dari perangkat berbeda?

> [!NOTE]
> **Format Token**: Saya merencanakan format `XXXX-XXXX-XXXX` (12 karakter alfanumerik). Apakah ada preferensi format lain?

> [!NOTE]
> **Bahasa Interface**: Saya akan menggunakan **Bahasa Indonesia** untuk seluruh interface. Apakah ada istilah khusus yang ingin digunakan (misal: "Ujian Tengah Semester" atau "UTS")?
