# Dokumentasi UI Aplikasi GPdI Melati Depok - Kondisi Saat Ini

## 📋 Overview

Dokumentasi ini menjelaskan secara lengkap kondisi UI (User Interface) aplikasi GPdI Melati Depok Church Management System pada saat ini, termasuk tata letak, fitur yang ada, dan fitur yang belum ada.

**URL Aplikasi:** https://gpdimelati.me

**Teknologi UI:**
- React + Vite + TypeScript
- TailwindCSS untuk styling
- Framer Motion untuk animasi
- Lucide React untuk icons
- React Router untuk navigasi

---

## 🌐 Struktur Routing

### Public Routes (Tanpa Login)
- `/` - Halaman Utama (Home)
- `/warta` - Halaman Warta Jemaat

### Admin Routes (Perlu Login)
- `/admin/login` - Halaman Login Admin
- `/admin` - Dashboard Admin
- `/admin/jemaat` - Manajemen Data Jemaat
- `/admin/approvals` - Sistem Approval & Pendaftaran
- `/admin/cms` - Content Management System
- `/admin/kb` - AI Knowledge Base (Chatbot)
- `/admin/prayers` - Manajemen Permohonan Doa

---

## 🎨 Layout Global

### 1. PublicLayout (Layout untuk Halaman Publik)

**Komponen:** `src/components/PublicLayout.tsx`

**Struktur Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Top Bar (Navy background)                           │
│ - Telepon: 0812-9900-1122                          │
│ - Email: info@gpdimelatidepok.org                   │
│ - Alamat: Jl. Melati Raya No. 1, Depok              │
├─────────────────────────────────────────────────────┤
│ Navbar (White, Sticky)                              │
│ [Logo GPdI] [GPdI MELATI DEPOK]  [Warta][Jadwal]   │
│           [Pengumuman]              [Menu Mobile]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Main Content (Outlet)                               │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Footer (Navy background)                            │
│ [Logo] GPdI MELATI DEPOK    [Kontak] [Layanan]      │
│                             [Admin Login]          │
│ Copyright © 2026                                    │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ [Chatbot Widget - Floating Button]                  │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ Top bar dengan informasi kontak
- ✅ Logo gereja (gpdi-logo.png) di navbar dan footer
- ✅ Navigasi desktop: Warta Jemaat, Jadwal, Pengumuman
- ✅ Navigasi mobile (hamburger menu)
- ✅ Footer dengan 4 kolom: Logo, Kontak, Layanan Digital, Admin
- ✅ Chatbot widget floating button di pojok kanan bawah

**Fitur yang Belum Ada:**
- ❌ Dark mode toggle
- ❌ Bahasa selector (Indonesia/English)
- ❌ Social media links di footer
- ❌ Newsletter subscription di footer

---

### 2. AdminLayout (Layout untuk Halaman Admin)

**Komponen:** `src/components/admin/AdminLayout.tsx`

**Struktur Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Sidebar (Navy background, Fixed width 256px)        │
│ ┌───────────────────────────────────────────────┐ │
│ │ [G] Admin Portal                               │ │
│ │ GPdI Melati Depok                              │ │
│ ├───────────────────────────────────────────────┤ │
│ │ • Dashboard                                    │ │
│ │ • Data Jemaat                                  │ │
│ │ • Approvals [badge count]                      │ │
│ │ • CMS                                          │ │
│ │ • AI Knowledge                                 │ │
│ │ • Prayers                                      │ │
│ ├───────────────────────────────────────────────┤ │
│ │ [Public Web]                                   │ │
│ │ [Logout]                                       │ │
│ └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Main Content Area (Scrollable)                     │
│ [Page Content]                                     │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ Sidebar dengan navigasi admin
- ✅ Badge count untuk pending approvals
- ✅ Tombol kembali ke public web
- ✅ Tombol logout
- ✅ Active state untuk menu yang sedang dibuka

**Fitur yang Belum Ada:**
- ❌ User profile dropdown di sidebar
- ❌ Settings menu
- ❌ Activity log / audit trail
- ❌ Help/Documentation link

---

## 📄 Halaman Publik

