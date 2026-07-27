# Dokumentasi Aplikasi GPdI Melati Depok Church Management System

## 📋 Overview

Aplikasi GPdI Melati Depok Church Management System adalah sistem manajemen gereja digital yang terintegrasi untuk memudahkan pengelolaan data jemaat, jadwal ibadah, warta jemaat, dan komunikasi dengan jemaat melalui chatbot AI.

**URL Aplikasi:** https://gpdimelati.me

**Teknologi:**
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Deployment: Digital Ocean VPS (PM2 + Nginx)
- AI: Google Gemini API (Chatbot)

---

## 👥 Pengguna Aplikasi

Aplikasi ini memiliki dua jenis pengguna:

### 1. Jemaat (Public User)
- Tidak perlu login untuk mengakses fitur publik
- Dapat melihat informasi gereja secara umum
- Dapat mendaftar sebagai jemaat baru
- Dapat menggunakan chatbot AI untuk informasi

### 2. Admin (Gereja)
- Perlu login untuk mengakses fitur admin
- Memiliki akses penuh untuk mengelola data
- Dapat mengelola konten dan data jemaat

---

## 🌐 Fitur Publik (Jemaat)

### 1. Halaman Utama (Homepage)

**Fitur:**
- Hero Slide/Banner dengan gambar dan tombol CTA (Call to Action)
- Informasi jadwal ibadah
- Informasi pengumuman gereja
- Navigasi ke berbagai halaman

**Fungsi:**
- Memberikan informasi visual yang menarik tentang gereja
- Tombol CTA dapat diarahkan ke halaman pendaftaran, warta jemaat, atau scroll ke section tertentu

**Alur Penggunaan:**
1. Jemaat membuka website https://gpdimelati.me
2. Melihat banner slide yang berputar otomatis
3. Klik tombol CTA untuk navigasi ke halaman yang diinginkan

---

### 2. Warta Jemaat

**Fitur:**
- Daftar warta jemaat dengan judul, tanggal, dan deskripsi
- Download PDF warta jemaat
- Pencarian warta jemaat

**Fungsi:**
- Menyediakan informasi kegiatan gereja, renungan, dan pengumuman penting
- Jemaat dapat mengunduh warta untuk dibaca offline

**Alur Penggunaan:**
1. Klik menu "Warta Jemaat" di navbar
2. Melihat daftar warta jemaat yang tersedia
3. Klik tombol "Download" untuk mengunduh PDF
4. Baca warta jemaat offline

---

### 3. Pendaftaran Jemaat Baru

**Fitur:**
- Formulir pendaftaran dengan field:
  - Nama lengkap
  - Email
  - Nomor telepon
  - Alamat
  - Tanggal lahir
  - Jenis kelamin
  - Status pernikahan
  - Upload foto (opsional)
- Validasi data input
- Konfirmasi pendaftaran

**Fungsi:**
- Memudahkan jemaat baru untuk mendaftar secara online
- Mengumpulkan data jemaat untuk database gereja

**Alur Penggunaan:**
1. Klik tombol "Daftar Jemaat" di halaman utama atau banner
2. Isi formulir pendaftaran dengan data lengkap
3. Upload foto (opsional)
4. Klik tombol "Daftar"
5. Tunggu konfirmasi dari gereja

---

### 4. Pendaftaran Baptisan

**Fitur:**
- Formulir pendaftaran baptisan dengan field:
  - Nama lengkap
  - Email
  - Nomor telepon
  - Alamat
  - Tanggal lahir
  - Alasan ingin dibaptis
  - Upload foto (opsional)
- Validasi data input
- Konfirmasi pendaftaran

**Fungsi:**
- Memudahkan jemaat untuk mendaftar baptisan air
- Mengumpulkan data calon baptis untuk gereja

**Alur Penggunaan:**
1. Klik tombol "Daftar Baptisan" di halaman utama atau banner
2. Isi formulir pendaftaran dengan data lengkap
3. Upload foto (opsional)
4. Klik tombol "Daftar"
5. Tunggu konfirmasi dan jadwal baptisan dari gereja

---

### 5. Chatbot AI

**Fitur:**
- Chatbot interaktif di pojok kanan bawah
- Pertanyaan umum tentang gereja
- Jawaban otomatis berdasarkan knowledge base
- Integrasi dengan Google Gemini API

**Fungsi:**
- Memberikan respon cepat untuk pertanyaan umum
- Membantu jemaat mendapatkan informasi tanpa perlu menghubungi admin
- Beroperasi 24/7

