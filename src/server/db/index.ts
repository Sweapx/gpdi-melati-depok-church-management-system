import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { Pool } from 'pg';
import { 
  AdminUser, AnnouncementItem, CertificateDoc, HeroSlide, 
  Jemaat, KnowledgeBaseQA, PrayerRequest, RegistrationItem, 
  ScheduleItem, WartaItem 
} from "../../types/index.ts";

dotenv.config();

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

  constructor() {
    // Don't call async seed in constructor
    this.seedDefaultAdmin();
  }

  seedDefaultAdmin() {
    // Seed admin user only - required for login functionality
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
