# 🚀 Panduan Menjalankan Aplikasi Secara Lokal (Di PC / Laptop Lain)

Aplikasi **GPdI Melati Depok Church Management System** ini didesain **100% Portable**. Anda dapat memindahkan folder proyek ini ke komputer/laptop mana saja dan menjalankannya secara lokal tanpa kendala.

> 💡 **Keunggulan Sistem (Auto-Fallback)**:  
> Aplikasi ini dilengkapi dengan sistem penyimpan data mandiri (*In-Memory Store*) dan *Auto-Seeding* dari file `data_jemaat_parsed.json`. **Artinya, Anda TIDAK WAJIB menginstall PostgreSQL** di PC baru agar aplikasi bisa berjalan. Namun jika PostgreSQL tersedia, aplikasi juga dapat langsung dihubungkan.

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi di PC/Laptop baru, pastikan perangkat tersebut sudah terinstall:

1. **Node.js** (Versi 18 LTS atau lebih baru)  
   👉 [Download Node.js](https://nodejs.org/) (Pilih versi LTS)
2. **Git** (Opsional, jika ingin mengkloning langsung dari GitHub)  
   👉 [Download Git](https://git-scm.com/)

---

## 📋 Langkah-Langkah Menjalankan Aplikasi dari Awal

### **Langkah 1: Dapatkan Kode Proyek di PC Baru**

**Cara A (Jika menggunakan Git / GitHub):**
Buka Terminal (PowerShell / Command Prompt / Git Bash) di PC baru, lalu jalankan:
```bash
git clone https://github.com/Sweapx/gpdi-melati-depok-church-management-system.git
cd gpdi-melati-depok-church-management-system
```

**Cara B (Jika memindahkan via Flashdisk / ZIP):**
1. Salin seluruh folder `gpdi-melati-depok-church-management-system` ke PC baru.
2. Buka Terminal / PowerShell di dalam folder tersebut.

---

### **Langkah 2: Install Depedensi (Packages)**

Di dalam terminal direktori proyek, jalankan perintah berikut untuk mengunduh seluruh library yang dibutuhkan:
```bash
npm install
```
*(Tunggu hingga proses instalasi library selesai)*

---

### **Langkah 3: Buat File Konfigurasi Environment (`.env`)**

Buat sebuah file baru bernama `.env` tepat di direktori utama proyek (sejajar dengan file `package.json`).

Isi file `.env` tersebut dengan konfigurasi berikut:

```env
# Port aplikasi web
PORT=3000

# Secret key untuk autentikasi admin
JWT_SECRET=gpdi_melati_depok_secret_key_2026

# (Opsional) API Key Google Gemini untuk fitur AI Chatbot Assistant
# Jika tidak diisi, fitur chatbot AI akan menggunakan mode pengenalan bawaan
GEMINI_API_KEY=

# (Opsional) Koneksi PostgreSQL
# Kosongkan atau abaikan jika PC baru belum terinstall PostgreSQL.
# Sistem secara otomatis menggunakan Auto-Fallback & Auto-Seeding dari data_jemaat_parsed.json
# DATABASE_URL=postgres://postgres:password@localhost:5432/gpdi_db
```

---

### **Langkah 4: Jalankan Aplikasi**

Untuk menjalankan aplikasi dalam mode pengembangan (*Development Mode*), jalankan perintah:

```bash
npm run dev
```

Jika berhasil, di terminal akan muncul pesan:
```text
Server running on port 3000
Vite dev server running at http://localhost:3000
```

---

### **Langkah 5: Buka Aplikasi di Browser**

Buka web browser Anda (Google Chrome, Edge, Firefox, dll) lalu buka alamat:

- **Halaman Website Publik (Jemaat)**:  
  👉 `http://localhost:3000`

- **Halaman Portal Admin**:  
  👉 `http://localhost:3000/admin/login`

---

## 🔐 Kredensial Akses Admin Default

Untuk masuk ke Portal Admin (`http://localhost:3000/admin/login`), gunakan kredensial berikut:

- **Username / Email / HP**: `admin` (atau nomor HP admin terdaftar)
- **Password**: `admin123` *(atau password yang telah diatur)*

---

## 🏗️ (Tambahan) Cara Build untuk Mode Produksi

Jika Anda ingin menguji aplikasi dalam mode produksi yang sudah terkompilasi (*Build Mode*):

1. Compile aplikasi:
   ```bash
   npm run build
   ```
2. Jalankan server produksi:
   ```bash
   npm start
   ```

---

## ❓ FAQ & Penanganan Masalah (Troubleshooting)

1. **Error: `'node'` or `'npm'` is not recognized**  
   *Solusi:* PC baru belum menginstall Node.js. Silakan download & install Node.js dari https://nodejs.org/ lalu restart terminal/PC Anda.

2. **Port 3000 Sudah Digunakan (*Address already in use*)**  
   *Solusi:* Ubah `PORT=3000` di dalam file `.env` menjadi port lain, misalnya `PORT=3001` atau `PORT=8080`.

3. **Apakah data jemaat akan hilang di PC baru?**  
   *Tidak.* Sistem secara otomatis membaca file `data_jemaat_parsed.json` yang ada di dalam proyek dan mengisi data master jemaat secara otomatis.

---

*Panduan ini dibuat agar proyek GPdI Melati Depok Church Management System dapat dijalankan dengan mudah di perangkat manapun.*