**Alur Penggunaan:**
1. Klik icon chat di pojok kanan bawah
2. Ketik pertanyaan (contoh: "jadwal ibadah", "cara daftar jemaat")
3. Chatbot memberikan jawaban otomatis
4. Jika pertanyaan tidak ada di knowledge base, chatbot akan memberikan respon default

---

### 6. Informasi Kontak & Lokasi

**Fitur:**
- Alamat lengkap gereja
- Nomor telepon
- Email
- Jam operasional sekretariat

**Fungsi:**
- Memberikan informasi kontak untuk komunikasi langsung
- Memudahkan jemaat mengunjungi gereja

---

## 🔐 Fitur Admin

### Login Admin

**Fitur:**
- Form login dengan username dan password
- Autentikasi dengan JWT token
- Proteksi halaman admin

**Fungsi:**
- Mengamankan akses ke fitur admin
- Hanya admin yang terdaftar dapat login

**Alur Penggunaan:**
1. Buka https://gpdimelati.me/admin
2. Masukkan username dan password
3. Klik tombol "Login"
4. Jika berhasil, akan diarahkan ke dashboard admin

---

### Dashboard Admin

**Fitur:**
- Statistik ringkas:
  - Total jemaat
  - Total pendaftaran jemaat baru
  - Total pendaftaran baptisan
  - Total warta jemaat
- Akses cepat ke menu utama

**Fungsi:**
- Memberikan overview data gereja
- Memudahkan admin melihat statistik penting

---

### Manajemen Jemaat

**Fitur:**
- Daftar semua jemaat terdaftar
- Detail jemaat (nama, email, telepon, alamat, dll)
- Status jemaat (aktif/nonaktif)
- Edit data jemaat
- Hapus jemaat
- Pencarian jemaat

**Fungsi:**
- Mengelola data jemaat secara lengkap
- Memudahkan admin untuk mengupdate data jemaat

**Alur Penggunaan:**
1. Login ke admin panel
2. Klik menu "Jemaat"
3. Melihat daftar jemaat
4. Klik tombol "Edit" untuk mengubah data
5. Klik tombol "Hapus" untuk menghapus jemaat (dengan konfirmasi)

---

### Manajemen Pendaftaran Jemaat Baru

**Fitur:**
- Daftar pendaftaran jemaat baru
- Status pendaftaran (pending/approved/rejected)
- Approve/Reject pendaftaran
- Detail pendaftar
- Kirim notifikasi ke pendaftar

**Fungsi:**
- Mengelola pendaftaran jemaat baru
- Memudahkan admin untuk menyetujui atau menolak pendaftaran

**Alur Penggunaan:**
1. Login ke admin panel
2. Klik menu "Pendaftaran Jemaat"
3. Melihat daftar pendaftaran
4. Review data pendaftar
5. Klik tombol "Approve" untuk menyetujui
6. Klik tombol "Reject" untuk menolak

---

### Manajemen Pendaftaran Baptisan

**Fitur:**
- Daftar pendaftaran baptisan
- Status pendaftaran (pending/approved/rejected)
- Approve/Reject pendaftaran
- Detail calon baptis
- Kirim notifikasi ke calon baptis

**Fungsi:**
- Mengelola pendaftaran baptisan
- Memudahkan admin untuk menyetujui atau menolak pendaftaran

**Alur Penggunaan:**
1. Login ke admin panel
2. Klik menu "Pendaftaran Baptisan"
3. Melihat daftar pendaftaran
4. Review data calon baptis
5. Klik tombol "Approve" untuk menyetujui
6. Klik tombol "Reject" untuk menolak

---

### Manajemen Warta Jemaat

**Fitur:**
- Daftar warta jemaat
- Upload PDF warta jemaat
- Edit judul, tanggal, deskripsi
- Hapus warta jemaat
- Status aktif/nonaktif

**Fungsi:**
- Mengelola konten warta jemaat
- Memudahkan admin untuk upload warta baru

**Alur Penggunaan:**
1. Login ke admin panel
2. Klik menu "Warta Jemaat"
3. Klik tombol "Tambah Warta"
4. Isi judul, tanggal, deskripsi
5. Upload file PDF
6. Klik tombol "Simpan"

---

### Manajemen Hero Slide (Banner)

