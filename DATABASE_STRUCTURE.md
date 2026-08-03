# Database Structure Documentation
## GPdI Melati Depok Church Management System

---

## 📊 Database Overview

**Database Name**: `gpdi_melati`  
**Database Type**: PostgreSQL  
**Environment**: Production (Digital Ocean VPS - gpdimelati.me)  
**Connection String**: `postgresql://gpdi_user:password@localhost:5432/gpdi_melati`

---

## 🗂️ Table Structure & UI Mapping

### 1. Table: `admin_users`

**Purpose**: Menyimpan data admin user untuk login ke admin panel.

#### Schema
```sql
CREATE TABLE admin_users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key, unique identifier | System |
| `username` | VARCHAR(100) | Yes | Username untuk login | Login form |
| `password_hash` | VARCHAR(255) | Yes | Password yang di-hash (bcrypt) | Login form |
| `name` | VARCHAR(255) | No | Nama lengkap admin | Admin header |
| `role` | VARCHAR(50) | No | Role admin (admin/super_admin) | Permission check |
| `must_change_password` | BOOLEAN | No | Flag untuk force password change | First login |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Login Page**: `/admin/login`
  - Input: `username` → Field `username`
  - Input: `password` → Hash → Field `password_hash`
  - Button: "Login" → POST `/api/auth/login`
  - Flow: User enters credentials → API validates against `admin_users` table → Returns JWT token

- **Admin Panel Header**
  - Display: `name` → Shows admin name in sidebar/header
  - Button: "Logout" → Clears localStorage token

#### API Endpoints
- `POST /api/auth/login` - Validate credentials
- `GET /api/admin-users` - Get all admin users
- `POST /api/admin-users` - Create new admin user
- `PUT /api/admin-users/:id` - Update admin user
- `DELETE /api/admin-users/:id` - Delete admin user

---

### 2. Table: `jemaat`

**Purpose**: Menyimpan data jemaat aktif gereja.

#### Schema
```sql
CREATE TABLE jemaat (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    alamat TEXT,
    no_hp VARCHAR(20),
    rayon VARCHAR(100),
    wadah VARCHAR(100),
    status_jemaat VARCHAR(50) DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: JEM-XXX) | System |
| `nama` | VARCHAR(255) | Yes | Nama lengkap jemaat | Jemaat list, Search |
| `nik` | VARCHAR(20) | No | Nomor Induk Kependudukan (UNIQUE) | Jemaat detail, Search |
| `gender` | VARCHAR(10) | No | Jenis kelamin (Pria/Wanita) | Jemaat detail, Filter |
| `tempat_lahir` | VARCHAR(100) | No | Tempat lahir | Jemaat detail |
| `tanggal_lahir` | DATE | No | Tanggal lahir | Jemaat detail, Ulang Tahun |
| `alamat` | TEXT | No | Alamat lengkap | Jemaat detail |
| `no_hp` | VARCHAR(20) | No | Nomor HP/WhatsApp | Jemaat detail, Contact |
| `status_pernikahan` | No | Status pernikahan | Jemaat detail, Filter |
| `status_jemaat` | VARCHAR(50) | No | Status (Aktif/Keluar/Meninggal) | Jemaat list, Filter |
| `kategori_kaum` | VARCHAR(50) | No | Kategori kaum | Jemaat detail, Filter |
| `sektor` | VARCHAR(100) | No | Sektor jemaat | Jemaat detail, Filter |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |
| `anggota_keluarga` | JSONB | No | Data keluarga dalam JSON | Jemaat detail |

#### UI Components & Flow
- **Jemaat Page**: `/admin/jemaat`
  - Table: Shows all jemaat with `status_jemaat = 'Aktif'`
  - Search: Filters by `nama` or `nik`
  - Filter: `kategori_kaum`, `sektor`
  - Button: "Tambah Jemaat" → Opens add form
  - Button: "Edit" → Opens edit form
  - Button: "Hapus" → DELETE request
  - Button: "Export XLS" → Download Excel

