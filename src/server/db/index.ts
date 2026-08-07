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
    this.seedDefaultKnowledgeBase();
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