**Fitur:**
- Daftar hero slide/banner
- Tambah hero slide baru dengan:
  - Gambar banner
  - Judul
  - Subtitle
  - Badge/label
  - Teks tombol CTA
  - Tipe CTA (scroll ke section, navigasi ke halaman)
  - Status aktif/nonaktif
- Edit hero slide
- Hapus hero slide
- Urutan slide (order index)

**Fungsi:**
- Mengelola tampilan banner di halaman utama
- Memudahkan admin untuk mengupdate konten banner

**Alur Penggunaan:**
1. Login ke admin panel
2. Klik menu "CMS" → tab "Hero Slides"
3. Klik tombol "Tambah Slide"
4. Upload gambar banner
5. Isi judul, subtitle, badge
6. Pilih tipe CTA (jadwal, pengumuman, warta, dll)
7. Isi teks tombol CTA
8. Set status aktif/nonaktif
9. Klik tombol "Simpan"

---

### Manajemen Knowledge Base (Chatbot)

**Fitur:**
- Daftar knowledge base untuk chatbot
- Tambah Q&A baru dengan:
  - Kategori/Topik
  - Pertanyaan (patterns) - variasi pertanyaan dipisahkan koma
  - Jawaban bot
- Edit Q&A
- Hapus Q&A
- Status aktif/nonaktif

**Fungsi:**
- Mengelola knowledge base untuk chatbot AI
- Memudahkan admin untuk menambah pertanyaan dan jawaban baru

**Alur Penggunaan:**
1. Login ke admin panel
2. Klik menu "Knowledge Base"
3. Klik tombol "Tambah Q&A"
4. Isi kategori (contoh: Jadwal, Pendaftaran)
5. Isi pertanyaan (contoh: halo, hai, selamat pagi)
6. Isi jawaban bot
7. Klik tombol "Simpan"

---

### Manajemen Jadwal Ibadah

**Fitur:**
- Daftar jadwal ibadah
- Tambah jadwal baru dengan:
  - Jenis ibadah
  - Hari
  - Jam
  - Deskripsi
- Edit jadwal
- Hapus jadwal

**Fungsi:**
- Mengelola jadwal ibadah gereja
- Memudahkan admin untuk mengupdate jadwal

**Alur Penggunaan:**
1. Login ke admin panel
2. Klik menu "Jadwal"
3. Klik tombol "Tambah Jadwal"
4. Pilih jenis ibadah
5. Pilih hari dan jam
6. Isi deskripsi
7. Klik tombol "Simpan"

---

### Manajemen Pengumuman

**Fitur:**
- Daftar pengumuman gereja
- Tambah pengumuman baru dengan:
  - Judul
  - Isi pengumuman
  - Tanggal
  - Status aktif/nonaktif
- Edit pengumuman
- Hapus pengumuman

**Fungsi:**
- Mengelola pengumuman gereja
- Memudahkan admin untuk mengupdate pengumuman

**Alur Penggunaan:**
1. Login ke admin panel
2. Klik menu "Pengumuman"
3. Klik tombol "Tambah Pengumuman"
4. Isi judul dan isi pengumuman
5. Pilih tanggal
6. Set status aktif/nonaktif
7. Klik tombol "Simpan"

---

## 🔄 Alur Lengkap Penggunaan

### Alur Jemaat Baru

1. **Akses Website**
   - Buka https://gpdimelati.me
   - Melihat informasi gereja di halaman utama

2. **Mencari Informasi**
   - Baca jadwal ibadah di halaman utama
   - Baca warta jemaat untuk informasi lebih lanjut
   - Gunakan chatbot untuk pertanyaan cepat

3. **Mendaftar Jemaat**
   - Klik tombol "Daftar Jemaat"
   - Isi formulir pendaftaran
   - Tunggu konfirmasi dari gereja

4. **Mendaftar Baptisan** (jika ingin)
   - Klik tombol "Daftar Baptisan"
   - Isi formulir pendaftaran baptisan
   - Tunggu konfirmasi dan jadwal dari gereja

5. **Menghubungi Gereja**
   - Gunakan informasi kontak di footer
   - Hubungi sekretariat untuk pertanyaan lebih lanjut

---

### Alur Admin

1. **Login**
   - Buka https://gpdimelati.me/admin
   - Masukkan username dan password
   - Masuk ke dashboard

2. **Review Pendaftaran**
   - Cek menu "Pendaftaran Jemaat"
   - Review data pendaftar jemaat baru
   - Approve/Reject pendaftaran
   - Cek menu "Pendaftaran Baptisan"
   - Review data calon baptis
   - Approve/Reject pendaftaran