- **Jemaat Keluar & Meninggal Page**: `/admin/jemaat-keluar`
  - Table: Shows jemaat with `status_jemaat = 'Keluar' OR 'Meninggal'`
  - Filter: `status` (Semua/Keluar/Meninggal), `wadah`, `rayon`
  - Button: "Edit" → Opens edit form
  - Button: "Hapus" → DELETE request

- **Ulang Tahun Page**: `/admin/ulang-tahun`
  - Table: Shows jemaat sorted by `tanggal_lahir` (current month)
  - Filter: Month selector
  - Display: `nama`, `tanggal_lahir`, `no_hp`

#### API Endpoints
- `GET /api/jemaat` - Get all jemaat
- `GET /api/jemaat/:id` - Get single jemaat
- `POST /api/jemaat` - Create new jemaat
- `PUT /api/jemaat/:id` - Update jemaat
- `DELETE /api/jemaat/:id` - Delete jemaat

---

### 3. Table: `registrations`

**Purpose**: Menyimpan data pendaftaran (jemaat baru atau event).

#### Schema
```sql
CREATE TABLE registrations (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50),
    nama_pendaftar VARCHAR(255),
    nik VARCHAR(20),
    gender VARCHAR(10),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    alamat TEXT,
    no_hp VARCHAR(20),
    lampiran_ktp TEXT,
    lampiran_bukti_bayar TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    status_note TEXT,
    anggota_keluarga JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: REG-XXX) | System |
| `type` | VARCHAR(50) | No | Tipe (jemaat_baru/event) | Approvals page |
| `nama_pendaftar` | VARCHAR(255) | No | Nama pendaftar | Approvals list |
| `nik` | VARCHAR(20) | No | NIK pendaftar | Approvals detail |
| `gender` | VARCHAR(10) | No | Jenis kelamin | Approvals detail |
| `tempat_lahir` | VARCHAR(100) | No | Tempat lahir | Approvals detail |
| `tanggal_lahir` | DATE | No | Tanggal lahir | Approvals detail |
| `alamat` | TEXT | No | Alamat | Approvals detail |
| `no_hp` | VARCHAR(20) | No | Nomor HP | Approvals detail |
| `lampiran_ktp` | TEXT | No | Path file KTP | Approvals detail |
| `lampiran_bukti_bayar` | TEXT | No | Path bukti pembayaran | Approvals detail |
| `status` | VARCHAR(50) | No | Status (Pending/Disetujui/Ditolak) | Approvals filter |
| `status_note` | TEXT | No | Catatan status | Approvals detail |
| `anggota_keluarga` | JSONB | No | Data keluarga | Approvals detail |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Pendaftaran Page (Public)**: `/pendaftaran`
  - Form: Input fields → POST `/api/registrations`
  - Type: `jemaat_baru` or `event`
  - File upload: KTP, Bukti bayar → Saved to `/uploads/`
  - Button: "Kirim Pendaftaran" → Submit form

- **Approvals Page (Admin)**: `/admin/approvals`
  - Table: Shows all registrations with `status = 'Pending'`
  - Filter: `status` (Pending/Disetujui/Ditolak)
  - Button: "Setujui" → PUT `/api/registrations/:id/status` (status: Disetujui)
  - Button: "Tolak" → PUT `/api/registrations/:id/status` (status: Ditolak)
  - Button: "Hapus" → DELETE `/api/registrations/:id` (after approve/reject)
  - Badge: Shows count of pending registrations in sidebar

#### API Endpoints
- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/:id` - Get single registration
- `POST /api/registrations` - Create new registration
- `PUT /api/registrations/:id` - Update registration
- `PUT /api/registrations/:id/status` - Update registration status
- `DELETE /api/registrations/:id` - Delete registration

---

### 4. Table: `schedules`

**Purpose**: Menyimpan jadwal ibadah dan event gereja.

