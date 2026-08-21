# Panduan Deployment Aplikasi GPdI Melati ke DigitalOcean

Dokumen ini berisi panduan langkah demi langkah untuk melakukan *deployment* aplikasi GPdI Melati Depok Church Management System ke **DigitalOcean (Droplet)** menggunakan VPS Ubuntu, Node.js, PM2, dan Nginx.

---

## Tahap 1: Membuat Droplet (Server VPS) di DigitalOcean

1. Login ke dashboard DigitalOcean Anda.
2. Klik tombol **Create** di kanan atas, lalu pilih **Droplets**.
   > ![Screenshot: Tombol Create Droplet di dashboard DigitalOcean]()
3. Pilih **Region** (lokasi server) yang terdekat dengan pengguna Anda (misalnya: **Singapore**).
   > ![Screenshot: Memilih Region Singapore]()
4. Pilih Image **Ubuntu** (rekomendasi: versi 22.04 LTS atau 24.04 LTS).
   > ![Screenshot: Memilih OS Ubuntu LTS]()
5. Pilih ukuran Droplet (Size). Untuk aplikasi ini, paket **Basic (Regular Intel)** dengan harga $4 - $6 / bulan sudah cukup.
   > ![Screenshot: Memilih ukuran CPU dan RAM Droplet]()
6. Pilih metode otentikasi. Sangat disarankan menggunakan **SSH Key** untuk keamanan, atau Anda bisa menggunakan **Password**.
   > ![Screenshot: Konfigurasi metode otentikasi SSH atau Password]()
7. Beri nama Droplet Anda (misal: `gpdi-app-server`), lalu klik **Create Droplet**.
   > ![Screenshot: Tombol Create Droplet di bagian paling bawah]()

---

## Tahap 2: Setup Server & Instalasi Kebutuhan

1. Setelah Droplet selesai dibuat, salin **IP Address** Droplet Anda.
   > ![Screenshot: IP Address Droplet pada dashboard]()
2. Buka Terminal (Linux/Mac) atau PowerShell/Command Prompt (Windows) dan masuk ke server menggunakan SSH:
   ```bash
   ssh root@IP_DROPLET_ANDA
   ```
   > ![Screenshot: Terminal saat berhasil login SSH ke server]()

3. Update sistem Ubuntu:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. Install Node.js (menggunakan NVM agar mudah mengatur versi):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm install 20
   nvm use 20
   ```
   > ![Screenshot: Proses instalasi Node.js selesai]()

5. Install PM2 (untuk menjaga aplikasi tetap berjalan di background):
   ```bash
   npm install pm2 -g
   ```

6. Install Nginx (sebagai web server / reverse proxy):
   ```bash
   sudo apt install nginx -y
   ```

---

## Tahap 3: Clone Repository & Build Aplikasi

1. Buat folder untuk aplikasi dan masuk ke dalamnya:
   ```bash
   mkdir -p /var/www/gpdi-app
   cd /var/www/gpdi-app
   ```

2. Clone source code dari repository (contoh menggunakan GitHub):
   ```bash
   git clone https://github.com/username-anda/repo-gpdi.git .
   ```
   *(Pastikan titik `.` di akhir disertakan agar kode di-clone langsung ke dalam folder tersebut)*
   > ![Screenshot: Proses Git clone selesai]()

3. Install dependensi aplikasi:
   ```bash
   npm install
   ```

4. Buat file konfigurasi environment (`.env`):
   ```bash
   nano .env
   ```
   Masukkan variabel dari file `.env` lokal Anda ke sini (seperti `DATABASE_URL`, rahasia JWT, dll). Tekan `Ctrl+X`, lalu `Y`, lalu `Enter` untuk menyimpan.
   > ![Screenshot: Isi file .env di dalam nano editor]()

5. Lakukan Build aplikasi:
   ```bash
   npm run build
   ```
   > ![Screenshot: Proses npm run build sukses menghasilkan folder dist]()

---

## Tahap 4: Menjalankan Aplikasi dengan PM2

1. Jalankan aplikasi menggunakan PM2:
   ```bash
   pm2 start npm --name "gpdi-app" -- run start
   ```
   > ![Screenshot: Tabel status PM2 yang menunjukkan aplikasi berstatus 'online']()

2. Agar aplikasi otomatis berjalan saat server di-restart (reboot):
   ```bash
   pm2 startup
   ```
   *(Jalankan perintah yang muncul di layar, lalu ketik `pm2 save`)*

---

## Tahap 5: Konfigurasi Nginx (Domain & Reverse Proxy)

1. Buat file konfigurasi Nginx baru:
   ```bash
   sudo nano /etc/nginx/sites-available/gpdi-app
   ```

2. Masukkan konfigurasi berikut (ganti `domain-anda.com` dengan domain asli Anda atau IP jika belum ada domain):
   ```nginx
   server {
       listen 80;
       server_name domain-anda.com;

       location / {
           proxy_pass http://localhost:5000; # Sesuaikan port dengan yang digunakan aplikasi Anda
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   > ![Screenshot: Konfigurasi Nginx di dalam nano editor]()

3. Aktifkan konfigurasi dan restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/gpdi-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
   > ![Screenshot: Output 'nginx: configuration file /etc/nginx/nginx.conf syntax is ok']()

---

## Tahap Tambahan: Setup SSL (HTTPS) menggunakan Certbot

*Hanya lakukan ini jika Anda sudah memiliki Domain yang diarahkan (A Record) ke IP Droplet Anda.*

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. Generate sertifikat SSL:
   ```bash
   sudo certbot --nginx -d domain-anda.com
   ```
   *(Ikuti instruksi di layar, masukkan email Anda)*
   > ![Screenshot: Pesan sukses 'Successfully received certificate' dari Certbot]()

Aplikasi GPdI Melati Depok sekarang sudah online dan dapat diakses melalui domain Anda!