3. **Kelola Konten**
   - Update hero slide/banner di menu CMS
   - Upload warta jemaat baru
   - Update jadwal ibadah
   - Tambah pengumuman baru

4. **Kelola Knowledge Base**
   - Tambah Q&A untuk chatbot
   - Update jawaban untuk pertanyaan yang sudah ada
   - Hapus Q&A yang tidak relevan

5. **Kelola Data Jemaat**
   - Lihat daftar jemaat terdaftar
   - Update data jemaat jika ada perubahan
   - Hapus jemaat yang tidak aktif

6. **Logout**
   - Klik tombol logout di pojok kanan atas
   - Keluar dari admin panel

---

## 🛠️ Teknis & Deployment

### Struktur Database

**Tabel Utama:**
- `admin_users` - Data admin
- `jemaat` - Data jemaat terdaftar
- `pendaftaran_jemaat` - Data pendaftaran jemaat baru
- `pendaftaran_baptisan` - Data pendaftaran baptisan
- `warta_jemaat` - Data warta jemaat
- `hero_slides` - Data banner/hero slide
- `knowledge_base` - Data Q&A chatbot
- `jadwal_ibadah` - Data jadwal ibadah
- `pengumuman` - Data pengumuman

### API Endpoints

**Public:**
- `GET /api/hero-slides` - Get hero slides
- `GET /api/warta-jemaat` - Get warta jemaat
- `POST /api/pendaftaran-jemaat` - Daftar jemaat baru
- `POST /api/pendaftaran-baptisan` - Daftar baptisan
- `POST /api/chat` - Chatbot AI

**Admin (Protected):**
- `POST /api/admin/login` - Login admin
- `GET /api/jemaat` - Get jemaat
- `POST /api/jemaat` - Add jemaat
- `PUT /api/jemaat/:id` - Update jemaat
- `DELETE /api/jemaat/:id` - Delete jemaat
- `GET /api/pendaftaran-jemaat` - Get pendaftaran jemaat
- `PUT /api/pendaftaran-jemaat/:id` - Update status pendaftaran
- `GET /api/pendaftaran-baptisan` - Get pendaftaran baptisan
- `PUT /api/pendaftaran-baptisan/:id` - Update status pendaftaran
- `GET /api/warta-jemaat` - Get warta jemaat
- `POST /api/warta-jemaat` - Add warta jemaat
- `PUT /api/warta-jemaat/:id` - Update warta jemaat
- `DELETE /api/warta-jemaat/:id` - Delete warta jemaat
- `GET /api/hero-slides` - Get hero slides
- `POST /api/hero-slides` - Add hero slide
- `PUT /api/hero-slides/:id` - Update hero slide
- `DELETE /api/hero-slides/:id` - Delete hero slide
- `GET /api/knowledge-base` - Get knowledge base
- `POST /api/knowledge-base` - Add Q&A
- `PUT /api/knowledge-base/:id` - Update Q&A
- `DELETE /api/knowledge-base/:id` - Delete Q&A

### Environment Variables

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
NODE_ENV=production
```

---

## 📝 Console Scripts

### Script Seeding Knowledge Base

Untuk menambahkan data knowledge base secara cepat, gunakan script console:

1. Buka https://gpdimelati.me/admin/kb
2. Buka browser console (F12 → Console)
3. Paste script seeding knowledge base
4. Script akan menambahkan 8 item Q&A default

---

## 🔒 Keamanan

- Autentikasi admin dengan JWT token
- Proteksi halaman admin dengan middleware
- Validasi input data
- Hashing password dengan bcrypt
- HTTPS dengan SSL certificate (Let's Encrypt)
- Firewall di VPS

---

## 📞 Kontak & Support

Untuk pertanyaan atau masalah teknis:
- **Email:** info@gpdimelatidepok.org
- **Telepon:** 0812-9900-1122
- **Alamat:** Jl. Melati Raya No. 1, Pancoran Mas, Depok

---

## 📅 Changelog

### Versi 1.0 (Juli 2026)
- Initial release
- Fitur pendaftaran jemaat
- Fitur pendaftaran baptisan
- Warta jemaat
- Chatbot AI dengan knowledge base
- Hero slide/banner management
- Admin panel lengkap
- Responsive design

---

*Dokumentasi ini akan terus diperbarui sesuai dengan perkembangan aplikasi.*