#### Schema
```sql
CREATE TABLE schedules (
    id VARCHAR(50) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    waktu TIME,
    lokasi VARCHAR(255),
    deskripsi TEXT,
    is_registration_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**⚠️ NOTE**: Field tambahan untuk fitur baru (belum ada di production):
- `title` VARCHAR(255) - Judul (alias judul)
- `time` TIME - Waktu (alias waktu)
- `speaker` VARCHAR(255) - Pembicara
- `location` VARCHAR(255) - Lokasi (alias lokasi)
- `category` VARCHAR(50) - Kategori (ibadah/event)
- `description` TEXT - Deskripsi (alias deskripsi)
- `requiresRegistration` BOOLEAN - Butuh registrasi (alias is_registration_required)

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: SCH-XXX) | System |
| `judul` | VARCHAR(255) | Yes | Judul jadwal | Schedule list |
| `tanggal` | DATE | Yes | Tanggal pelaksanaan | Schedule list, Calendar |
| `waktu` | TIME | No | Waktu pelaksanaan | Schedule list |
| `lokasi` | VARCHAR(255) | No | Lokasi pelaksanaan | Schedule detail |
| `deskripsi` | TEXT | No | Deskripsi jadwal | Schedule detail |
| `is_registration_required` | BOOLEAN | No | Apakah butuh registrasi | Schedule detail |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Jadwal Event Page (Public)**: `/jadwal-event`
  - List: Shows all schedules
  - Filter: `category` (ibadah/event)
  - Card: Shows `judul`, `tanggal`, `waktu`, `lokasi`, `deskripsi`
  - Button: "Daftar" → If `is_registration_required = true`

- **CMS Page (Admin)**: `/admin/cms`
  - Tab: "Jadwal"
  - Table: Shows all schedules
  - Button: "Tambah Jadwal" → Opens add form
  - Button: "Edit" → Opens edit form
  - Button: "Hapus" → DELETE request

#### API Endpoints
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get single schedule
- `POST /api/schedules` - Create new schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

---

### 5. Table: `hero_slides`

**Purpose**: Menyimpan data hero slide di halaman depan.

#### Schema
```sql
CREATE TABLE hero_slides (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**⚠️ NOTE**: Field tambahan untuk fitur baru (belum ada di production):
- `subtitle` TEXT - Subtitle slide
- `badge` VARCHAR(100) - Badge text
- `ctaText` VARCHAR(100) - Call-to-action text
- `ctaLink` TEXT - Call-to-action link
- `ctaType` VARCHAR(50) - Call-to-action type (schedule/event/warta/prayer)

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: HSL-XXX) | System |
| `title` | VARCHAR(255) | No | Judul slide | Hero section |
| `image_url` | TEXT | No | URL gambar slide | Hero section |
| `link_url` | TEXT | No | URL link tombol | Hero section |
| `is_active` | BOOLEAN | No | Status aktif/tidak | Hero section |
| `order_index` | INTEGER | No | Urutan tampilan | Hero section |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Home Page (Public)**: `/`
  - Hero Section: Carousel of slides
  - Auto-rotate every 5 seconds
  - Navigation arrows and dots
  - Button: CTA button → Navigate based on `ctaType`

- **CMS Page (Admin)**: `/admin/cms`
  - Tab: "Hero Slides"
  - Table: Shows all slides
  - Button: "Tambah Slide" → Opens add form
  - Button: "Edit" → Opens edit form
  - Toggle: `is_active` → Enable/disable slide
  - Input: `order_index` → Reorder slides

#### API Endpoints
- `GET /api/hero-slides` - Get all hero slides
- `GET /api/hero-slides/:id` - Get single hero slide
- `POST /api/hero-slides` - Create new hero slide
- `PUT /api/hero-slides/:id` - Update hero slide
- `DELETE /api/hero-slides/:id` - Delete hero slide

---

### 6. Table: `announcements`

**Purpose**: Menyimpan pengumuman gereja.

