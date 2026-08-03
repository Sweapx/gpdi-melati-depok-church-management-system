export type KategoriKaum = 'Pria' | 'Wanita' | 'Muda' | 'Anak' | 'Lansia' | 'Umum';

export interface JemaatFamilyMember {
  nama: string;
  nik: string;
  gender: 'Pria' | 'Wanita';
  tempatLahir?: string;
  tanggalLahir: string;
  statusKeluarga: 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Orang Tua' | 'Kerabat';
  kategoriKaum: KategoriKaum;
  pekerjaanPendidikan?: string;
  noHp?: string;
}

export interface Jemaat {
  id: string;
  nama: string;
  nik?: string;
  gender: 'Pria' | 'Wanita';
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  noTelepon?: string;
  statusJemaat: 'Aktif' | 'Keluar' | 'Meninggal';
  statusPernikahan?: string;
  kategoriKaum?: string;
  sektor?: string;
  wadah?: string;
  rayon?: string;
  anggotaKeluarga?: JemaatFamilyMember[];
  createdAt: string;
}

export type RegistrationType = 'jemaat_baru' | 'event';
export type RegistrationStatus = 'Pending' | 'Disetujui' | 'Ditolak';

export interface RegistrationItem {
  id: string;
  type: RegistrationType;
  jenisKegiatan?: string;
  namaPendaftar: string;
  gender?: 'Pria' | 'Wanita';
  tempatLahir?: string;
  tanggalLahir?: string;
  noHp: string;
  alamat?: string;
  rayon?: string;
  status: RegistrationStatus;
  tanggalDaftar: string;
}

export interface CustomEventField {
  id: string;
  label: string;
  type: 'text' | 'checkbox' | 'select' | 'file';
  required?: boolean;
  options?: string[];
}

export interface ScheduleItem {
  id: string;
  kategori: string;
  judul: string;
  hariJam: string;
  lokasi?: string;
  deskripsi?: string;
  isRegistrationRequired?: boolean;
  needPaymentProof?: boolean;
  registrationFee?: string;
  kuota?: number;
  terdaftar?: number;
}

export interface AnnouncementItem {
  id: string;
  judul: string;
  tanggal: string;
  kategori: string;
  ringkasan: string;
  isi: string;
  penting: boolean;
  gambarUrl?: string;
}

export interface KnowledgeBaseQA {
  id: string;
  category: string;
  intent: string;
  patterns: string[];
  botResponse: string;
  isActive: boolean;
  lastUpdated: string;
}

export interface PrayerRequest {
  id: string;
  nama: string;
  noHp: string;
  kategori: 'Kesehatan' | 'Keluarga' | 'Pemulihan' | 'Pekerjaan' | 'Spiritual' | 'Lainnya';
  isiDoa: string;
  privasi: 'Publik' | 'Rahasia Tim Doa';
  status: 'Baru' | 'Didoakan' | 'Selesai';
  tanggal: string;
}

export interface WartaItem {
  id: string;
  edisi: string;
  tanggal: string;
  temaMinggu: string;
  ayatMinggu: string;
  pengumuman: string;
  petugasList: Array<{tugas: string, nama: string}>;
  pdfUrl?: string;
  pdfFileName?: string;
}

export interface CertificateDoc {
  id: string;
  code: string;
  recipientName: string;
  type: 'Baptis' | 'Keanggotaan' | 'Pemberkatan Nikah';
  date: string;
  pastorName: string;
  churchName: string;
  isValid: boolean;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaType: 'home' | 'schedule' | 'registration' | 'layanan' | 'warta';
  eventName?: string;
  isActive: boolean;
  orderIndex: number;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: string;
  mustChangePassword?: boolean;
}