### 1. Halaman Utama (Home)

**URL:** `/`
**Komponen:** `src/pages/Home.tsx`

**Struktur Halaman:**
```
┌─────────────────────────────────────────────────────┐
│ Hero Section (Carousel Banner)                      │
│ [Slide 1] [Slide 2] [Slide 3]                        │
│ [Navigation Arrows] [Dots]                           │
├─────────────────────────────────────────────────────┤
│ Quick Access Cards (Floating above content)          │
│ [Pemutakhiran][Jemaat Baru][Baptisan][Doa]          │
│ [Validasi Surat][Warta Jemaat]                       │
├─────────────────────────────────────────────────────┤
│ Jadwal Ibadah Section (White background)            │
│ [Category Filters]                                   │
│ [Schedule Cards Grid]                                │
├─────────────────────────────────────────────────────┤
│ Pengumuman Section                                   │
│ [Announcement Cards (Accordion)]                     │
└─────────────────────────────────────────────────────┘
```

#### 1.1 Hero Section

**Komponen:** `src/components/home/HeroSection.tsx`

**Fitur yang Ada:**
- ✅ Carousel slide dengan auto-play (5 detik)
- ✅ Background image dengan gradient overlay
- ✅ Badge label di atas
- ✅ Judul dan subtitle
- ✅ Tombol CTA dengan navigasi
- ✅ Navigation arrows (kiri/kanan)
- ✅ Dot indicators
- ✅ Pause on hover
- ✅ Animasi transisi (fade + scale)
- ✅ CTA Types: schedule, event, warta, prayer
- ✅ Status aktif/nonaktif untuk slide

**Fitur yang Belum Ada:**
- ❌ Swipe gesture untuk mobile
- ❌ Keyboard navigation
- ❌ Progress bar untuk slide duration
- ❌ Fullscreen mode

#### 1.2 Quick Access Cards

**Komponen:** `src/components/home/QuickAccessCards.tsx`

**Cards yang Ada:**
1. ✅ Pemutakhiran Data - Membuka modal pemutakhiran data
2. ✅ Pendaftaran Jemaat - Membuka modal pendaftaran jemaat baru
3. ✅ Baptisan Air - Membuka modal pendaftaran baptisan
4. ✅ Permohonan Doa - Membuka modal permohonan doa
5. ✅ Validasi Surat - Membuka modal validasi QR/sertifikat
6. ✅ Warta Jemaat - Navigasi ke halaman /warta

**Fitur yang Ada:**
- ✅ Grid layout responsive (2-3-6 kolom)
- ✅ Icon untuk setiap card
- ✅ Hover animation (lift + scale)
- ✅ Modal untuk setiap fitur
- ✅ Form permohonan doa dengan opsi anonim
- ✅ Form validasi sertifikat dengan kode

**Fitur yang Belum Ada:**
- ❌ Card untuk "Donasi Online"
- ❌ Card untuk "Live Streaming"
- ❌ Card untuk "Kalender Kegiatan"
- ❌ Card untuk "Galeri Foto"

#### 1.3 Interactive Schedule

**Komponen:** `src/components/home/InteractiveSchedule.tsx`

**Fitur yang Ada:**
- ✅ Category filters: Semua, Ibadah Raya, Sekolah Minggu, Youth, Event Spesial
- ✅ Grid layout responsive (1-2-3 kolom)
- ✅ Schedule card dengan:
  - Kategori badge
  - Judul
  - Hari & Jam
  - Pembicara
  - Lokasi
  - Deskripsi
- ✅ Indikator "Pendaftaran Dibuka"
- ✅ Kuota display (terdaftar/total)
- ✅ Tombol daftar untuk event yang butuh pendaftaran
- ✅ Animasi layout saat filter berubah
- ✅ Loading state
- ✅ Empty state

**Fitur yang Belum Ada:**
- ❌ Calendar view (monthly/weekly)
- ❌ Export to calendar (ICS)
- ❌ Reminder/notification untuk event
- ❌ Search functionality
- ❌ Filter by date range

#### 1.4 Announcement Section

**Komponen:** `src/components/home/AnnouncementSection.tsx`