#### Schema
```sql
CREATE TABLE announcements (
    id VARCHAR(50) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    konten TEXT,
    tanggal DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**⚠️ NOTE**: Field tambahan untuk fitur baru (belum ada di production):
- `title` VARCHAR(255) - Judul (alias judul)
- `content` TEXT - Konten (alias konten)
- `date` DATE - Tanggal (alias tanggal)
- `isImportant` BOOLEAN - Penting atau tidak (alias is_active)

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: ANN-XXX) | System |
| `judul` | VARCHAR(255) | Yes | Judul pengumuman | Announcement list |
| `konten` | TEXT | No | Isi pengumuman | Announcement detail |
| `tanggal` | DATE | No | Tanggal pengumuman | Announcement list |
| `is_active` | BOOLEAN | No | Status aktif/tidak | Announcement list |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Home Page (Public)**: `/`
  - Section: "Pengumuman"
  - Card: Shows `judul`, `konten`, `tanggal`
  - Badge: If `is_active = true`, show as important

- **CMS Page (Admin)**: `/admin/cms`
  - Tab: "Pengumuman"
  - Table: Shows all announcements
  - Button: "Tambah Pengumuman" → Opens add form
  - Button: "Edit" → Opens edit form
  - Button: "Hapus" → DELETE request
  - Toggle: `is_active` → Show/hide from public

#### API Endpoints
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get single announcement
- `POST /api/announcements` - Create new announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

---

### 7. Table: `warta_jemaat`

**Purpose**: Menyimpan warta jemaat (buletin gereja).

#### Schema
```sql
CREATE TABLE warta_jemaat (
    id VARCHAR(50) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    tanggal DATE,
    pdf_url TEXT,
    petugas_list JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**⚠️ NOTE**: Field tambahan untuk fitur baru (belum ada di production):
- `edisi` VARCHAR(100) - Edisi warta (alias judul)
- `temaMinggu` VARCHAR(255) - Tema minggu
- `ayatMinggu` TEXT - Ayat minggu
- `pengumuman` TEXT - Pengumuman (alias konten)

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: WRT-XXX) | System |
| `judul` | VARCHAR(255) | Yes | Judul/Edisi warta | Warta list |
| `tanggal` | DATE | No | Tanggal warta | Warta list |
| `pdf_url` | TEXT | No | URL file PDF | Download button |
| `petugas_list` | JSONB | No | Daftar petugas pelayanan | Warta detail |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Warta Jemaat Page (Public)**: `/warta`
  - List: Shows all warta
  - Search: Filters by `judul` or `temaMinggu`
  - Card: Shows `edisi`, `tanggal`, `temaMinggu`, `ayatMinggu`, `pengumuman`
  - Button: "Unduh PDF" → Download PDF file
  - Button: "Baca Selengkapnya" → Expand card
  - Expanded: Shows PDF preview and `petugas_list`

- **CMS Page (Admin)**: `/admin/cms`
  - Tab: "Warta Jemaat"
  - Table: Shows all warta
  - Button: "Tambah Warta" → Opens add form
  - Button: "Edit" → Opens edit form
  - Button: "Hapus" → DELETE request
  - File upload: PDF → Saved to `/uploads/`

#### API Endpoints
- `GET /api/warta-jemaat` - Get all warta jemaat
- `GET /api/warta-jemaat/:id` - Get single warta jemaat
- `POST /api/warta-jemaat` - Create new warta jemaat
- `PUT /api/warta-jemaat/:id` - Update warta jemaat
- `DELETE /api/warta-jemaat/:id` - Delete warta jemaat

---

### 8. Table: `knowledge_base`

**Purpose**: Menyimpan knowledge base untuk AI chatbot.

