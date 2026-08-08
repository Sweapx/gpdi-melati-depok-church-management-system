import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { Pool } from 'pg';
import { 
  AdminUser, AnnouncementItem, CertificateDoc, HeroSlide, 
  Jemaat, KnowledgeBaseQA, PrayerRequest, RegistrationItem, 
  ScheduleItem, WartaItem 
} from "../../types/index.ts";

dotenv.config();

import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'data', 'local_db_store.json');

export function saveInMemoryDBToDisk(store: any = inMemoryDB) {
  try {
    const dir = path.dirname(STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const dataToSave = {
      wadah: store.wadah || [],
      rayon: store.rayon || [],
      jemaat: store.jemaat || [],
      adminUsers: store.adminUsers || [],
      schedules: store.schedules || [],
      announcements: store.announcements || [],
      heroSlides: store.heroSlides || [],
      prayerRequests: store.prayerRequests || [],
      registrations: store.registrations || [],
      wartaJemaat: store.wartaJemaat || [],
      knowledgeBase: store.knowledgeBase || []
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error saving store to disk:", err);
  }
}

export function loadInMemoryDBFromDisk(store: any) {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data) {
        if (Array.isArray(data.wadah) && data.wadah.length > 0) store.wadah = data.wadah;
        if (Array.isArray(data.rayon) && data.rayon.length > 0) store.rayon = data.rayon;
        if (Array.isArray(data.jemaat) && data.jemaat.length > 0) store.jemaat = data.jemaat;
        if (Array.isArray(data.schedules) && data.schedules.length > 0) store.schedules = data.schedules;
        if (Array.isArray(data.announcements) && data.announcements.length > 0) store.announcements = data.announcements;
        if (Array.isArray(data.heroSlides) && data.heroSlides.length > 0) store.heroSlides = data.heroSlides;
        if (Array.isArray(data.knowledgeBase) && data.knowledgeBase.length > 0) store.knowledgeBase = data.knowledgeBase;
      }
    }
  } catch (err) {
    console.error("Error loading store from disk:", err);
  }
}

// In-Memory Storage Fallback
class InMemoryStore {
  adminUsers: AdminUser[] = [];
  announcements: AnnouncementItem[] = [];
  certificates: CertificateDoc[] = [];
  certificateRequests: any[] = [];
  heroSlides: HeroSlide[] = [];
  jemaat: Jemaat[] = [];
  knowledgeBase: KnowledgeBaseQA[] = [];
  prayerRequests: PrayerRequest[] = [];
  registrations: RegistrationItem[] = [];
  schedules: ScheduleItem[] = [];
  wartaJemaat: WartaItem[] = [];
  wadah: any[] = [];
  rayon: any[] = [];

  constructor() {
    this.seedDefaultAdmin();
    loadInMemoryDBFromDisk(this);
    this.seedDefaultWadah();
    this.seedDefaultRayon();
    this.seedDefaultJemaat();
    this.seedDefaultKnowledgeBase();
    this.seedDefaultSchedules();
  }

