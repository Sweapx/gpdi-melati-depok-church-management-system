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
  nik: string;
  gender: 'Pria' | 'Wanita';
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  provinsi?: string;
  kabupatenKota?: string;
  kecamatan?: string;
  kelurahan?: string;
  noHp: string;
  statusPernikahan: 'Belum Menikah' | 'Menikah' | 'Janda/Duda';
  statusJemaat: 'Aktif' | 'Inaktif' | 'Keluar' | 'Meninggal';
  kategoriKaum: KategoriKaum;
  sektor: string;
  tanggalBaptis?: string;
  namaAyah?: string;
  namaIbu?: string;
  createdAt: string;
  anggotaKeluarga?: JemaatFamilyMember[];
}

export type RegistrationType = 'jemaat_baru' | 'pendataan_terdaftar' | 'pemutakhiran_data' | 'baptisan' | 'event';
export type RegistrationStatus = 'Pending' | 'Disetujui' | 'Ditolak';

export interface RegistrationItem {
  id: string;
  type: RegistrationType;
  eventName?: string;
  namaPendaftar: string;
  nik: string;
  gender: 'Pria' | 'Wanita';
  tempatLahir: string;
  tanggalLahir: string;
  noHp: string;
  email?: string;
  provinsi?: string;
  kabupatenKota?: string;
  kecamatan?: string;
  alamat: string;
  namaAyah?: string;
  namaIbu?: string;
  gerejaAsal?: string;
  pasfotoBaptis?: string;
  ukuranKaos?: string;
  paketKamar?: string;
  catatanMedis?: string;
  jumlahPeserta?: number;
  lampiranBuktiBayar?: string;
  customResponses?: Record<string, any>;
  isAgreedToTerms?: boolean;
  anggotaKeluarga?: JemaatFamilyMember[];
  status: RegistrationStatus;
  lampiranKTP?: string;
  lampiranKK?: string;
  catatan?: string;
  tanggalDaftar: string;
  statusNote?: string;
  verifiedBy?: string;
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
  kategori: 'ibadah_raya' | 'sekolah_minggu' | 'youth' | 'event_special' | 'doa';
  judul: string;
  hariJam: string;
  pembicara: string;
  lokasi: string;
  deskripsi: string;
  isRegistrationRequired?: boolean;
  kategoriEvent?: string;
  customFields?: CustomEventField[];
  needTshirtSize?: boolean;
  needAccommodation?: boolean;
  needMedicalNote?: boolean;
  needMemberCount?: boolean;
  needPaymentProof?: boolean;
  registrationFee?: string;
  termsAgreementText?: string;
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
  ctaType: 'jemaat_baru' | 'pendataan_terdaftar' | 'baptisan' | 'event' | 'schedule' | 'warta' | 'prayer';
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
