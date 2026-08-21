# Panduan Menjalankan Aplikasi dengan PostgreSQL Lokal (via Command Prompt)

Secara default, aplikasi ini menggunakan database bawaan berbentuk file JSON. Namun, jika Anda ingin menggunakan **PostgreSQL** untuk performa yang lebih baik layaknya lingkungan *production*, sistem aplikasi sudah dilengkapi dengan fitur otomatis yang akan membuatkan seluruh tabel yang diperlukan (auto-migration).

Berikut adalah panduan lengkap memindahkan database Anda ke PostgreSQL menggunakan **Command Prompt (CMD)** atau Terminal.

---

## 1. Pastikan PostgreSQL Sudah Terinstal
Pastikan PostgreSQL sudah terinstal dan berjalan di komputer Anda. Anda juga harus mengetahui *username* (biasanya `postgres`) dan *password* yang Anda buat saat instalasi.

Pastikan juga *path* PostgreSQL sudah masuk ke dalam *Environment Variables* Windows agar perintah `psql` bisa dijalankan dari Command Prompt.

---

## 2. Membuat Database Baru via Command Prompt
Kita akan membuat database kosong baru bernama `gpdi_melati`.

1. Buka **Command Prompt**.
2. Masuk ke PostgreSQL dengan mengetik perintah berikut:
   ```bash
   psql -U postgres
   ```
   *(Tekan Enter, lalu masukkan password PostgreSQL Anda. Teks password tidak akan terlihat saat diketik, ini adalah hal normal).*
3. Setelah masuk (ditandai dengan prompt `postgres=#`), ketik perintah SQL berikut:
   ```sql
   CREATE DATABASE gpdi_melati;
   ```
   *(Pastikan diakhiri dengan titik koma `;`)*
4. Jika berhasil, akan muncul tulisan `CREATE DATABASE`.
5. Keluar dari PostgreSQL dengan mengetik:
   ```sql
   \q
   ```

---

## 3. Konfigurasi Variabel Lingkungan (`.env`)
Sekarang kita perlu memberitahu aplikasi agar menggunakan database `gpdi_melati` yang baru saja dibuat.

1. Buka folder proyek aplikasi ini.
2. Buat file baru bernama `.env` (atau edit jika sudah ada).
3. Tambahkan baris kode koneksi (Connection String) berikut:
   ```env
   DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/gpdi_melati"
   ```
   *Catatan: Ganti tulisan `PASSWORD_ANDA` dengan password PostgreSQL milik Anda. `5432` adalah port bawaan PostgreSQL.*

---

## 4. Jalankan Aplikasi (Proses Pembuatan Tabel Otomatis)
Aplikasi ini sudah diprogram (di dalam file `src/server/db/index.ts`) untuk secara cerdas mendeteksi `DATABASE_URL`. Jika terdeteksi, aplikasi akan otomatis menghubungkan diri, membuat tabel, dan mengisi data awal (*seeding*).

1. Buka **Command Prompt** baru, lalu arahkan (*cd*) ke dalam folder proyek aplikasi Anda.
2. Jalankan aplikasi dengan perintah:
   ```bash
   npm run dev
   ```
3. Perhatikan layar (log) pada Command Prompt Anda. Jika koneksi berhasil, Anda akan melihat pesan:
   > `Using PostgreSQL Database - Initializing schema if needed...`
   > `PostgreSQL Database Schema Check/Initialization Complete.`
   
   Ini menandakan bahwa seluruh tabel seperti `jemaat`, `schedules`, `wadah`, `rayon`, dll, **telah berhasil diciptakan**!

---

## 5. Cara Melihat Tabel-Tabel yang Sudah Dibuat
Untuk membuktikan bahwa seluruh tabel sudah tercipta, kita bisa melihatnya melalui Command Prompt.

1. Buka **Command Prompt** baru.
2. Masuk langsung ke dalam database `gpdi_melati` yang sudah kita buat tadi dengan perintah:
   ```bash
   psql -U postgres -d gpdi_melati
   ```
   *(Masukkan password saat diminta)*
3. Untuk melihat **daftar semua tabel** yang telah dibuat, ketik perintah:
   ```sql
   \dt
   ```
   Anda akan melihat tabel-tabel seperti `jemaat`, `wadah`, `rayon`, `schedules`, `announcements`, dll.
4. Untuk melihat **struktur/kolom** dari tabel tertentu (misal tabel `jemaat`), ketik:
   ```sql
   \d jemaat
   ```
5. Untuk **melihat data/isi tabel** (contoh: melihat data admin), ketik:
   ```sql
   SELECT * FROM admin_users;
   ```
   *(Jika tabel admin_users belum dibuat di inisialisasi SQL, gunakan `SELECT * FROM jemaat;` sebagai contoh percobaan).*
6. Jika sudah selesai melihat-lihat, ketik `\q` untuk keluar.

---
**Selesai!** Aplikasi Anda kini sepenuhnya berjalan dengan performa maksimal menggunakan PostgreSQL.
