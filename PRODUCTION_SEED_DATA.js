/**
 * PRODUCTION SEED DATA SCRIPT - GPdI Melati Depok Church Management System
 * 
 * Cara penggunaan:
 * 1. Login sebagai admin di production: https://domain-gereja.com/admin/login
 * 2. Buka DevTools (F12) -> Console tab
 * 3. Copy dan paste seluruh script ini ke console
 * 4. Script akan menambahkan seed data ke database production
 * 
 * Data yang akan ditambahkan:
 * - Sample jemaat data
 * - Sample schedules (ibadah & event)
 * - Sample announcements
 * - Sample hero slides
 * - Sample warta jemaat
 */

const ProductionSeedData = {
  token: localStorage.getItem('token'),
  baseUrl: window.location.origin,
  
  log(message, type = 'info') {
    const colors = {
      info: '%c[INFO]',
      success: '%c[SUCCESS]',
      error: '%c[ERROR]',
      warning: '%c[WARN]'
    };
    const colorStyles = {
      info: 'color: #3498db',
      success: 'color: #27ae60; font-weight: bold',
      error: 'color: #e74c3c; font-weight: bold',
      warning: 'color: #f39c12'
    };
    console.log(colors[type], colorStyles[type], message);
  },

  async apiCall(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const result = await response.json();
      return result;
    } catch (error) {
      this.log(`API Error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  async seedJemaat() {
    this.log('=== SEEDING JEMAAT DATA ===', 'info');
    
    const jemaatData = [
      {
        nama: 'Budi Santoso',
        nik: '3201010101010001',
        gender: 'Pria',
        tempatLahir: 'Jakarta',
        tanggalLahir: '1990-05-15',
        alamat: 'Jl. Merdeka No. 10, Depok',
        noHp: '081234567890',
        noTelepon: '0217521216',
        statusJemaat: 'Aktif',
        kategoriKaum: 'Umum',
        sektor: 'Sektor 1',
        wadah: 'Wadah Muda Mudi',
        rayon: 'Rayon Depok Timur'
      },
      {
        nama: 'Siti Rahayu',
        nik: '3201010101010002',
        gender: 'Wanita',
        tempatLahir: 'Bandung',
        tanggalLahir: '1992-08-20',
        alamat: 'Jl. Sudirman No. 25, Depok',
        noHp: '081234567891',
        noTelepon: '0217521217',
        statusJemaat: 'Aktif',
        kategoriKaum: 'Perempuan',
        sektor: 'Sektor 2',
        wadah: 'Wadah Wanita',
        rayon: 'Rayon Depok Barat'
      },
      {
        nama: 'Agus Pratama',
        nik: '3201010101010003',
        gender: 'Pria',
        tempatLahir: 'Surabaya',
        tanggalLahir: '1988-03-10',
        alamat: 'Jl. Gatot Subroto No. 15, Depok',
        noHp: '081234567892',
        noTelepon: '0217521218',
        statusJemaat: 'Aktif',
        kategoriKaum: 'Pria',
        sektor: 'Sektor 1',
        wadah: 'Wadah Dewasa',
        rayon: 'Rayon Depok Selatan'
      },
      {
        nama: 'Dewi Sartika',
        nik: '3201010101010004',
        gender: 'Wanita',
        tempatLahir: 'Yogyakarta',
        tanggalLahir: '1985-12-25',
        alamat: 'Jl. Diponegoro No. 30, Depok',
        noHp: '081234567893',
        noTelepon: '0217521219',
        statusJemaat: 'Aktif',
        kategoriKaum: 'Perempuan',
        sektor: 'Sektor 2',
        wadah: 'Wadah Dewasa',
        rayon: 'Rayon Depok Timur'
      },
      {
        nama: 'Eko Kurniawan',
        nik: '3201010101010005',
        gender: 'Pria',
        tempatLahir: 'Semarang',
        tanggalLahir: '1995-07-08',
        alamat: 'Jl. Ahmad Yani No. 45, Depok',
        noHp: '081234567894',
        noTelepon: '0217521220',
        statusJemaat: 'Aktif',
        kategoriKaum: 'Pria',
        sektor: 'Sektor 3',
        wadah: 'Wadah Muda Mudi',
        rayon: 'Rayon Depok Utara'
      }
    ];

    let successCount = 0;
    for (const jemaat of jemaatData) {
      const result = await this.apiCall('/api/jemaat', 'POST', jemaat);
      if (result.success) {
        successCount++;
        this.log(`✓ Added jemaat: ${jemaat.nama}`, 'success');
      } else {
        this.log(`✗ Failed to add jemaat: ${jemaat.nama}`, 'error');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.log(`Jemaat seeding completed: ${successCount}/${jemaatData.length} successful`, successCount === jemaatData.length ? 'success' : 'warning');
  },

  async seedSchedules() {
    this.log('=== SEEDING SCHEDULES DATA ===', 'info');
    
    const schedulesData = [
      {
        judul: 'Ibadah Raya Minggu',
        hariJam: 'Minggu, 09:00 WIB',
        kategori: 'Ibadah Raya',
        deskripsi: 'Ibadah raya minggu reguler untuk seluruh jemaat',
        isRegistrationRequired: false,
        kuota: 0,
        terdaftar: 0
      },
      {
        judul: 'Ibadah Doa Malam',
        hariJam: 'Kamis, 19:00 WIB',
        kategori: 'Ibadah Doa',
        deskripsi: 'Waktu doa bersama untuk kebutuhan jemaat',
        isRegistrationRequired: false,
        kuota: 0,
        terdaftar: 0
      },
      {
        judul: 'Ibadah Sekolah Minggu',
        hariJam: 'Minggu, 10:00 WIB',
        kategori: 'Sekolah Minggu',
        deskripsi: 'Ibadah sekolah minggu untuk anak-anak',
        isRegistrationRequired: false,
        kuota: 0,
        terdaftar: 0
      },
      {
        judul: 'Ibadah Kaum Pria',
        hariJam: 'Selasa, 19:00 WIB',
        kategori: 'Kaum Pria',
        deskripsi: 'Ibadah khusus kaum pria',
        isRegistrationRequired: false,
        kuota: 0,
        terdaftar: 0
      },
      {
        judul: 'Ibadah Kaum Wanita',
        hariJam: 'Rabu, 19:00 WIB',
        kategori: 'Kaum Wanita',
        deskripsi: 'Ibadah khusus kaum wanita',
        isRegistrationRequired: false,
        kuota: 0,
        terdaftar: 0
      },
      {
        judul: 'Retreat Pemuda 2026',
        hariJam: 'Sabtu-Minggu, 08:00 WIB',
        kategori: 'Event',
        deskripsi: 'Retreat pemuda gereja untuk pembinaan iman',
        isRegistrationRequired: true,
        kuota: 50,
        terdaftar: 0,
        registrationFee: 'Rp 150.000',
        needPaymentProof: true
      },
      {
        judul: 'Konferensi Pemuda Regional',
        hariJam: 'Jumat-Sabtu, 08:00 WIB',
        kategori: 'Event',
        deskripsi: 'Konferensi pemuda regional dengan pembicara tamu',
        isRegistrationRequired: true,
        kuota: 100,
        terdaftar: 0,
        registrationFee: 'Rp 200.000',
        needPaymentProof: true
      },
      {
        judul: 'Baptisan Air',
        hariJam: 'Minggu, 13:00 WIB',
        kategori: 'Baptisan',
        deskripsi: 'Baptisan air bagi yang ingin dibaptis',
        isRegistrationRequired: true,
        kuota: 20,
        terdaftar: 0
      },
      {
        judul: 'Pelatihan Pemimpin Gereja',
        hariJam: 'Sabtu, 09:00 WIB',
        kategori: 'Pelatihan',
        deskripsi: 'Pelatihan untuk pembinaan pemimpin gereja',
        isRegistrationRequired: true,
        kuota: 30,
        terdaftar: 0,
        registrationFee: 'Rp 50.000',
        needPaymentProof: true
      }
    ];

    let successCount = 0;
    for (const schedule of schedulesData) {
      const result = await this.apiCall('/api/schedules', 'POST', schedule);
      if (result.success) {
        successCount++;
        this.log(`✓ Added schedule: ${schedule.judul}`, 'success');
      } else {
        this.log(`✗ Failed to add schedule: ${schedule.judul}`, 'error');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.log(`Schedules seeding completed: ${successCount}/${schedulesData.length} successful`, successCount === schedulesData.length ? 'success' : 'warning');
  },

  async seedAnnouncements() {
    this.log('=== SEEDING ANNOUNCEMENTS DATA ===', 'info');
    
    const announcementsData = [
      {
        title: 'Pendaftaran Sekolah Minggu',
        content: 'Pendaftaran sekolah minggu semester ganjil telah dibuka. Silakan daftarkan anak-anak Anda di sekretariat.',
        date: new Date().toISOString().split('T')[0],
        isImportant: true
      },
      {
        title: 'Jadwal Ibadah Natal',
        content: 'Ibadah Natal akan dilaksanakan pada tanggal 25 Desember pukul 18:00 di gedung gereja utama.',
        date: new Date().toISOString().split('T')[0],
        isImportant: false
      },
      {
        title: 'Bakti Sosial',
        content: 'Gereja akan mengadakan bakti sosial di panti asuhan Kasih Bapa. Donasi dapat diserahkan ke sekretariat.',
        date: new Date().toISOString().split('T')[0],
        isImportant: true
      }
    ];

    let successCount = 0;
    for (const announcement of announcementsData) {
      const result = await this.apiCall('/api/announcements', 'POST', announcement);
      if (result.success) {
        successCount++;
        this.log(`✓ Added announcement: ${announcement.title}`, 'success');
      } else {
        this.log(`✗ Failed to add announcement: ${announcement.title}`, 'error');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.log(`Announcements seeding completed: ${successCount}/${announcementsData.length} successful`, successCount === announcementsData.length ? 'success' : 'warning');
  },

  async seedHeroSlides() {
    this.log('=== SEEDING HERO SLIDES DATA ===', 'info');
    
    const heroSlidesData = [
      {
        title: 'Selamat Datang di GPdI Melati Depok',
        subtitle: 'Rumah bagi semua untuk bertumbuh dalam iman',
        badge: 'Ibadah Raya Minggu 09:00',
        ctaText: 'Lihat Jadwal',
        ctaLink: '/jadwal-event',
        imageUrl: '/uploads/hero-1.jpg',
        orderIndex: 1,
        isActive: true
      },
      {
        title: 'Bergabung dengan Keluarga Kami',
        subtitle: 'Temukan komunitas yang hangat dan mendukung',
        badge: 'Pendaftaran Jemaat Baru',
        ctaText: 'Daftar Sekarang',
        ctaLink: '/pendaftaran',
        imageUrl: '/uploads/hero-2.jpg',
        orderIndex: 2,
        isActive: true
      },
      {
        title: 'Layanan Kasih',
        subtitle: 'Melayani sesama dengan kasih dan kepedulian',
        badge: 'Program Sosial',
        ctaText: 'Pelajari Lebih Lanjut',
        ctaLink: '/',
        imageUrl: '/uploads/hero-3.jpg',
        orderIndex: 3,
        isActive: true
      }
    ];

    let successCount = 0;
    for (const slide of heroSlidesData) {
      const result = await this.apiCall('/api/hero-slides', 'POST', slide);
      if (result.success) {
        successCount++;
        this.log(`✓ Added hero slide: ${slide.title}`, 'success');
      } else {
        this.log(`✗ Failed to add hero slide: ${slide.title}`, 'error');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.log(`Hero slides seeding completed: ${successCount}/${heroSlidesData.length} successful`, successCount === heroSlidesData.length ? 'success' : 'warning');
  },

  async seedWartaJemaat() {
    this.log('=== SEEDING WARTA JEMAAT DATA ===', 'info');
    
    const wartaData = {
      edisi: 'Edisi Agustus 2026',
      tanggal: new Date().toISOString().split('T')[0],
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
      ]
    };

    const result = await this.apiCall('/api/warta-jemaat', 'POST', wartaData);
    if (result.success) {
      this.log(`✓ Added warta jemaat: ${wartaData.edisi}`, 'success');
    } else {
      this.log(`✗ Failed to add warta jemaat: ${wartaData.edisi}`, 'error');
    }
  },

  async runAllSeeds() {
    this.log('🚀 STARTING PRODUCTION SEED DATA', 'info');
    this.log('=====================================', 'info');
    
    if (!this.token) {
      this.log('✗ No authentication token found. Please login first.', 'error');
      return;
    }

    try {
      await this.seedJemaat();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.seedSchedules();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.seedAnnouncements();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.seedHeroSlides();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.seedWartaJemaat();
      
      this.log('=====================================', 'info');
      this.log('🎉 PRODUCTION SEED DATA COMPLETED', 'info');
      this.log('=====================================', 'info');
    } catch (error) {
      this.log(`✗ Seeding error: ${error.message}`, 'error');
    }
  }
};

// Run the seed data
console.log('%c🌱 GPdI Melati - Production Seed Data', 'font-size: 20px; font-weight: bold; color: #27ae60');
console.log('%cStarting seed data in 3 seconds...', 'color: #f39c12');
console.log('%cMake sure you are logged in as admin!', 'color: #f39c12; font-weight: bold');

setTimeout(() => {
  ProductionSeedData.runAllSeeds();
}, 3000);