**Fitur yang Ada:**
- ✅ Accordion style untuk expand/collapse
- ✅ Kategori badge
- ✅ Tanggal
- ✅ Judul dan ringkasan
- ✅ Indikator "Penting" dengan icon dan highlight
- ✅ Gambar support
- ✅ Full content saat expanded
- ✅ Animasi smooth expand/collapse
- ✅ Auto-hide jika tidak ada pengumuman

**Fitur yang Belum Ada:**
- ❌ Filter by kategori
- ❌ Search pengumuman
- ❌ Share button untuk pengumuman
- ❌ Subscribe to notifications

---

### 2. Halaman Warta Jemaat

**URL:** `/warta`
**Komponen:** `src/pages/WartaJemaat.tsx`

**Struktur Halaman:**
```
┌─────────────────────────────────────────────────────┐
│ Header Section (Navy background)                     │
│ [Title: Warta Jemaat]                               │
│ [Description]                                        │
├─────────────────────────────────────────────────────┤
│ Search Bar (Floating)                                │
│ [Search Input]                                       │
├─────────────────────────────────────────────────────┤
│ Warta List (Cards)                                   │
│ [Warta Card 1]                                      │
│ [Warta Card 2]                                      │
│ [Warta Card 3]                                      │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ Hero section dengan judul dan deskripsi
- ✅ Search bar untuk mencari edisi/tema
- ✅ Warta cards dengan:
  - Edisi badge
  - Tanggal
  - Tema minggu
  - Ayat minggu
  - Pengumuman (truncate 2 lines)
  - Download PDF button
  - Baca selengkapnya button
- ✅ Expandable card untuk melihat:
  - PDF preview (iframe)
  - Daftar petugas pelayanan
- ✅ Empty state jika tidak ada warta
- ✅ Loading state
- ✅ Animasi entrance
- ✅ Responsive design

**Fitur yang Belum Ada:**
- ❌ Filter by bulan/tahun
- ❌ Archive view
- ❌ Subscribe to warta notifications
- ❌ Print warta
- ❌ Share warta to social media
- ❌ Audio version of warta

---

## 🔐 Halaman Admin

### 1. Login Admin

**URL:** `/admin/login`
**Komponen:** `src/pages/admin/Login.tsx`

**Fitur yang Ada:**
- ✅ Form login dengan username dan password
- ✅ JWT authentication
- ✅ Error handling
- ✅ Redirect ke dashboard setelah login

**Fitur yang Belum Ada:**
- ❌ Remember me checkbox
- ❌ Forgot password link
- ❌ Show/hide password toggle
- ❌ Login with Google/other providers

---

### 2. Dashboard Admin

**URL:** `/admin`
**Komponen:** `src/pages/admin/Dashboard.tsx`

**Struktur Halaman:**
```
┌─────────────────────────────────────────────────────┐
│ [Title: Dashboard Statistik]                         │
├─────────────────────────────────────────────────────┤
│ Metric Cards (Grid 4 kolom)                          │
│ [Total Jemaat Aktif] [Ultah Bulan Ini]              │
│ [Total Pria] [Total Wanita]                          │
│ [Pending Verifikasi] [Total Pendaftar E-Form]         │
│ [Permohonan Doa]                                     │
├─────────────────────────────────────────────────────┤
│ Jemaat Berulang Tahun (Minggu Ini)                  │
│ [Empty State - Belum ada data]                      │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ 7 metric cards dengan icons
- ✅ Real-time data fetching
- ✅ Animasi entrance
- ✅ Section untuk jemaat berulang tahun (placeholder)

**Fitur yang Belum Ada:**
- ❌ Chart/graph visualization
- ❌ Activity trends (weekly/monthly)
- ✅ Jemaat berulang tahun (logic belum diimplementasi, hanya placeholder)
- ❌ Recent activity log
- ❌ Quick actions
- ❌ System health indicators

---

### 3. Manajemen Data Jemaat

**URL:** `/admin/jemaat`
**Komponen:** `src/pages/admin/Jemaat.tsx`