#### Schema
```sql
CREATE TABLE knowledge_base (
    id VARCHAR(50) PRIMARY KEY,
    patterns TEXT[] NOT NULL,
    bot_response TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**⚠️ NOTE**: Field tambahan untuk fitur baru (belum ada di production):
- `category` VARCHAR(100) - Kategori topik
- `intent` VARCHAR(100) - Intent untuk NLP
- `isActive` BOOLEAN - Status aktif (alias is_active)
- `lastUpdated` TIMESTAMP - Terakhir diupdate (alias created_at)

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: KB-XXX) | System |
| `patterns` | TEXT[] | Yes | Array pattern pertanyaan | Chatbot matching |
| `bot_response` | TEXT | Yes | Respon bot | Chatbot response |
| `is_active` | BOOLEAN | No | Status aktif/tidak | Knowledge base list |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Chatbot (Public)**: Floating chat widget
  - Input: User question → Match against `patterns`
  - Output: `bot_response` from matched pattern
  - Flow: User types → API searches `knowledge_base` → Returns response

- **Knowledge Base Page (Admin)**: `/admin/kb`
  - Table: Shows all knowledge base entries
  - Button: "Tambah Topik" → Opens add form
  - Button: "Edit" → Opens edit form (inline edit)
  - Button: "Hapus" → DELETE request
  - Input: `patterns` (comma-separated)
  - Input: `bot_response`
  - Toggle: `is_active` → Enable/disable

#### API Endpoints
- `GET /api/knowledge-base` - Get all knowledge base
- `GET /api/knowledge-base/:id` - Get single knowledge base entry
- `POST /api/knowledge-base` - Create new knowledge base entry
- `PUT /api/knowledge-base/:id` - Update knowledge base entry
- `DELETE /api/knowledge-base/:id` - Delete knowledge base entry
- `POST /api/chatbot` - Chatbot query endpoint

---

### 9. Table: `prayer_requests`

**Purpose**: Menyimpan permohonan doa dari jemaat.

#### Schema
```sql
CREATE TABLE prayer_requests (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(255),
    no_hp VARCHAR(20),
    permohonan TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**⚠️ NOTE**: Field tambahan untuk fitur baru (belum ada di production):
- `isiDoa` TEXT - Isi doa (alias permohonan)
- `privasi` VARCHAR(50) - Privasi (Publik/Rahasia Tim Doa)
- `tanggal` TIMESTAMP - Tanggal permohonan (alias created_at)
- `kategori` VARCHAR(50) - Kategori doa (Kesehatan/Pekerjaan dll)
- `status` VARCHAR(50) - Status (Baru/Didoakan) (alias Pending/Didoakan)

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: PRY-XXX) | System |
| `nama` | VARCHAR(255) | No | Nama pemohon | Prayer list |
| `no_hp` | VARCHAR(20) | No | Nomor HP | Prayer detail |
| `permohonan` | TEXT | Yes | Isi permohonan doa | Prayer detail |
| `status` | VARCHAR(50) | No | Status (Baru/Didoakan) | Prayer filter |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Layanan Page (Public)**: `/layanan`
  - Form: Permohonan Doa
  - Input: `nama`, `no_hp`, `permohonan`
  - Select: `privasi` (Publik/Rahasia Tim Doa)
  - Select: `kategori` (Kesehatan/Pekerjaan dll)
  - Button: "Kirim Permohonan" → POST `/api/prayers`

- **Prayers Page (Admin)**: `/admin/prayers`
  - Table: Shows all prayer requests
  - Filter: `status` (Baru/Didoakan), `kategori`
  - Button: "Doakan" → PUT `/api/prayers/:id/status` (status: Didoakan)
  - Button: "Hapus" → DELETE `/api/prayers/:id` (after Didoakan)
  - Display: If `privasi = 'Publik'`, show `nama` and `no_hp`

#### API Endpoints
- `GET /api/prayers` - Get all prayer requests
- `GET /api/prayers/:id` - Get single prayer request
- `POST /api/prayers` - Create new prayer request
- `PUT /api/prayers/:id` - Update prayer request
- `PUT /api/prayers/:id/status` - Update prayer status
- `DELETE /api/prayers/:id` - Delete prayer request

---

### 10. Table: `certificates`

**Purpose**: Menyimpan data sertifikat (Baptisan Air, Sidi, dll).

