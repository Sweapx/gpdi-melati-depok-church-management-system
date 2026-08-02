import { InMemoryStore } from './types.ts';
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
    // Seed admin user
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

    // Seed jemaat data
    if (this.jemaat.length === 0) {
      this.jemaat.push(
        {
          id: 'JEM-1',
          nama: 'Budi Santoso',
          nik: '3201010101010001',
          gender: 'Pria',
          tempatLahir: 'Jakarta',
          tanggalLahir: '1990-05-15',
          alamat: 'Jl. Merdeka No. 10, Depok',
          noHp: '081234567890',
          statusPernikahan: 'Belum Menikah',
          statusJemaat: 'Aktif',
          kategoriKaum: 'Umum',
          sektor: 'Sektor 1',
          wadah: 'Wadah Muda Mudi',
          rayon: 'Rayon Depok Timur',
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'JEM-2',
          nama: 'Siti Rahayu',
          nik: '3201010101010002',
          gender: 'Wanita',
          tempatLahir: 'Bandung',
          tanggalLahir: '1992-08-20',
          alamat: 'Jl. Sudirman No. 25, Depok',
          noHp: '081234567891',
          statusPernikahan: 'Menikah',
          statusJemaat: 'Aktif',
          kategoriKaum: 'Perempuan',
          sektor: 'Sektor 2',
          wadah: 'Wadah Wanita',
          rayon: 'Rayon Depok Barat',
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'JEM-3',
          nama: 'Agus Pratama',
          nik: '3201010101010003',
          gender: 'Pria',
          tempatLahir: 'Surabaya',
          tanggalLahir: '1988-03-10',
          alamat: 'Jl. Gatot Subroto No. 15, Depok',
          noHp: '081234567892',
          statusPernikahan: 'Menikah',
          statusJemaat: 'Keluar',
          kategoriKaum: 'Pria',
          sektor: 'Sektor 1',
          wadah: 'Wadah Dewasa',
          rayon: 'Rayon Depok Selatan',
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'JEM-4',
          nama: 'Dewi Sartika',
          nik: '3201010101010004',
          gender: 'Wanita',
          tempatLahir: 'Yogyakarta',
          tanggalLahir: '1985-12-25',
          alamat: 'Jl. Diponegoro No. 30, Depok',
          noHp: '081234567893',
          statusPernikahan: 'Janda',
          statusJemaat: 'Meninggal',
          kategoriKaum: 'Perempuan',
          sektor: 'Sektor 2',
          wadah: 'Wadah Dewasa',
          rayon: 'Rayon Depok Timur',
          createdAt: new Date().toISOString()
        } as any
      );
    }

    // Seed schedules
    if (this.schedules.length === 0) {
      this.schedules.push(
        {
          id: 'SCH-1',
          judul: 'Ibadah Raya Minggu',
          hariJam: 'Minggu, 09:00 WIB',
          kategori: 'Ibadah Raya',
          deskripsi: 'Ibadah raya minggu reguler untuk seluruh jemaat',
          isRegistrationRequired: false,
          kuota: 0,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-2',
          judul: 'Ibadah Doa Malam',
          hariJam: 'Kamis, 19:00 WIB',
          kategori: 'Ibadah Doa',
          deskripsi: 'Waktu doa bersama untuk kebutuhan jemaat',
          isRegistrationRequired: false,
          kuota: 0,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-3',
          judul: 'Retreat Pemuda',
          hariJam: 'Sabtu-Minggu, 08:00 WIB',
          kategori: 'Event',
          deskripsi: 'Retreat pemuda gereja untuk pembinaan iman',
          isRegistrationRequired: true,
          kuota: 50,
          terdaftar: 0,
          registrationFee: 'Rp 150.000',
          needPaymentProof: true,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-4',
          judul: 'Ibadah Sekolah Minggu',
          hariJam: 'Minggu, 10:00 WIB',
          kategori: 'Sekolah Minggu',
          deskripsi: 'Ibadah sekolah minggu untuk anak-anak',
          isRegistrationRequired: false,
          kuota: 0,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-5',
          judul: 'Konferensi Pemuda',
          hariJam: 'Jumat-Sabtu, 08:00 WIB',
          kategori: 'Event',
          deskripsi: 'Konferensi pemuda regional dengan pembicara tamu',
          isRegistrationRequired: true,
          kuota: 100,
          terdaftar: 0,
          registrationFee: 'Rp 200.000',
          needPaymentProof: true,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-6',
          judul: 'Ibadah Syukuran',
          hariJam: 'Minggu, 18:00 WIB',
          kategori: 'Ibadah Khusus',
          deskripsi: 'Ibadah syukuran ulang tahun gereja',
          isRegistrationRequired: false,
          kuota: 0,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-7',
          judul: 'Ibadah Kaum Pria',
          hariJam: 'Selasa, 19:00 WIB',
          kategori: 'Kaum Pria',
          deskripsi: 'Ibadah khusus kaum pria',
          isRegistrationRequired: false,
          kuota: 0,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-8',
          judul: 'Ibadah Kaum Wanita',
          hariJam: 'Rabu, 19:00 WIB',
          kategori: 'Kaum Wanita',
          deskripsi: 'Ibadah khusus kaum wanita',
          isRegistrationRequired: false,
          kuota: 0,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-9',
          judul: 'Baptisan Air',
          hariJam: 'Minggu, 13:00 WIB',
          kategori: 'Baptisan',
          deskripsi: 'Baptisan air bagi yang ingin dibaptis',
          isRegistrationRequired: true,
          kuota: 20,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-10',
          judul: 'Pelatihan Pemimpin',
          hariJam: 'Sabtu, 09:00 WIB',
          kategori: 'Pelatihan',
          deskripsi: 'Pelatihan untuk pembinaan pemimpin gereja',
          isRegistrationRequired: true,
          kuota: 30,
          terdaftar: 0,
          registrationFee: 'Rp 50.000',
          needPaymentProof: true,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-11',
          judul: 'Ibadah Perayaan Natal',
          hariJam: '25 Desember, 18:00 WIB',
          kategori: 'Ibadah Khusus',
          deskripsi: 'Perayaan Natal bersama seluruh jemaat',
          isRegistrationRequired: false,
          kuota: 0,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'SCH-12',
          judul: 'Baksos Masyarakat',
          hariJam: 'Minggu, 08:00 WIB',
          kategori: 'Event',
          deskripsi: 'Bakti sosial untuk masyarakat sekitar',
          isRegistrationRequired: true,
          kuota: 40,
          terdaftar: 0,
          createdAt: new Date().toISOString()
        } as any
      );
    }

    // Seed announcements
    if (this.announcements.length === 0) {
      this.announcements.push(
        {
          id: 'ANN-1',
          title: 'Pendaftaran Sekolah Minggu',
          content: 'Pendaftaran sekolah minggu semester ganjil telah dibuka. Silakan daftarkan anak-anak Anda di sekretariat.',
          date: '2026-08-01',
          isImportant: true,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'ANN-2',
          title: 'Jadwal Ibadah Natal',
          content: 'Ibadah Natal akan dilaksanakan pada tanggal 25 Desember 2026 pukul 18:00 di gedung gereja utama.',
          date: '2026-07-28',
          isImportant: false,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'ANN-3',
          title: 'Bakti Sosial',
          content: 'Gereja akan mengadakan bakti sosial di panti asuhan Kasih Bapa pada tanggal 20 Agustus 2026. Donasi dapat diserahkan ke sekretariat.',
          date: '2026-07-25',
          isImportant: true,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'ANN-4',
          title: 'Perubahan Jadwal Ibadah',
          content: 'Mulai bulan September, ibadah raya minggu akan dimulai pukul 08:30 (sebelumnya 09:00).',
          date: '2026-07-20',
          isImportant: false,
          createdAt: new Date().toISOString()
        } as any
      );
    }

    // Seed registrations
    if (this.registrations.length === 0) {
      this.registrations.push(
        {
          id: 'REG-1',
          type: 'jemaat_baru',
          namaPendaftar: 'Rina Wati',
          nik: '3201010101010005',
          gender: 'Wanita',
          tempatLahir: 'Bogor',
          tanggalLahir: '1995-06-12',
          noHp: '081234567894',
          alamat: 'Jl. Raya Bogor No. 50',
          status: 'Pending',
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'REG-2',
          type: 'event',
          namaPendaftar: 'Doni Prasetyo',
          nik: '3201010101010006',
          gender: 'Pria',
          tempatLahir: 'Bekasi',
          tanggalLahir: '1993-09-18',
          noHp: '081234567895',
          alamat: 'Jl. Raya Bekasi No. 75',
          status: 'Disetujui',
          createdAt: new Date().toISOString()
        } as any
      );
    }

    // Seed prayers
    if (this.prayerRequests.length === 0) {
      this.prayerRequests.push(
        {
          id: 'PRY-1',
          nama: 'Anonim',
          isiDoa: 'Mohon doa untuk kesembuhan ibu saya yang sedang sakit di rumah sakit.',
          privasi: 'Rahasia Tim Doa',
          status: 'Baru',
          tanggal: new Date().toISOString(),
          noHp: '-',
          kategori: 'Kesehatan'
        } as any,
        {
          id: 'PRY-2',
          nama: 'Budi Santoso',
          isiDoa: 'Mohon doa untuk pekerjaan saya yang sedang dalam proses interview.',
          privasi: 'Publik',
          status: 'Didoakan',
          tanggal: new Date().toISOString(),
          noHp: '081234567890',
          kategori: 'Pekerjaan'
        } as any,
        {
          id: 'PRY-3',
          nama: 'Maria',
          isiDoa: 'Mohon doa untuk kelancaran ujian anak saya yang akan berlangsung minggu depan.',
          privasi: 'Publik',
          status: 'Baru',
          tanggal: new Date().toISOString(),
          noHp: '081234567896',
          kategori: 'Pendidikan'
        } as any,
        {
          id: 'PRY-4',
          nama: 'Anonim',
          isiDoa: 'Mohon doa untuk keuangan keluarga kami yang sedang terpuruk.',
          privasi: 'Rahasia Tim Doa',
          status: 'Baru',
          tanggal: new Date().toISOString(),
          noHp: '-',
          kategori: 'Keuangan'
        } as any,
        {
          id: 'PRY-5',
          nama: 'David',
          isiDoa: 'Mohon doa untuk pernikahan kami yang akan diadakan bulan depan.',
          privasi: 'Publik',
          status: 'Didoakan',
          tanggal: new Date().toISOString(),
          noHp: '081234567897',
          kategori: 'Keluarga'
        } as any
      );
    }

    // Seed knowledge base
    if (this.knowledgeBase.length === 0) {
      this.knowledgeBase.push(
        {
          id: 'KB-1',
          category: 'Jadwal',
          intent: 'jadwal',
          patterns: ['jadwal', 'kapan', 'waktu', 'ibadah'],
          botResponse: 'Jadwal ibadah raya minggu setiap hari Minggu pukul 09:00 di gedung gereja utama. Ibadah doa malam setiap hari Jumat pukul 19:00.',
          isActive: true,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'KB-2',
          category: 'Pendaftaran',
          intent: 'pendaftaran',
          patterns: ['daftar', 'pendaftaran', 'cara mendaftar', 'jadi jemaat'],
          botResponse: 'Untuk mendaftar menjadi jemaat baru, silakan isi formulir pendaftaran di halaman Pendaftaran atau datang langsung ke sekretariat gereja.',
          isActive: true,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'KB-3',
          category: 'Kontak',
          intent: 'kontak',
          patterns: ['kontak', 'telepon', 'whatsapp', 'alamat'],
          botResponse: 'Anda dapat menghubungi gereja melalui WhatsApp di 081234567890 atau datang ke alamat Jl. Merdeka No. 10, Depok.',
          isActive: true,
          lastUpdated: new Date().toISOString()
        }
      );
    }

    // Seed warta jemaat
    if (this.wartaJemaat.length === 0) {
      this.wartaJemaat.push(
        {
          id: 'WRT-1',
          edisi: 'Edisi Agustus 2026',
          tanggal: '2026-08-01',
          temaMinggu: 'Kasih dan Kasih Karunia',
          ayatMinggu: 'Sebab begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal',
          pengumuman: 'Warta jemaat bulan ini membahas tentang kasih dan kasih karunia Tuhan yang dinyatakan melalui pengorbanan Yesus Kristus. Mari kita belajar untuk mengasihi sesama seperti Tuhan mengasihi kita.',
          pdfUrl: '/uploads/warta-agustus-2026.pdf',
          petugasList: [
            { tugas: 'Pembawa Firman', nama: 'Pdt. John Doe' },
            { tugas: 'Pemimpin Pujian', nama: 'Sarah Johnson' },
            { tugas: 'Musik', nama: 'Michael Smith' },
            { tugas: 'Pelayan Anak', nama: 'Emily Brown' },
            { tugas: 'Keamanan', nama: 'David Wilson' },
            { tugas: 'Usher', nama: 'James Taylor' }
          ],
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'WRT-2',
          edisi: 'Edisi Juli 2026',
          tanggal: '2026-07-01',
          temaMinggu: 'Pertumbuhan Iman',
          ayatMinggu: 'Sebab itu hai saudara-saudara, bertekunlah dalam doa dan berjaga-jagalah di dalamnya dengan ucapan syukur',
          pengumuman: 'Warta jemaat bulan Juli membahas tentang pertumbuhan iman dalam kehidupan sehari-hari. Iman yang bertumbuh membutuhkan doa yang konsisten dan ketergantungan pada Tuhan.',
          pdfUrl: '/uploads/warta-juli-2026.pdf',
          petugasList: [
            { tugas: 'Pembawa Firman', nama: 'Pdt. Jane Smith' },
            { tugas: 'Pemimpin Pujian', nama: 'Maria Garcia' },
            { tugas: 'Musik', nama: 'Robert Martinez' },
            { tugas: 'Pelayan Anak', nama: 'Jennifer Lee' },
            { tugas: 'Keamanan', nama: 'William Davis' },
            { tugas: 'Usher', nama: 'Richard Miller' }
          ],
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'WRT-3',
          edisi: 'Edisi Juni 2026',
          tanggal: '2026-06-01',
          temaMinggu: 'Pelayanan',
          ayatMinggu: 'Setiap orang harus melayani sesuai dengan karunia yang telah diterimanya',
          pengumuman: 'Warta jemaat bulan Juni membahas tentang pelayanan dan melayani sesama. Setiap dari kita memiliki karunia yang berbeda dan dipanggil untuk melayani dengan kasih.',
          pdfUrl: '/uploads/warta-juni-2026.pdf',
          petugasList: [
            { tugas: 'Pembawa Firman', nama: 'Pdt. Michael Johnson' },
            { tugas: 'Pemimpin Pujian', nama: 'Linda Wilson' },
            { tugas: 'Musik', nama: 'Thomas Anderson' },
            { tugas: 'Pelayan Anak', nama: 'Patricia Moore' },
            { tugas: 'Keamanan', nama: 'Charles Taylor' },
            { tugas: 'Usher', nama: 'Joseph Anderson' }
          ],
          createdAt: new Date().toISOString()
        } as any
      );
    }

    // Seed hero slides
    if (this.heroSlides.length === 0) {
      this.heroSlides.push(
        {
          id: 'HSL-1',
          title: 'Selamat Datang di GPdI Melati Depok',
          subtitle: 'Rumah bagi semua untuk bertumbuh dalam iman',
          badge: 'Ibadah Raya Minggu 09:00',
          ctaText: 'Lihat Jadwal',
          ctaLink: '/jadwal-event',
          imageUrl: '/uploads/hero-1.jpg',
          orderIndex: 1,
          isActive: true,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'HSL-2',
          title: 'Bergabung dengan Keluarga Kami',
          subtitle: 'Temukan komunitas yang hangat dan mendukung',
          badge: 'Pendaftaran Jemaat Baru',
          ctaText: 'Daftar Sekarang',
          ctaLink: '/pendaftaran',
          imageUrl: '/uploads/hero-2.jpg',
          orderIndex: 2,
          isActive: true,
          createdAt: new Date().toISOString()
        } as any,
        {
          id: 'HSL-3',
          title: 'Layanan Kasih',
          subtitle: 'Melayani sesama dengan kasih dan kepedulian',
          badge: 'Program Sosial',
          ctaText: 'Pelajari Lebih Lanjut',
          ctaLink: '/layanan',
          imageUrl: '/uploads/hero-3.jpg',
          orderIndex: 3,
          isActive: true,
          createdAt: new Date().toISOString()
        } as any
      );
    }

    // Seed certificates
    if (this.certificates.length === 0) {
      this.certificates.push(
        {
          id: 'CRT-1',
          code: 'CERT-2026-001',
          nama: 'Budi Santoso',
          jenis: 'Baptisan Air',
          tanggalTerbit: '2026-01-15',
          isValid: true,
          createdAt: new Date().toISOString()
        } as any
      );
    }
  }
}

export const inMemoryDB = new InMemoryStore();
export const usePostgres = !!process.env.DATABASE_URL;

export const pool = usePostgres ? new Pool({
  connectionString: process.env.DATABASE_URL,
}) : null;

if (pool) {
  console.log("Using PostgreSQL Database");
} else {
  console.log("Using In-Memory Database Fallback");
}