**Struktur Halaman:**
```
┌─────────────────────────────────────────────────────┐
│ [Title: Manajemen Data Jemaat] [Tambah Data Button]  │
├─────────────────────────────────────────────────────┤
│ Search Bar                                           │
│ [Search Input: Cari nama atau NIK...]                │
├─────────────────────────────────────────────────────┤
│ Table Jemaat                                         │
│ [Expand] [Nama] [NIK] [Gender] [Status] [Aksi]      │
│ [Row 1]                                              │
│ [Row 2]                                              │
│ [Row 3]                                              │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ Search by nama atau NIK
- ✅ Tambah data jemaat (via prompt - sederhana)
- ✅ Edit data jemaat (modal form)
- ✅ Hapus data jemaat (dengan konfirmasi)
- ✅ Expandable row untuk melihat detail:
  - Tempat/tanggal lahir
  - No. handphone
  - Status pernikahan
  - Alamat lengkap
  - Anggota keluarga (jika ada)
- ✅ Edit anggota keluarga
- ✅ Hapus anggota keluarga
- ✅ Status badge (Aktif/Inaktif)
- ✅ Loading state
- ✅ Empty state

**Fitur yang Belum Ada:**
- ❌ Filter by status (Aktif/Inaktif/Keluar/Meninggal)
- ❌ Filter by gender
- ❌ Filter by kategori kaum
- ❌ Export to Excel/CSV
- ❌ Bulk actions (select multiple)
- ❌ Import data dari Excel/CSV
- ❌ Photo upload untuk jemaat
- ❌ History perubahan data
- ❌ Advanced search (by address, phone, etc.)

---

### 4. Sistem Approval & Pendaftaran

**URL:** `/admin/approvals`
**Komponen:** `src/pages/admin/Approvals.tsx`

**Struktur Halaman:**
```
┌─────────────────────────────────────────────────────┐
│ [Title: Sistem Approval & Pendaftaran]              │
├─────────────────────────────────────────────────────┤
│ Table Pendaftaran                                   │
│ [Expand] [Tipe] [Nama] [No WA] [Status] [Aksi]      │
│ [Row 1] [Approve][Reject]                           │
│ [Row 2] [Approve][Reject]                           │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ List semua pendaftaran (jemaat baru, baptisan, event)
- ✅ Tipe badge (Jemaat Baru, Baptisan, Event)
- ✅ Status badge (Pending/Disetujui/Ditolak)
- ✅ Approve button (hanya untuk pending)
- ✅ Reject button (hanya untuk pending)
- ✅ Expandable row untuk melihat detail:
  - NIK
  - Tempat/tanggal lahir
  - Gender
  - Alamat lengkap
  - Lampiran KTP (preview)
  - Lampiran bukti pembayaran (preview)
  - Custom form responses
  - Anggota keluarga
- ✅ Loading state
- ✅ Empty state

**Fitur yang Belum Ada:**
- ❌ Filter by status
- ❌ Filter by tipe pendaftaran
- ❌ Filter by date range
- ❌ Bulk approve/reject
- ❌ Add note saat approve/reject
- ❌ Send notification email saat approve/reject
- ❌ Export data

---

### 5. Content Management System (CMS)

**URL:** `/admin/cms`
**Komponen:** `src/pages/admin/Cms.tsx`