#### Schema
```sql
CREATE TABLE certificates (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    jemaat_id VARCHAR(50),
    jenis_dokumen VARCHAR(100),
    tanggal_terbit DATE,
    pendeta VARCHAR(255),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Field Details
| Field | Type | Required | Description | Used By |
|-------|------|----------|-------------|---------|
| `id` | VARCHAR(50) | Yes | Primary key (format: CRT-XXX) | System |
| `code` | VARCHAR(100) | Yes | Kode sertifikat (UNIQUE) | Validation |
| `jemaat_id` | VARCHAR(50) | No | Foreign key ke jemaat | Certificate detail |
| `jenis_dokumen` | VARCHAR(100) | No | Jenis dokumen | Certificate detail |
| `tanggal_terbit` | DATE | No | Tanggal terbit | Certificate detail |
| `pendeta` | VARCHAR(255) | No | Nama pendeta | Certificate detail |
| `is_valid` | BOOLEAN | No | Status valid/tidak | Validation |
| `created_at` | TIMESTAMP | No | Timestamp pembuatan | System |

#### UI Components & Flow
- **Certificate Validation (Public)**: `/validate-certificate`
  - Input: `code` → Search in `certificates`
  - Button: "Validasi" → GET `/api/certificates/validate/:code`
  - Display: If valid, show certificate details

- **CMS Page (Admin)**: `/admin/cms`
  - Tab: "Sertifikat"
  - Table: Shows all certificates
  - Button: "Tambah Sertifikat" → Opens add form
  - Button: "Edit" → Opens edit form
  - Button: "Hapus" → DELETE request
  - Toggle: `is_valid` → Invalidate certificate

#### API Endpoints
- `GET /api/certificates` - Get all certificates
- `GET /api/certificates/:id` - Get single certificate
- `GET /api/certificates/validate/:code` - Validate certificate by code
- `POST /api/certificates` - Create new certificate
- `PUT /api/certificates/:id` - Update certificate
- `DELETE /api/certificates/:id` - Delete certificate

---

## 🔗 Table Relationships

### Foreign Keys (Logical)
- `certificates.jemaat_id` → `jemaat.id` (Certificate belongs to Jemaat)

### JSONB Fields
- `jemaat.anggota_keluarga` - Family members data
- `registrations.anggota_keluarga` - Family members data
- `warta_jemaat.petugas_list` - Service team members

---

## 📁 File Upload Paths

All uploaded files are stored in `/uploads/` directory:

| Field | File Type | Path Pattern |
|-------|-----------|--------------|
| `registrations.lampiran_ktp` | Image/PDF | `/uploads/ktp/{id}.ext` |
| `registrations.lampiran_bukti_bayar` | Image/PDF | `/uploads/bukti-bayar/{id}.ext` |
| `warta_jemaat.pdf_url` | PDF | `/uploads/warta/{id}.pdf` |
| `hero_slides.image_url` | Image | `/uploads/hero/{id}.ext` |

---

## 🔄 Data Flow Diagrams

### Login Flow
```
User → Login Form → POST /api/auth/login
                    ↓
            Check admin_users table
                    ↓
            Validate password_hash
                    ↓
            Return JWT token
                    ↓
            Store in localStorage
                    ↓
            Redirect to /admin
```

### Registration Flow
```
User → Pendaftaran Form → POST /api/registrations
                        ↓
                Save to registrations table
                        ↓
                Status = 'Pending'
                        ↓
                Admin sees in Approvals page
                        ↓
        Admin clicks "Setujui" → PUT /api/registrations/:id/status
                        ↓
                Status = 'Disetujui'
                        ↓
                (Optional) Create jemaat record
```

### Prayer Request Flow
```
User → Permohonan Doa Form → POST /api/prayers
                          ↓
                  Save to prayer_requests table
                          ↓
                  Status = 'Baru'
                          ↓
                  Admin sees in Prayers page
                          ↓
          Admin clicks "Doakan" → PUT /api/prayers/:id/status
                          ↓
                  Status = 'Didoakan'
                          ↓
          Admin can delete → DELETE /api/prayers/:id
