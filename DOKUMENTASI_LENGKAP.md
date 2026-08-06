# ⛪ Dokumentasi Sistem Manajemen Gereja GPdI Melati Depok
> **Melati Depok Church Management System**  
> Sebuah platform manajemen gereja modern terpadu yang memfasilitasi pelayanan jemaat, pendaftaran event, pengelolaan data keanggotaan, serta integrasi AI Chatbot untuk pelayanan gereja digital.

---

## 📋 Daftar Isi
1. [Ringkasan Sistem](#-ringkasan-sistem)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Fitur-Fitur Utama](#-fitur-fitur-utama)
   - [Aplikasi Publik (Jemaat & Pengunjung)](#1-aplikasi-publik-jemaat--pengunjung)
   - [Portal Admin (Pengelola Gereja)](#2-portal-admin-pengelola-gereja)
4. [Alur & Workflow Sistem](#-alur--workflow-sistem)
   - [Alur Pendaftaran Jemaat Baru](#1-alur-pendaftaran-jemaat-baru)
   - [Alur Pendaftaran Event & Kegiatan](#2-alur-pendaftaran-event--kegiatan)
   - [Alur Manajemen Ulang Tahun Jemaat](#3-alur-manajemen-ulang-tahun-jemaat)
   - [Alur Permohonan Doa](#4-alur-permohonan-doa)
   - [Alur AI Chatbot Assistant](#5-alur-ai-chatbot-assistant)
5. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
6. [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)

---

## 📌 Ringkasan Sistem

GPdI Melati Depok Church Management System dibangun untuk memodernisasi tata kelola administrasi gereja dan meningkatkan kualitas pelayanan jemaat. Sistem ini mengintegrasikan portal publik interaktif untuk jemaat dengan dashboard manajemen lengkap untuk pengurus dan admin gereja.

---

## 🛠️ Teknologi yang Digunakan

### **Frontend (Client-Side)**
- **Framework & Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite 6](https://vitejs.dev/)
- **Styling & Design**: [Tailwind CSS v4](https://tailwindcss.com/) dengan pendekatan kustomisasi tema visual modern (Deep Navy `#1A2B4C`, Warm Gold `#D4AF37`, Sand)
- **Icons & Visuals**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion (Framer Motion v12)](https://motion.dev/) untuk transisi halaman dan elemen UI interaktif
- **Charts & Data Visualization**: [Recharts](https://recharts.org/) untuk statistik visual dashboard
- **Export Utility**: [XLSX (SheetJS)](https://sheetjs.com/) untuk ekspor laporan Excel dan [jsPDF](https://github.com/parallax/jsPDF) untuk dokumen PDF

### **Backend (Server-Side)**
- **Runtime & Server**: [Node.js](https://nodejs.org/) dengan [Express.js](https://expressjs.com/) + TypeScript
- **Bundler**: [esbuild](https://esbuild.github.io/) untuk kompilasi server yang sangat cepat
- **Keamanan & Autentikasi**: [JSON Web Token (JWT)](https://jwt.io/), [bcrypt](https://github.com/kelektiv/node.bcrypt.js) untuk hashing kata sandi, CORS
- **File Processing**: [Multer](https://github.com/expressjs/multer) untuk penanganan upload gambar/dokumen

### **Database & Data Storage**
- **Database Utama**: [PostgreSQL](https://www.postgresql.org/) (driver `pg`)
- **Fallback In-Memory Store**: Mekanisme auto-fallback untuk keandalan tinggi dan pengujian lokal
- **Auto Data Ingestion**: Format JSON (`data_jemaat_parsed.json`) untuk seeding data awal secara otomatis

### **Kecerdasan Buatan (AI Integration)**
- **AI Chatbot Service**: [Google GenAI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) memanfaatkan model Gemini 2.5 Flash / 1.5 Pro untuk asisten virtual gereja 24/7.

---

## ✨ Fitur-Fitur Utama

### 1. Aplikasi Publik (Jemaat & Pengunjung)

- **🏠 Beranda (Home Page)**:
  - Dynamic Hero Slider (Banner utama gereja).
  - Ringkasan Jadwal Ibadah Terdekat.
  - Pengumuman & Warta Jemaat Terbaru.
  - Widget Persembahan & Donasi Digital (QRIS).
  - AI Assistant Chatbot interaktif di sudut kanan bawah.

- **ℹ️ Profil Gereja**:
  - Sejarah singkat, Visi & Misi GPdI Melati Depok.
  - Struktur kepemimpinan dan profil Gembala Sidang.
  - Peta lokasi dan informasi kontak gereja.

- **📅 Jadwal Ibadah & Event**:
  - Informasi lengkap Jadwal Ibadah Raya Mingguan dan Ibadah Kategorial.
  - Daftar Acara/Event spesial gereja dilengkapi detail lokasi, waktu, dan penanda pendaftaran.

- **📝 E-Form Pendaftaran Digital**:
  - **Pendaftaran Jemaat Baru**: Formulir online data jemaat beserta anggota keluarga.
  - **Pendaftaran Event**: Form pendaftaran mengikuti kegiatan/event spesial gereja.

- **🙏 Permohonan Doa & Konseling**:
  - Formulir penyerahan permohonan doa dan jadwal konseling gembala secara privat.

- **📰 Warta Jemaat**:
  - Publikasi warta mingguan, buletin gereja, dan informasi pelayanan.

---

### 2. Portal Admin (Pengelola Gereja)

Portal Admin diakses melalui `/admin/login` dengan fitur-fitur manajemen terpadu:

- **📊 Dashboard Statistik**:
  - Card Metrik Real-Time: *Total Jemaat Aktif*, *Ulang Tahun Bulan Ini*, *Total Pria*, *Total Wanita*, *Pending Verifikasi E-Form*, *Total Pendaftar*, dan *Permohonan Doa*.
  - **Tabel Jemaat Berulang Tahun (Minggu Ini)**: Menampilkan jemaat aktif yang berulang tahun pada minggu berjalan (Senin-Minggu) lengkap dengan Usia Tahun Ini, Wadah, dan Rayon.

- **👥 Manajemen Data Jemaat Aktif**:
  - Data tabel master jemaat aktif.
  - Penambahan & Edit Data Jemaat.
  - Penentuan Wadah Otomatis berdasarkan algoritma kelompok usia dan jenis kelamin.
  - Filter berdasarkan Wadah dan Rayon.
  - Export Data Jemaat ke format Excel (.xlsx).

- **🥀 Manajemen Jemaat Keluar / Meninggal Dunia**:
  - Pengarsipan khusus untuk data jemaat yang pindah/keluar atau meninggal dunia agar histori data tetap aman dan tercatat dengan rapi.

- **🏛️ Manajemen Wadah Pelayanan**:
  - Pengelolaan 5 Wadah Utama: *Sekolah Minggu*, *Kaum Remaja*, *Kaum Muda*, *Kaum Pria*, *Kaum Wanita*.
  - Pencatatan Ketua Wadah, batas umur minimal-maksimal, serta daftar anggota di setiap wadah.

- **📍 Manajemen Rayon**:
  - Pengelolaan pembagian wilayah (Rayon 1 - Rayon 4).
  - Pemetaan Ketua Rayon dan daftar anggota jemaat per rayon.

- **🎂 Manajemen Ulang Tahun Jemaat**:
  - Laporan komprehensif ulang tahun jemaat aktif.
  - Filter pencarian nama jemaat, tanggal mulai, dan tanggal akhir.
  - Fitur pengurutan tanggal ulang tahun terdekat dari hari ini.
  - Export laporan ulang tahun ke format XLS/CSV.

- **✅ Approval E-Form (Pendaftaran)**:
  - **Approvals Jemaat Baru**: Verifikasi permohonan jemaat baru. Jika disetujui, data otomatis masuk ke tabel Jemaat Aktif.
  - **Approvals Event**: Verifikasi peserta event dilengkapi dengan **Filter Jenis Kegiatan** yang dinamis dari event yang dibuat admin.
  - **Approvals Baptisan & Layanan**: Verifikasi pendaftaran baptisan dan pendaftaran pelayanan lainnya.

- **🙏 Manajemen Permohonan Doa**:
  - Meninjau pesan permohonan doa dari jemaat untuk ditindaklanjuti oleh tim pendoa/gembala.

- **🎨 Content Management System (CMS)**:
  - Manajemen Hero Banner Slider.
  - Manajemen Pengumuman Gereja.
  - Manajemen Jadwal Ibadah & Event Spesial.
  - Manajemen Warta Jemaat.

- **🤖 Knowledge Base & AI Config**:
  - Pengaturan basis pengetahuan gereja yang digunakan oleh AI Chatbot untuk menjawab pertanyaan pengunjung secara cerdas.

---

## 🔄 Alur & Workflow Sistem

### 1. Alur Pendaftaran Jemaat Baru
```mermaid
flowchart TD
    A[Jemaat mengisi E-Form Pendaftaran di Website] --> B[Sistem menyimpan status sebagai 'Pending']
    B --> C[Admin menerima notifikasi di halaman Approvals Jemaat]
    C --> D{Keputusan Admin}
    D -- Disetujui --> E[Sistem membuat record Jemaat Aktif]
    E --> F[Wadah & Rayon dipetakan secara otomatis]
    D -- Ditolak --> G[Status pendaftaran diubah menjadi 'Ditolak']
```

### 2. Alur Pendaftaran Event & Kegiatan
```mermaid
flowchart TD
    A[Admin menambahkan Event baru di CMS / Schedules] --> B[Event muncul di Website & Form Pendaftaran]
    B --> C[Jemaat mendaftar Event via E-Form]
    C --> D[Admin membuka halaman Approval Event]
    D --> E[Admin menggunakan Filter Jenis Kegiatan untuk memilah peserta]
    E --> F[Admin menyetujui / menolak pendaftaran]
```

### 3. Alur Manajemen Ulang Tahun Jemaat
```mermaid
flowchart TD
    A[Sistem memindai data tanggal lahir seluruh Jemaat Aktif] --> B[Sistem menghitung usia tahun ini & tanggal ultah tahun ini]
    B --> C{Apakah Ultah jatuh pada Minggu ini?}
    C -- Ya --> D[Tampil di Dashboard 'Jemaat Berulang Tahun Minggu Ini']
    C -- Tidak --> E[Tampil di Laporan Ulang Tahun Bulanan]
    D --> F[Admin dapat mengekspor daftar ke Excel / CSV]
```

### 4. Alur Permohonan Doa
```mermaid
flowchart TD
    A[Pengunjung mengirim Permohonan Doa di Website] --> B[Data masuk ke Database Admin]
    B --> C[Tim Pendoa / Admin melihat daftar permohonan di Admin Panel]
    C --> D[Tindak lanjut pelayanan doa & konseling]
```

### 5. Alur AI Chatbot Assistant
```mermaid
flowchart TD
    A[User mengajukan pertanyaan di Widget Chatbox] --> B[Backend Express menerima pesan]
    B --> C[Sistem mengambil konteks dari Knowledge Base & Jadwal Real-time]
    C --> D[Pesan dikirim ke Google Gemini AI API]
    D --> E[Gemini merespons dengan jawaban kontekstual mengenai GPdI Melati Depok]
    E --> F[Jawaban ditampilkan secara real-time ke User]
```

---

## 📁 Struktur Direktori Proyek

```
gpdi-melati-depok-church-management-system/
├── index.html                   # HTML Entry point Vite
├── package.json                 # Dependencies & Script npm
├── server.ts                    # Entry point Express Server
├── tsconfig.json                # Konfigurasi TypeScript
├── vite.config.ts               # Konfigurasi Vite & Tailwind CSS
├── data_jemaat_parsed.json      # File Seeding Data Jemaat
├── public/                      # Asset statis publik (Logo, gambar)
├── uploads/                     # Direktori upload file user/admin
└── src/                         # Kode Sumber Utama
    ├── components/              # Komponen Reusable React
    │   ├── home/                # Komponen halaman Beranda (Hero, Schedule, Donasi, dll)
    │   ├── layout/              # Navbar, Footer, Sidebar Admin
    │   └── ui/                  # Component UI penunjang (Modal, AI Chatbot)
    ├── pages/                   # Halaman Utama Website Publik
    │   ├── Beranda.tsx          # Home page
    │   ├── Profil.tsx           # Halaman profil gereja
    │   ├── JadwalEvent.tsx      # Halaman jadwal ibadah & event
    │   ├── Pendaftaran.tsx      # Halaman e-form pendaftaran
    │   ├── PermohonanDoa.tsx    # Halaman permohonan doa
    │   └── WartaJemaat.tsx      # Halaman warta jemaat
    ├── pages/admin/             # Portal Admin
    │   ├── Login.tsx            # Login Admin
    │   ├── Dashboard.tsx        # Dashboard Statistik & Ultah Minggu Ini
    │   ├── Jemaat.tsx           # Master Data Jemaat Aktif
    │   ├── JemaatKeluarMeninggal.tsx # Data Jemaat Non-Aktif
    │   ├── Wadah.tsx            # Management Wadah Pelayanan
    │   ├── Rayon.tsx            # Management Rayon Wilayah
    │   ├── UlangTahun.tsx       # Laporan Ulang Tahun Jemaat
    │   ├── Approvals.tsx        # Approval Jemaat Baru
    │   ├── ApprovalsEvent.tsx   # Approval Event (+ Filter Jenis Kegiatan)
    │   ├── ApprovalsBaptisan.tsx# Approval Baptisan / Layanan
    │   ├── Prayers.tsx          # Management Permohonan Doa
    │   ├── Cms.tsx              # Management Konten Web (CMS)
    │   └── KnowledgeBase.tsx    # Pengaturan AI Chatbot Knowledge Base
    ├── server/                  # Backend Express Server Logic
    │   ├── db/                  # In-Memory & Database Initializer
    │   └── routes/              # API Endpoint Routes (PostgreSQL & JSON)
    └── types/                   # TypeScript Type Definitions
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### **Prasyarat (Prerequisites)**
- Node.js versi 18+ atau versi LTS terbaru
- PostgreSQL (Opsional, sistem memiliki auto-fallback ke in-memory store jika PostgreSQL tidak terkonfigurasi)

### **Langkah Instalasi**

1. **Clone Repository & Install Dependencies**:
   ```bash
   git clone https://github.com/Sweapx/gpdi-melati-depok-church-management-system.git
   cd gpdi-melati-depok-church-management-system
   npm install
   ```

2. **Konfigurasi Environment (`.env`)**:
   Buat file `.env` di root direktori (atau salin dari `.env.example`):
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   DATABASE_URL=postgres://postgres:password@localhost:5432/gpdi_db
   ```

3. **Menjalankan dalam Mode Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

4. **Build untuk Produksi**:
   ```bash
   npm run build
   npm start
   ```

---

*Dokumentasi ini disusun secara otomatis untuk mempermudah pemeliharaan dan pengembangan sistem manajemen gereja GPdI Melati Depok.*