**Struktur Halaman:**
```
┌─────────────────────────────────────────────────────┐
│ [Title: Content Management System] [Tambah Konten]   │
├─────────────────────────────────────────────────────┤
│ Tabs: [Pengumuman][Jadwal Ibadah][Banner][Warta]   │
├─────────────────────────────────────────────────────┤
│ Table Content (berdasarkan tab aktif)                │
│ [Judul/Utama] [Kategori/Tipe] [Waktu/Status][Aksi]  │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**

#### Tab Pengumuman:
- ✅ List pengumuman
- ✅ Tambah pengumuman (modal form)
- ✅ Edit pengumuman (modal form)
- ✅ Hapus pengumuman
- ✅ Fields: Judul, Kategori, Ringkasan, Isi, Tanggal

#### Tab Jadwal Ibadah:
- ✅ List jadwal ibadah
- ✅ Tambah jadwal (modal form)
- ✅ Edit jadwal (modal form)
- ✅ Hapus jadwal
- ✅ Fields: Judul, Kategori, Hari & Jam
- ✅ Pendaftaran required toggle
- ✅ Kuota pendaftaran
- ✅ Biaya pendaftaran
- ✅ Custom form fields builder:
  - Tipe: text, select, checkbox
  - Required toggle
  - Options untuk select

#### Tab Banner Slide (Hero):
- ✅ List hero slides
- ✅ Tambah slide (modal form)
- ✅ Edit slide (modal form)
- ✅ Hapus slide
- ✅ Fields: Judul, Subtitle, Gambar, Badge, CTA Text, CTA Type, Status
- ✅ CTA Types: event, jemaat_baru, baptisan, schedule, warta, prayer
- ✅ Status aktif/nonaktif
- ✅ File upload untuk gambar

#### Tab Warta Jemaat:
- ✅ List warta jemaat
- ✅ Tambah warta (modal form)
- ✅ Edit warta (modal form)
- ✅ Hapus warta
- ✅ Fields: Edisi, Tema Minggu, Ayat Minggu, PDF, Pengumuman
- ✅ File upload untuk PDF

**Fitur yang Belum Ada:**
- ❌ Media library (upload dan reuse gambar)
- ❌ Draft mode (simpan sebagai draft)
- ❌ Schedule publish (publish di waktu tertentu)
- ❌ Version history
- ❌ Preview mode
- ❌ Rich text editor (WYSIWYG)
- ❌ Image cropping/resizing
- ❌ SEO settings (meta tags)

---

### 6. AI Knowledge Base (Chatbot)

**URL:** `/admin/kb`
**Komponen:** `src/pages/admin/KnowledgeBase.tsx`

**Struktur Halaman:**
```
┌─────────────────────────────────────────────────────┐
│ [Title: AI Knowledge Base]                           │
│ [Description: Kelola pertanyaan dan jawaban...]       │
│ [Tambah Q&A Button]                                  │
├─────────────────────────────────────────────────────┤
│ Form Tambah Q&A (Toggle)                             │
│ [Kategori] [Pertanyaan] [Jawaban] [Simpan][Batal]    │
├─────────────────────────────────────────────────────┤
│ Table Knowledge Base                                 │
│ [Topik] [Pertanyaan] [Jawaban] [Aksi]                │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ List knowledge base items
- ✅ Tambah Q&A dengan form (bukan prompt):
  - Kategori/Topik dengan penjelasan
  - Pertanyaan (patterns) dengan penjelasan
  - Jawaban bot dengan penjelasan
- ✅ Edit Q&A (alert - fitur edit sedang disiapkan)
- ✅ Hapus Q&A
- ✅ Toggle form tambah Q&A
- ✅ Penjelasan untuk setiap field
- ✅ Empty state dengan instruksi
- ✅ Loading state

**Fitur yang Belum Ada:**
- ❌ Edit functionality (hanya placeholder alert)
- ❌ Filter by kategori
- ❌ Search knowledge base
- ❌ Import/Export knowledge base
- ❌ Test chatbot di admin panel
- ❌ Analytics (pertanyaan yang sering ditanya)
- ❌ Intent classification
- ❌ Multi-language support

---

### 7. Manajemen Permohonan Doa

**URL:** `/admin/prayers`
**Komponen:** `src/pages/admin/Prayers.tsx`

**Fitur yang Ada:**
- ✅ List permohonan doa
- ✅ Status badge (Baru/Didoakan/Selesai)
- ✅ Expandable row untuk melihat detail
- ✅ Update status permohonan doa

**Fitur yang Belum Ada:**
- ❌ Filter by status
- ❌ Filter by kategori
- ❌ Filter by privacy (Publik/Rahasia)
- ❌ Assign to prayer team member
- ❌ Add note/response
- ❌ Send notification saat didoakan
- ❌ Prayer request statistics

---

## 🤖 Komponen Interaktif

### 1. Chatbot Widget

**Komponen:** `src/components/ChatbotWidget.tsx`