```

---

## 🚨 Migration Requirements

### Fields to Add to Production Database

#### Table: `jemaat`
```sql
ALTER TABLE jemaat ADD COLUMN wadah VARCHAR(100);
ALTER TABLE jemaat ADD COLUMN rayon VARCHAR(100);
ALTER TABLE jemaat ADD COLUMN no_telepon VARCHAR(20);
```

#### Table: `warta_jemaat`
```sql
ALTER TABLE warta_jemaat RENAME COLUMN judul TO edisi;
ALTER TABLE warta_jemaat ADD COLUMN temaMinggu VARCHAR(255);
ALTER TABLE warta_jemaat ADD COLUMN ayatMinggu TEXT;
ALTER TABLE warta_jemaat ADD COLUMN pengumuman TEXT;
```

#### Table: `hero_slides`
```sql
ALTER TABLE hero_slides ADD COLUMN subtitle TEXT;
ALTER TABLE hero_slides ADD COLUMN badge VARCHAR(100);
ALTER TABLE hero_slides ADD COLUMN ctaText VARCHAR(100);
ALTER TABLE hero_slides ADD COLUMN ctaLink TEXT;
ALTER TABLE hero_slides ADD COLUMN ctaType VARCHAR(50);
```

#### Table: `schedules`
```sql
ALTER TABLE schedules ADD COLUMN title VARCHAR(255);
ALTER TABLE schedules ADD COLUMN time TIME;
ALTER TABLE schedules ADD COLUMN speaker VARCHAR(255);
ALTER TABLE schedules ADD COLUMN location VARCHAR(255);
ALTER TABLE schedules ADD COLUMN category VARCHAR(50);
ALTER TABLE schedules ADD COLUMN description TEXT;
ALTER TABLE schedules ADD COLUMN requiresRegistration BOOLEAN;
```

#### Table: `announcements`
```sql
ALTER TABLE announcements RENAME COLUMN judul TO title;
ALTER TABLE announcements RENAME COLUMN konten TO content;
ALTER TABLE announcements RENAME COLUMN tanggal TO date;
ALTER TABLE announcements ADD COLUMN isImportant BOOLEAN;
```

#### Table: `prayer_requests`
```sql
ALTER TABLE prayer_requests RENAME COLUMN permohonan TO isiDoa;
ALTER TABLE prayer_requests ADD COLUMN privasi VARCHAR(50);
ALTER TABLE prayer_requests ADD COLUMN tanggal TIMESTAMP;
ALTER TABLE prayer_requests ADD COLUMN kategori VARCHAR(50);
ALTER TABLE prayer_requests ALTER COLUMN status SET DEFAULT 'Baru';
```

#### Table: `knowledge_base`
```sql
ALTER TABLE knowledge_base ADD COLUMN category VARCHAR(100);
ALTER TABLE knowledge_base ADD COLUMN intent VARCHAR(100);
ALTER TABLE knowledge_base RENAME COLUMN is_active TO isActive;
ALTER TABLE knowledge_base ADD COLUMN lastUpdated TIMESTAMP;
```

---

## 📊 Summary

| Table | Purpose | Records (Est) | Admin Page | Public Page |
|-------|---------|---------------|------------|-------------|
| `admin_users` | Admin authentication | 5-10 | Login | - |
| `jemaat` | Jemaat data | 100-500 | Jemaat, Ulang Tahun | - |
| `registrations` | Registration requests | 50-200 | Approvals | Pendaftaran |
| `schedules` | Church schedules | 50-100 | CMS (Jadwal) | Jadwal Event |
| `hero_slides` | Hero carousel | 3-5 | CMS (Hero) | Home |
| `announcements` | Church announcements | 20-50 | CMS (Pengumuman) | Home |
| `warta_jemaat` | Church bulletin | 12-24/year | CMS (Warta) | Warta |
| `knowledge_base` | Chatbot KB | 50-100 | Knowledge Base | Chatbot |
| `prayer_requests` | Prayer requests | 100-500 | Prayers | Layanan |
| `certificates` | Certificates | 200-1000 | CMS (Sertifikat) | Validation |

---

## 🔐 Security Considerations

1. **Password Hashing**: All passwords stored as bcrypt hash in `admin_users.password_hash`
2. **JWT Authentication**: Admin routes protected by JWT token
3. **SQL Injection Prevention**: Use parameterized queries
4. **File Upload Validation**: Validate file types and sizes before upload
5. **Sensitive Data**: NIK, phone numbers stored as plain text (consider encryption for production)

---

## 📝 Notes

- All tables use `VARCHAR(50)` for primary keys with format: `TABLE_PREFIX-XXX`
- Timestamp fields use `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- JSONB fields used for flexible data structures (family members, service team)
- File uploads stored in `/uploads/` directory with proper permissions
- Database connection via environment variable `DATABASE_URL`
- In-memory fallback used when PostgreSQL is not available (development only)

---

**Last Updated**: August 3, 2026  
**Version**: 1.0  
**Status**: Production (Digital Ocean VPS)
