# Sistem Manajemen Gereja Digital GPdI Melati Depok

Sistem terpadu untuk mengelola kegiatan jemaat, pendaftaran event, baptisan, permohonan doa, dan integrasi Chatbot AI (Gemini).

## Fitur Utama

### Portal Publik (Jemaat)
- Jadwal ibadah interaktif
- Pengumuman jemaat
- Pendaftaran multi-step (Jemaat Baru, Sensus, Event, Baptisan)
- Chatbot AI berbasis Google Gemini dengan fallback Knowledge Base
- Validasi dokumen (QR/Code)

### Portal Admin
- Dashboard statistik
- Manajemen data jemaat (CRUD)
- Sistem Approval pendaftaran
- CMS untuk jadwal, pengumuman, warta, hero banner
- Manajemen Knowledge Base Chatbot AI

## Teknologi Utama
- **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide React
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (dengan auto fallback ke in-memory store jika tidak ada koneksi)
- **AI:** Google GenAI SDK (@google/genai)
- **Authentication:** JWT + bcrypt

## Cara Menjalankan

1. Instalasi dependensi:
   ```bash
   npm install
   ```

2. Konfigurasi Environment:
   Salin `.env.example` ke `.env` dan sesuaikan nilainya (terutama `GEMINI_API_KEY` dan kredensial database).

3. Menjalankan di Development (Fullstack):
   ```bash
   npm run dev
   ```

4. Build untuk Production:
   ```bash
   npm run build
   npm start
   ```

## Default Admin Login
Saat pertama kali dijalankan (menggunakan in-memory database fallback):
- **Username:** `admin`
- **Password:** `admin123`
*(Sistem akan menyarankan untuk mengubah password setelah login pertama)*

## Deployment (Railway/Render)
- Set Environment Variables di dashboard platform.
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Port: `3000` (atau otomatis disesuaikan oleh platform melalui `process.env.PORT`)