  seedDefaultAdmin() {
    if (this.adminUsers.length === 0) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      this.adminUsers.push({
        id: 'admin-1',
        username: 'admin',
        passwordHash: passwordHash,
        name: 'Super Admin',
        role: 'admin',
        mustChangePassword: false,
        createdAt: new Date().toISOString()
      } as any);
    }
  }

  seedDefaultWadah() {
    if (this.wadah.length === 0) {
      this.wadah = [
        { id: 'WAD-001', nama_wadah: 'Kaum Muda', namaWadah: 'Kaum Muda', ketua_wadah: 'Joyhill Abineno', ketuaWadah: 'Joyhill Abineno', umur_minimal: 21, umurMinimal: 21, umur_maksimal: 30, umurMaksimal: 30, jumlah_anggota: 64, jumlahAnggota: 64 },
        { id: 'WAD-002', nama_wadah: 'Kaum Pria', namaWadah: 'Kaum Pria', ketua_wadah: 'Mardongan Simanjuntak', ketuaWadah: 'Mardongan Simanjuntak', umur_minimal: 31, umurMinimal: 31, umur_maksimal: 100, umurMaksimal: 100, jumlah_anggota: 80, jumlahAnggota: 80 },
        { id: 'WAD-003', nama_wadah: 'Kaum Remaja', namaWadah: 'Kaum Remaja', ketua_wadah: 'Chloe Davincia Michelle', ketuaWadah: 'Chloe Davincia Michelle', umur_minimal: 14, umurMinimal: 14, umur_maksimal: 20, umurMaksimal: 20, jumlah_anggota: 23, jumlahAnggota: 23 },
        { id: 'WAD-004', nama_wadah: 'Kaum Wanita', namaWadah: 'Kaum Wanita', ketua_wadah: 'Ester Wuarlela', ketuaWadah: 'Ester Wuarlela', umur_minimal: 31, umurMinimal: 31, umur_maksimal: 100, umurMaksimal: 100, jumlah_anggota: 136, jumlahAnggota: 136 },
        { id: 'WAD-005', nama_wadah: 'Sekolah Minggu', namaWadah: 'Sekolah Minggu', ketua_wadah: 'Seresy Matius', ketuaWadah: 'Seresy Matius', umur_minimal: 1, umurMinimal: 1, umur_maksimal: 13, umurMaksimal: 13, jumlah_anggota: 68, jumlahAnggota: 68 }
      ];
      saveInMemoryDBToDisk(this);
    }
  }

  seedDefaultRayon() {
    if (this.rayon.length === 0) {
      this.rayon = [
        { id: 'RAY-001', nama_rayon: 'Rayon 1', namaRayon: 'Rayon 1', ketua_rayon: 'Suci Br Kembaren', ketuaRayon: 'Suci Br Kembaren', jumlah_anggota: 78, jumlahAnggota: 78 },
        { id: 'RAY-002', nama_rayon: 'Rayon 2', namaRayon: 'Rayon 2', ketua_rayon: 'Tarningsih', ketuaRayon: 'Tarningsih', jumlah_anggota: 83, jumlahAnggota: 83 },
        { id: 'RAY-003', nama_rayon: 'Rayon 3', namaRayon: 'Rayon 3', ketua_rayon: 'Harliarso', ketuaRayon: 'Harliarso', jumlah_anggota: 123, jumlahAnggota: 123 },
        { id: 'RAY-004', nama_rayon: 'Rayon 4', namaRayon: 'Rayon 4', ketua_rayon: 'Mega Sihombing', ketuaRayon: 'Mega Sihombing', jumlah_anggota: 87, jumlahAnggota: 87 }
      ];
      saveInMemoryDBToDisk(this);
    }
  }

  seedDefaultJemaat() {
    if (this.jemaat.length === 0) {
      try {
        const parsedPath = path.resolve(process.cwd(), './data_jemaat_parsed.json');
        if (fs.existsSync(parsedPath)) {
          const parsedData = JSON.parse(fs.readFileSync(parsedPath, 'utf-8'));
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            this.jemaat = parsedData.map((item: any) => ({
              ...item,
              tempatLahir: item.tempat_lahir || item.tempatLahir || '',
              tanggalLahir: item.tanggal_lahir || item.tanggalLahir || '',
              noHp: item.no_hp || item.noHp || '',
              statusPernikahan: item.status_pernikahan || item.statusPernikahan || '',
              statusJemaat: item.status_jemaat || item.statusJemaat || 'Aktif',
              kategoriKaum: item.kategori_kaum || item.kategoriKaum || '',
              noTelepon: item.no_telepon || item.noTelepon || '',
              anggotaKeluarga: item.anggota_keluarga || item.anggotaKeluarga || []
            }));
            saveInMemoryDBToDisk(this);
          }
        }
      } catch (err) {
        console.error("Error seeding default jemaat from JSON:", err);
      }
    }
  }

  seedDefaultSchedules() {
    if (this.schedules.length === 0) {
      this.schedules = [
        {
          id: "SCH-001",
          judul: "Ibadah Raya I",
          tanggal: new Date().toISOString().split('T')[0],
          waktu: "07:00",
          lokasi: "Gedung Utama GPdI Melati Depok",
          deskripsi: "Ibadah Minggu Sesi Pertama",
          isRegistrationRequired: false,
          is_registration_required: false,
          hariJam: "Minggu, 07:00 WIB",
          hari_jam: "Minggu, 07:00 WIB",
          kategori: "Ibadah Raya",
          kuota: 200,
          terdaftar: 0,
          registrationFee: "Gratis",
          registration_fee: "Gratis",
          needPaymentProof: false,
          need_payment_proof: false,
          createdAt: new Date().toISOString()
        },
        {
          id: "SCH-002",
          judul: "Ibadah Raya II",
          tanggal: new Date().toISOString().split('T')[0],
          waktu: "10:00",
          lokasi: "Gedung Utama GPdI Melati Depok",
          deskripsi: "Ibadah Minggu Sesi Kedua & Sekolah Minggu",
          isRegistrationRequired: false,
          is_registration_required: false,
          hariJam: "Minggu, 10:00 WIB",
          hari_jam: "Minggu, 10:00 WIB",
          kategori: "Ibadah Raya",
          kuota: 200,
          terdaftar: 0,
          registrationFee: "Gratis",
          registration_fee: "Gratis",
          needPaymentProof: false,
          need_payment_proof: false,
          createdAt: new Date().toISOString()
        }
      ] as any;
      saveInMemoryDBToDisk(this);
    }
  }

  seedDefaultKnowledgeBase() {
    if (this.knowledgeBase.length === 0) {
      this.knowledgeBase = [
        {
          id: "KB-1",
          category: "Jadwal Ibadah",
          intent: "general",
          patterns: ["jadwal ibadah", "jam berapa ibadah", "kapan ibadah minggu", "jadwal"],
          botResponse: "Ibadah Raya GPdI Melati Depok dilaksanakan setiap hari Minggu: Ibadah I pukul 07.00 WIB dan Ibadah II pukul 10.00 WIB.",
          isActive: true,
          lastUpdated: new Date().toISOString()
        },
        {
          id: "KB-2",
          category: "Kontak & Alamat",
          intent: "general",
          patterns: ["alamat gereja", "lokasi gereja", "no telepon gereja", "kontak", "alamat"],
          botResponse: "📍 GPdI Melati Depok beralamat di Jl. Melati No. 8, Depok, Jawa Barat. 📞 Telepon/WA: (021) 7521216. Sekretariat buka Selasa - Minggu (08.00 - 17.00 WIB).",
          isActive: true,
          lastUpdated: new Date().toISOString()
        },
        {
          id: "KB-3",
          category: "Layanan",
          intent: "general",
          patterns: ["baptisan", "baptis air", "daftar baptis", "syarat baptis"],
          botResponse: "Pendaftaran Baptisan Air dapat dilakukan secara online melalui menu Layanan -> Baptisan di website ini. Siapkan foto dan data diri Anda.",
          isActive: true,
          lastUpdated: new Date().toISOString()
        },
        {
          id: "KB-4",
          category: "Layanan",
          intent: "general",
          patterns: ["permohonan doa", "minta doa", "titip doa", "doa"],
          botResponse: "Anda dapat mengirimkan Permohonan Doa melalui menu Layanan -> Permohonan Doa di website ini. Tim pendoa kami siap mendoakan pergumulan Anda.",
          isActive: true,
          lastUpdated: new Date().toISOString()
        }
      ];
      saveInMemoryDBToDisk(this);
    }
  }
}