**Struktur:**
```
[Floating Button - Bottom Right]
        ↓ (Click)
[Chat Window]
┌─────────────────────────────────────────────────────┐
│ Header: [Bot Icon] Asisten AI Gereja [Online][X]   │
├─────────────────────────────────────────────────────┤
│ Chat Messages Area                                   │
│ [Bot: Shalom! Saya asisten AI...]                   │
│ [User: Jadwal ibadah?]                              │
│ [Bot: Jadwal ibadah...]                             │
├─────────────────────────────────────────────────────┤
│ Quick Questions (hanya di awal)                     │
│ [Jadwal ibadah minggu ini?]                          │
│ [Syarat baptis air]                                  │
│ [Lokasi gereja]                                      │
├─────────────────────────────────────────────────────┤
│ Input: [Ketik pesan...] [Send Button]                │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ Floating button di pojok kanan bawah
- ✅ Chat window dengan header
- ✅ Message bubbles (user/bot)
- ✅ Auto-scroll ke bawah
- ✅ Loading indicator (typing animation)
- ✅ Quick questions buttons
- ✅ Send on Enter key
- ✅ Animasi open/close
- ✅ Integration dengan Gemini API
- ✅ Knowledge base untuk responses

**Fitur yang Belum Ada:**
- ❌ Voice input/output
- ❌ Chat history (di session berbeda)
- ❌ Clear chat button
- ❌ Minimize instead of close
- ❌ Emoji support
- ❌ File attachment
- ❌ Typing indicator untuk user
- ❌ Read receipts

---

### 2. Multi-Step Registration Modal

**Komponen:** `src/components/home/MultiStepRegistrationModal.tsx`

**Struktur:**
```
┌─────────────────────────────────────────────────────┐
│ Header: [Title] [Langkah X dari 3] [X]              │
├─────────────────────────────────────────────────────┤
│ Step 1: Data Pribadi / Kepala Keluarga              │
│ [Nama Lengkap] [NIK] [Gender] [No WA]               │
│ [Alamat Lengkap] [Provinsi] [Kota/Kab] [Kecamatan]  │
│ [Kelurahan]                                          │
│ [Custom Fields untuk Event]                          │
│ [Anggota Keluarga - Opsional]                        │
│   [+ Tambah Anggota]                                 │
│   [Anggota 1: Nama, NIK, No HP, Tgl Lahir, Gender,  │
│    Kategori Kaum, Status Keluarga]                   │
├─────────────────────────────────────────────────────┤
│ Step 2: Berkas & Persyaratan                         │
│ [Upload Foto KTP]                                    │
│ [Upload Bukti Pembayaran - jika event berbayar]     │
│ [Upload Pasfoto 3x4 - jika baptisan]                 │
│ [Checkbox: Saya menyatakan data benar...]           │
├─────────────────────────────────────────────────────┤
│ Step 3: Konfirmasi Data                              │
│ [Summary: Nama, NIK, No WA, Alamat]                  │
│ [Alert: Pastikan data sudah benar...]                │
├─────────────────────────────────────────────────────┤
│ Footer: [Kembali] [Selanjutnya/Kirim Data]           │
└─────────────────────────────────────────────────────┘
```

**Fitur yang Ada:**
- ✅ 3-step wizard
- ✅ Animasi transisi antar step
- ✅ Step indicator
- ✅ Form validation
- ✅ Dynamic fields untuk event (custom fields)
- ✅ Anggota keluarga management (tambah/hapus)
- ✅ File upload untuk KTP, bukti bayar, pasfoto
- ✅ Terms agreement checkbox
- ✅ Konfirmasi data sebelum submit
- ✅ Success state setelah submit
- ✅ Support untuk: jemaat_baru, baptisan, pemutakhiran_data, event

**Fitur yang Belum Ada:**
- ❌ Progress bar
- ❌ Save as draft
- ❌ Auto-save
- ❌ Previous data pre-fill (untuk pemutakhiran)
- ❌ File size validation
- ❌ File type validation
- ❌ OCR untuk KTP (auto-fill data)

---

## 🎨 Design System

### Colors
- **Primary (Navy):** #1e3a5f
- **Accent (Gold):** #d4a853
- **Background (Sand):** #f5f1ed
- **Background Dark (Sand Darker):** #ebe7e3
- **Text (Navy):** #1e3a5f
- **Text Muted:** #6b7280
- **Text Light:** #9ca3af
- **Border Subtle:** #e5e7eb
- **Success (Emerald):** #10b981
- **Error (Rose):** #ef4444

### Typography
- **Font Family:** Sans-serif (system fonts)
- **Headings:** Serif (untuk judul utama)
- **Font Sizes:**
  - H1: 2xl (24px)
  - H2: xl (20px)
  - H3: lg (18px)
  - Body: base (16px)
  - Small: sm (14px)
  - XSmall: xs (12px)

### Components
- **Buttons:** Rounded-full, dengan shadow
- **Cards:** Rounded-2xl, dengan border dan shadow
- **Inputs:** Rounded-xl, dengan focus ring gold
- **Modals:** Rounded-3xl, dengan backdrop blur
- **Tables:** Rounded-2xl, dengan border dan hover effect

### Animations
- **Library:** Framer Motion
- **Types:** Fade, scale, slide, layout
- **Duration:** 0.2s - 0.7s
- **Easing:** easeInOut

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md)
- **Desktop:** > 1024px (lg)

### Mobile Adaptations
- ✅ Hamburger menu untuk navbar
- ✅ Grid layout adapts (1-2-3-6 kolom)
- ✅ Modal full width pada mobile
- ✅ Chat window width adapts
- ✅ Table scrollable pada mobile
- ✅ Touch-friendly buttons

---

## ❌ Fitur yang Belum Ada (Summary)

### Public Facing
1. **Live Streaming** - Tidak ada fitur live streaming ibadah
2. **Donasi Online** - Tidak ada fitur donasi/payment gateway
3. **Galeri Foto/Video** - Tidak ada galeri kegiatan gereja
4. **Kalender Kegiatan** - Tidak ada kalender view untuk jadwal
5. **Newsletter** - Tidak ada subscription newsletter
6. **Social Media Integration** - Tidak ada social media links/sharing
7. **Dark Mode** - Tidak ada toggle dark mode
8. **Multi-language** - Tidak ada support bahasa lain
9. **Audio/Video Resources** - Tidak ada khotbah audio/video
10. **Member Portal** - Tidak ada portal untuk jemaat login

### Admin Panel
1. **User Management** - Tidak ada manajemen user admin
2. **Role/Permission** - Tidak ada system role/permission
3. **Audit Log** - Tidak ada log aktivitas admin
4. **Reports/Analytics** - Tidak ada laporan/statistik detail
5. **Backup/Restore** - Tidak ada fitur backup database
6. **Settings** - Tidak ada halaman settings
7. **Email Templates** - Tidak ada manajemen template email
8. **SMS Gateway** - Tidak ada integration SMS
9. **Push Notifications** - Tidak ada push notification system
10. **API Documentation** - Tidak ada docs untuk API

### Technical
1. **Error Boundary** - Tidak ada error boundary components
2. **Loading Skeletons** - Loading state masih simple pulse
3. **Offline Support** - Tidak ada PWA/service worker
4. **SEO Optimization** - Meta tags belum optimal
5. **Performance Monitoring** - Tidak ada analytics tracking
6. **A11y Compliance** - WCAG compliance belum lengkap
7. **Unit Tests** - Tidak ada test suite
8. **E2E Tests** - Tidak ada automated testing

---

## ✅ Fitur yang Sudah Ada (Summary)

### Public Facing
1. ✅ Hero carousel dengan CTA navigation
2. ✅ Quick access cards untuk fitur utama
3. ✅ Jadwal ibadah dengan category filters
4. ✅ Pengumuman dengan accordion
5. ✅ Warta jemaat dengan PDF preview
6. ✅ Pendaftaran jemaat baru (multi-step form)
7. ✅ Pendaftaran baptisan (multi-step form)
8. ✅ Pemutakhiran data jemaat (multi-step form)
9. ✅ Permohonan doa dengan opsi anonim
10. ✅ Validasi sertifikat/dokumen
11. ✅ Chatbot AI dengan knowledge base
12. ✅ Responsive design
13. ✅ Animasi smooth dengan Framer Motion

### Admin Panel
1. ✅ Dashboard dengan statistics
2. ✅ Manajemen data jemaat (CRUD)
3. ✅ Manajemen anggota keluarga
4. ✅ Approval system untuk pendaftaran
5. ✅ CMS untuk pengumuman
6. ✅ CMS untuk jadwal ibadah
7. ✅ CMS untuk hero slides/banner
8. ✅ CMS untuk warta jemaat
9. ✅ Knowledge base management untuk chatbot
10. ✅ Manajemen permohonan doa
11. ✅ Custom form builder untuk event
12. ✅ File upload support
13. ✅ Search functionality
14. ✅ Filter dan pagination (basic)

---

## 📊 Status Implementasi

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Hero Carousel | ✅ Selesai | Full functional dengan CTA navigation |
| Quick Access Cards | ✅ Selesai | 6 cards dengan modal |
| Jadwal Ibadah | ✅ Selesai | Dengan category filters dan pendaftaran |
| Pengumuman | ✅ Selesai | Accordion style dengan penting indicator |
| Warta Jemaat | ✅ Selesai | Dengan PDF preview dan petugas |
| Pendaftaran Jemaat | ✅ Selesai | Multi-step form dengan anggota keluarga |
| Pendaftaran Baptisan | ✅ Selesai | Multi-step form dengan upload pasfoto |
| Pendaftaran Event | ✅ Selesai | Dynamic form dengan custom fields |
| Permohonan Doa | ✅ Selesai | Dengan opsi anonim |
| Validasi Sertifikat | ✅ Selesai | Dengan kode validation |
| Chatbot AI | ✅ Selesai | Dengan knowledge base dan Gemini API |
| Admin Dashboard | ⚠️ Partial | Statistics ada, chart belum ada |
| Manajemen Jemaat | ✅ Selesai | CRUD lengkap dengan anggota keluarga |
| Approval System | ✅ Selesai | Approve/reject dengan detail view |
| CMS Pengumuman | ✅ Selesai | CRUD lengkap |
| CMS Jadwal | ✅ Selesai | CRUD dengan custom form builder |
| CMS Hero Slides | ✅ Selesai | CRUD dengan CTA configuration |
| CMS Warta | ✅ Selesai | CRUD dengan PDF upload |
| Knowledge Base | ⚠️ Partial | Add/delete ada, edit belum |
| Permohonan Doa Admin | ⚠️ Partial | List ada, update status belum lengkap |

---

## 🔧 Technical Debt & Improvements Needed

### High Priority
1. **Edit Knowledge Base** - Fitur edit hanya alert placeholder
2. **Ultah Bulan Ini** - Logic belum diimplementasi di dashboard
3. **Prayers Admin** - Update status functionality belum lengkap
4. **Error Handling** - Error boundary dan proper error pages
5. **Loading States** - Skeleton loading components

### Medium Priority
1. **Form Validation** - Client-side validation yang lebih robust
2. **File Upload** - Size dan type validation
3. **Search** - Advanced search dengan filters
4. **Pagination** - Server-side pagination untuk data besar
5. **Export** - Export to Excel/CSV functionality

### Low Priority
1. **Dark Mode** - Theme toggle
2. **Multi-language** - i18n support
3. **Analytics** - User behavior tracking
4. **Performance** - Code splitting dan lazy loading
5. **Testing** - Unit dan E2E tests

---

## 📝 Catatan

- Aplikasi menggunakan React Router untuk navigasi
- State management menggunakan React hooks (useState, useEffect)
- Styling menggunakan TailwindCSS utility classes
- Animasi menggunakan Framer Motion
- Icons menggunakan Lucide React
- File upload menggunakan base64 encoding
- Authentication menggunakan JWT token di localStorage
- API calls menggunakan native fetch API
- Responsive design dengan mobile-first approach

---

*Dokumentasi ini mencerminkan kondisi UI aplikasi pada tanggal pembuatan. Untuk informasi terbaru, silakan cek source code terbaru.*