export const inMemoryDB = new InMemoryStore();
export const usePostgres = !!process.env.DATABASE_URL;

export const pool = usePostgres ? new Pool({
  connectionString: process.env.DATABASE_URL,
}) : null;

async function initDb() {
  if (!pool) return;
  try {
    console.log("Using PostgreSQL Database - Initializing schema if needed...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wadah (
        id VARCHAR(50) PRIMARY KEY,
        nama_wadah VARCHAR(255) NOT NULL,
        ketua_wadah VARCHAR(255) NOT NULL,
        umur_minimal INTEGER NOT NULL DEFAULT 0,
        umur_maksimal INTEGER NOT NULL DEFAULT 0,
        jumlah_anggota INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rayon (
        id VARCHAR(50) PRIMARY KEY,
        nama_rayon VARCHAR(255) NOT NULL,
        ketua_rayon VARCHAR(255) NOT NULL,
        jumlah_anggota INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jemaat (
        id VARCHAR(50) PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        nik VARCHAR(50),
        gender VARCHAR(20),
        tempat_lahir VARCHAR(100),
        tanggal_lahir DATE,
        alamat TEXT,
        no_hp VARCHAR(50),
        status_pernikahan VARCHAR(50),
        status_jemaat VARCHAR(50) DEFAULT 'Aktif',
        kategori_kaum VARCHAR(50),
        sektor VARCHAR(50),
        wadah VARCHAR(100),
        rayon VARCHAR(100),
        no_telepon VARCHAR(50),
        anggota_keluarga JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id VARCHAR(50) PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        tanggal DATE NOT NULL,
        waktu TIME,
        lokasi VARCHAR(255),
        deskripsi TEXT,
        is_registration_required BOOLEAN DEFAULT false,
        hari_jam VARCHAR(100),
        kategori VARCHAR(100),
        kuota INTEGER DEFAULT 0,
        terdaftar INTEGER DEFAULT 0,
        registration_fee VARCHAR(50),
        need_payment_proof BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(50) PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        konten TEXT,
        tanggal DATE,
        is_active BOOLEAN DEFAULT true,
        ringkasan TEXT,
        isi TEXT,
        penting BOOLEAN DEFAULT false,
        gambar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hero_slides (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url TEXT,
        link_url TEXT,
        is_active BOOLEAN DEFAULT true,
        order_index INTEGER DEFAULT 0,
        subtitle TEXT,
        badge VARCHAR(100),
        cta_text VARCHAR(100),
        cta_type VARCHAR(50),
        event_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS warta_jemaat (
        id VARCHAR(50) PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        tanggal DATE,
        pdf_url TEXT,
        petugas_list JSONB,
        edisi VARCHAR(100),
        tema_minggu VARCHAR(255),
        ayat_minggu VARCHAR(255),
        pengumuman TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        nama_pendaftar VARCHAR(255),
        nik VARCHAR(50),
        gender VARCHAR(20),
        tempat_lahir VARCHAR(100),
        tanggal_lahir DATE,
        alamat TEXT,
        no_hp VARCHAR(50),
        lampiran_ktp TEXT,
        lampiran_bukti_bayar TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        status_note TEXT,
        anggota_keluarga JSONB,
        rayon VARCHAR(100),
        jenis_kegiatan VARCHAR(255),
        tanggal_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS knowledge_base (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(100),
        intent VARCHAR(100),
        patterns JSONB,
        bot_response TEXT,
        is_active BOOLEAN DEFAULT true,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO wadah (id, nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota)
      VALUES 
        ('WAD-001', 'Kaum Muda', 'Joyhill Abineno', 21, 30, 64),
        ('WAD-002', 'Kaum Pria', 'Mardongan Simanjuntak', 31, 100, 80),
        ('WAD-003', 'Kaum Remaja', 'Chloe Davincia Michelle', 14, 20, 23),
        ('WAD-004', 'Kaum Wanita', 'Ester Wuarlela', 31, 100, 136),
        ('WAD-005', 'Sekolah Minggu', 'Seresy Matius', 1, 13, 68)
      ON CONFLICT (id) DO UPDATE SET
        nama_wadah = EXCLUDED.nama_wadah,
        ketua_wadah = EXCLUDED.ketua_wadah,
        umur_minimal = EXCLUDED.umur_minimal,
        umur_maksimal = EXCLUDED.umur_maksimal,
        jumlah_anggota = EXCLUDED.jumlah_anggota;

      INSERT INTO rayon (id, nama_rayon, ketua_rayon, jumlah_anggota)
      VALUES 
        ('RAY-001', 'Rayon 1', 'Suci Br Kembaren', 78),
        ('RAY-002', 'Rayon 2', 'Tarningsih', 83),
        ('RAY-003', 'Rayon 3', 'Harliarso', 123),
        ('RAY-004', 'Rayon 4', 'Mega Sihombing', 87)
      ON CONFLICT (id) DO UPDATE SET
        nama_rayon = EXCLUDED.nama_rayon,
        ketua_rayon = EXCLUDED.ketua_rayon,
        jumlah_anggota = EXCLUDED.jumlah_anggota;
    `);
    console.log("PostgreSQL Database Schema Check/Initialization Complete.");
  } catch (err) {
    console.error("Error initializing PostgreSQL schema:", err);
  }
}

if (pool) {
  initDb();
} else {
  console.log("Using In-Memory Database Fallback");
}
