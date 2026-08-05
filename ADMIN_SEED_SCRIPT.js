/**
 * ADMIN DATA SEEDING SCRIPT - GPdI Melati Depok Church Management System
 * 
 * Cara penggunaan:
 * 1. Buka aplikasi di browser (http://localhost:3000)
 * 2. Login ke admin panel (http://localhost:3000/admin)
 * 3. Buka DevTools (F12) -> Console tab
 * 4. Copy dan paste seluruh script ini ke console
 * 5. Script akan menjalankan seeding data secara otomatis
 * 
 * Script ini akan membuat data test untuk:
 * - Jemaat (5 data)
 * - Schedules Ibadah (3 data)
 * - Schedules Event (3 data)
 * - Hero Slides (2 data)
 * - Announcements (2 data)
 * - Warta Jemaat (1 data)
 * - Registrations Jemaat (2 data)
 * - Registrations Event (2 data)
 */

const AdminSeedScript = {
  results: [],
  token: localStorage.getItem('token'),
  
  log(message, type = 'info') {
    const colors = {
      info: '%c[INFO]',
      success: '%c[PASS]',
      error: '%c[FAIL]',
      warning: '%c[WARN]'
    };
    const colorStyles = {
      info: 'color: #3498db',
      success: 'color: #27ae60; font-weight: bold',
      error: 'color: #e74c3c; font-weight: bold',
      warning: 'color: #f39c12'
    };
    console.log(colors[type], colorStyles[type], message);
    this.results.push({ message, type, timestamp: new Date().toISOString() });
  },

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async apiRequest(endpoint, method = 'GET', data = null) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      const options = {
        method,
        headers
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`/api${endpoint}`, options);
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
        gender: 'Pria',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1985-05-15',
        alamat: 'Jl. Merdeka No. 10, Depok',
        no_hp: '081234567890',
        status_jemaat: 'Aktif',
        wadah: 'Pemudia',
        rayon: 'Rayon 1'
      },
      {
        nama: 'Siti Rahayu',
        gender: 'Wanita',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '1990-08-22',
        alamat: 'Jl. Melati No. 25, Depok',
        no_hp: '081234567891',
        status_jemaat: 'Aktif',
        wadah: 'Pemudi',
        rayon: 'Rayon 2'
      },
      {
        nama: 'Andi Wijaya',
        gender: 'Pria',
        tempat_lahir: 'Surabaya',
        tanggal_lahir: '1988-03-10',
        alamat: 'Jl. Anggrek No. 5, Depok',
        no_hp: '081234567892',
        status_jemaat: 'Aktif',
        wadah: 'Pria',
        rayon: 'Rayon 3'
      },
      {
        nama: 'Dewi Lestari',
        gender: 'Wanita',
        tempat_lahir: 'Yogyakarta',
        tanggal_lahir: '1992-11-30',
        alamat: 'Jl. Mawar No. 15, Depok',
        no_hp: '081234567893',
        status_jemaat: 'Aktif',
        wadah: 'Wanita',
        rayon: 'Rayon 4'
      },
      {
        nama: 'Eko Prasetyo',
        gender: 'Pria',
        tempat_lahir: 'Semarang',
        tanggal_lahir: '1987-07-18',
        alamat: 'Jl. Kenari No. 8, Depok',
        no_hp: '081234567894',
        status_jemaat: 'Aktif',
        wadah: 'Pria',
        rayon: 'Rayon 5'
      }
    ];
    
    let successCount = 0;
    
    for (const jemaat of jemaatData) {
      const result = await this.apiRequest('/jemaat', 'POST', jemaat);
      if (result.success) {
        this.log(`✓ Created jemaat: ${jemaat.nama}`, 'success');
        successCount++;
      } else {
        this.log(`✗ Failed to create jemaat: ${jemaat.nama}`, 'error');
      }
      await this.wait(500);
    }
    
    this.log(`Jemaat seeding complete: ${successCount}/${jemaatData.length} created`, successCount === jemaatData.length ? 'success' : 'warning');
    await this.wait(1000);
  },

  async seedSchedulesIbadah() {
    this.log('=== SEEDING IBADAH SCHEDULES ===', 'info');
    
    const ibadahData = [
      {
        kategori: 'Ibadah Raya',
        judul: 'Ibadah Raya Minggu',
        hari_jam: 'Minggu, 09:00 WIB',
        lokasi: 'Gedung Gereja Utama',
        deskripsi: 'Ibadah raya mingguan untuk seluruh jemaat',
        is_registration_required: false
      },
      {
        kategori: 'Sekolah Minggu',
        judul: 'Sekolah Minggu Anak',
        hari_jam: 'Minggu, 09:00 WIB',
        lokasi: 'Ruang Sekolah Minggu',
        deskripsi: 'Pembelajaran rohani untuk anak-anak',
        is_registration_required: false
      },
      {
        kategori: 'Ibadah Doa',
        judul: 'Ibadah Doa Malam',
        hari_jam: 'Rabu, 19:00 WIB',
        lokasi: 'Gedung Gereja Utama',
        deskripsi: 'Ibadah doa bersama seluruh jemaat',
        is_registration_required: false
      }
    ];
    
    let successCount = 0;
    
    for (const schedule of ibadahData) {
      const result = await this.apiRequest('/schedules', 'POST', schedule);
      if (result.success) {
        this.log(`✓ Created ibadah schedule: ${schedule.judul}`, 'success');
        successCount++;
      } else {
        this.log(`✗ Failed to create ibadah schedule: ${schedule.judul}`, 'error');
      }
      await this.wait(500);
    }
    
    this.log(`Ibadah schedules seeding complete: ${successCount}/${ibadahData.length} created`, successCount === ibadahData.length ? 'success' : 'warning');
    await this.wait(1000);
  },

  async seedSchedulesEvent() {
    this.log('=== SEEDING EVENT SCHEDULES ===', 'info');
    
    const eventData = [
      {
        kategori: 'Event',
        judul: 'Retreat Pemudia 2026',
        hari_jam: 'Sabtu, 08:00 WIB',
        lokasi: 'Villa Puncak',
        deskripsi: 'Retreat tahunan pemudia gereja',
        is_registration_required: true,
        kuota: 50,
        terdaftar: 0,
        registration_fee: 'Rp 500.000',
        need_payment_proof: true
      },
      {
        kategori: 'Pelatihan',
        judul: 'Pelatihan Musik Gereja',
        hari_jam: 'Minggu, 13:00 WIB',
        lokasi: 'Rangka Musik',
        deskripsi: 'Pelatihan musik untuk pelayanan gereja',
        is_registration_required: true,
        kuota: 30,
        terdaftar: 0,
        registration_fee: 'Gratis',
        need_payment_proof: false
      },
      {
        kategori: 'Event',
        judul: 'Natal Bersama 2026',
        hari_jam: 'Sabtu, 18:00 WIB',
        lokasi: 'Gedung Gereja Utama',
        deskripsi: 'Perayaan natal bersama seluruh jemaat',
        is_registration_required: true,
        kuota: 200,
        terdaftar: 0,
        registration_fee: 'Gratis',
        need_payment_proof: false
      }
    ];
    
    let successCount = 0;
    
    for (const schedule of eventData) {
      const result = await this.apiRequest('/schedules', 'POST', schedule);
      if (result.success) {
        this.log(`✓ Created event schedule: ${schedule.judul}`, 'success');
        successCount++;
      } else {
        this.log(`✗ Failed to create event schedule: ${schedule.judul}`, 'error');
      }
      await this.wait(500);
    }
    
    this.log(`Event schedules seeding complete: ${successCount}/${eventData.length} created`, successCount === eventData.length ? 'success' : 'warning');
    await this.wait(1000);
  },

  async seedHeroSlides() {
    this.log('=== SEEDING HERO SLIDES ===', 'info');
    
    const heroSlidesData = [
      {
        image_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920',
        badge: 'WELCOME',
        title: 'Selamat Datang di GPdI Melati Depok',
        subtitle: 'Bergabunglah bersama kami dalam persekutuan dan pelayanan',
        cta_text: 'Jadwal Ibadah',
        cta_type: 'schedule',
        is_active: true,
        order_index: 1
      },
      {
        image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920',
        badge: 'EVENT',
        title: 'Retreat Pemudia 2026',
        subtitle: 'Daftar sekarang untuk retreat tahunan pemudia',
        cta_text: 'Daftar Sekarang',
        cta_type: 'registration',
        is_active: true,
        order_index: 2
      }
    ];
    
    let successCount = 0;
    
    for (const slide of heroSlidesData) {
      const result = await this.apiRequest('/hero-slides', 'POST', slide);
      if (result.success) {
        this.log(`✓ Created hero slide: ${slide.title}`, 'success');
        successCount++;
      } else {
        this.log(`✗ Failed to create hero slide: ${slide.title}`, 'error');
      }
      await this.wait(500);
    }
    
    this.log(`Hero slides seeding complete: ${successCount}/${heroSlidesData.length} created`, successCount === heroSlidesData.length ? 'success' : 'warning');
    await this.wait(1000);
  },

  async seedAnnouncements() {
    this.log('=== SEEDING ANNOUNCEMENTS ===', 'info');
    
    const announcementsData = [
      {
        judul: 'Pengumuman Ibadah Raya',
        ringkasan: 'Jadwal ibadah raya minggu ini',
        isi: 'Ibadah raya akan dilaksanakan pada hari Minggu pukul 09:00 WIB di gedung gereja utama. Mohon hadir tepat waktu.',
        penting: true,
        gambar_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800'
      },
      {
        judul: 'Info Pendaftaran Event',
        ringkasan: 'Pendaftaran retreat pemudia dibuka',
        isi: 'Pendaftaran retreat pemudia 2026 telah dibuka. Silakan daftar melalui website gereja atau hubungi sekretariat.',
        penting: false,
        gambar_url: null
      }
    ];
    
    let successCount = 0;
    
    for (const announcement of announcementsData) {
      const result = await this.apiRequest('/announcements', 'POST', announcement);
      if (result.success) {
        this.log(`✓ Created announcement: ${announcement.judul}`, 'success');
        successCount++;
      } else {
        this.log(`✗ Failed to create announcement: ${announcement.judul}`, 'error');
      }
      await this.wait(500);
    }
    
    this.log(`Announcements seeding complete: ${successCount}/${announcementsData.length} created`, successCount === announcementsData.length ? 'success' : 'warning');
    await this.wait(1000);
  },

  async seedWartaJemaat() {
    this.log('=== SEEDING WARTA JEMAAT ===', 'info');
    
    const wartaData = {
      edisi: 'Edisi 45 - Agustus 2026',
      tanggal: '2026-08-01',
      tema_minggu: 'Kasih dan Pengorbanan',
      ayat_minggu: 'Yohanes 3:16',
      pengumuman: 'Warta jemaat minggu ini berisi informasi mengenai jadwal kegiatan, pengumuman penting, dan berita terkini dari gereja.',
      pdf_url: null,
      petugas_list: [
        { tugas: 'Pembawa Firman', nama: 'Pdt. Budi Santoso' },
        { tugas: 'Pemimpin Pujian', nama: 'Ibu Siti Rahayu' },
        { tugas: 'Organis', nama: 'Bpk. Andi Wijaya' }
      ]
    };
    
    const result = await this.apiRequest('/warta-jemaat', 'POST', wartaData);
    if (result.success) {
      this.log(`✓ Created warta jemaat: ${wartaData.edisi}`, 'success');
    } else {
      this.log(`✗ Failed to create warta jemaat`, 'error');
    }
    
    await this.wait(1000);
  },

  async seedRegistrationsJemaat() {
    this.log('=== SEEDING JEMAAT REGISTRATIONS ===', 'info');
    
    const jemaatRegistrationsData = [
      {
        type: 'jemaat_baru',
        nama_pendaftar: 'Feri Kurniawan',
        gender: 'Pria',
        tempat_lahir: 'Bogor',
        tanggal_lahir: '1995-02-14',
        no_hp: '081234567895',
        alamat: 'Jl. Salak No. 20, Bogor',
        rayon: 'Rayon 1',
        status: 'Pending',
        tanggal_daftar: new Date().toISOString()
      },
      {
        type: 'jemaat_baru',
        nama_nendaftar: 'Rina Melati',
        gender: 'Wanita',
        tempat_lahir: 'Bekasi',
        tanggal_lahir: '1993-06-20',
        no_hp: '081234567896',
        alamat: 'Jl. Cempedak No. 12, Bekasi',
        rayon: 'Rayon 2',
        status: 'Pending',
        tanggal_daftar: new Date().toISOString()
      }
    ];
    
    let successCount = 0;
    
    for (const registration of jemaatRegistrationsData) {
      const result = await this.apiRequest('/registrations', 'POST', registration);
      if (result.success) {
        this.log(`✓ Created jemaat registration: ${registration.nama_pendaftar}`, 'success');
        successCount++;
      } else {
        this.log(`✗ Failed to create jemaat registration: ${registration.nama_pendaftar}`, 'error');
      }
      await this.wait(500);
    }
    
    this.log(`Jemaat registrations seeding complete: ${successCount}/${jemaatRegistrationsData.length} created`, successCount === jemaatRegistrationsData.length ? 'success' : 'warning');
    await this.wait(1000);
  },

  async seedRegistrationsEvent() {
    this.log('=== SEEDING EVENT REGISTRATIONS ===', 'info');
    
    const eventRegistrationsData = [
      {
        type: 'event',
        jenis_kegiatan: 'Retreat Pemudia',
        nama_pendaftar: 'Agus Setiawan',
        no_hp: '081234567897',
        status: 'Pending',
        tanggal_daftar: new Date().toISOString()
      },
      {
        type: 'event',
        jenis_kegiatan: 'Pelatihan Musik',
        nama_pendaftar: 'Maya Sari',
        no_hp: '081234567898',
        status: 'Pending',
        tanggal_daftar: new Date().toISOString()
      }
    ];
    
    let successCount = 0;
    
    for (const registration of eventRegistrationsData) {
      const result = await this.apiRequest('/registrations', 'POST', registration);
      if (result.success) {
        this.log(`✓ Created event registration: ${registration.nama_pendaftar}`, 'success');
        successCount++;
      } else {
        this.log(`✗ Failed to create event registration: ${registration.nama_pendaftar}`, 'error');
      }
      await this.wait(500);
    }
    
    this.log(`Event registrations seeding complete: ${successCount}/${eventRegistrationsData.length} created`, successCount === eventRegistrationsData.length ? 'success' : 'warning');
    await this.wait(1000);
  },

  async runAllSeeding() {
    this.log('🚀 STARTING ADMIN DATA SEEDING', 'info');
    this.log('=====================================', 'info');
    
    if (!this.token) {
      this.log('✗ No authentication token found. Please login first.', 'error');
      return;
    }
    
    try {
      await this.seedJemaat();
      await this.seedSchedulesIbadah();
      await this.seedSchedulesEvent();
      await this.seedHeroSlides();
      await this.seedAnnouncements();
      await this.seedWartaJemaat();
      await this.seedRegistrationsJemaat();
      await this.seedRegistrationsEvent();
      
      this.log('=====================================', 'info');
      this.log('🎉 DATA SEEDING COMPLETED', 'info');
      this.log('=====================================', 'info');
      
      // Summary
      const passed = this.results.filter(r => r.type === 'success').length;
      const failed = this.results.filter(r => r.type === 'error').length;
      const warnings = this.results.filter(r => r.type === 'warning').length;
      
      console.log('%cSUMMARY:', 'font-weight: bold; font-size: 14px');
      console.log(`%c✓ Success: ${passed}`, 'color: #27ae60; font-weight: bold');
      console.log(`%c✗ Failed: ${failed}`, 'color: #e74c3c; font-weight: bold');
      console.log(`%c⚠ Warnings: ${warnings}`, 'color: #f39c12; font-weight: bold');
      console.log(`%cTotal: ${this.results.length}`, 'color: #3498db; font-weight: bold');
      
      console.log('%c=====================================', 'color: #3498db');
      console.log('%cNext steps:', 'font-weight: bold; font-size: 14px');
      console.log('%c1. Check admin pages to verify seeded data', 'color: #f39c12');
      console.log('%c2. Test CRUD operations on seeded data', 'color: #f39c12');
      console.log('%c3. Test approval workflows', 'color: #f39c12');
      console.log('%c=====================================', 'color: #3498db');
      
      return { passed, failed, warnings, total: this.results.length };
    } catch (error) {
      this.log(`✗ Seeding error: ${error.message}`, 'error');
      return { passed: 0, failed: 1, warnings: 0, total: 1 };
    }
  }
};

// Run the seeding script
console.log('%c🌱 GPdI Melati - Admin Data Seeding Script', 'font-size: 20px; font-weight: bold; color: #27ae60');
console.log('%cStarting data seeding in 3 seconds...', 'color: #f39c12');
console.log('%cMake sure you are logged in to the admin panel!', 'color: #f39c12; font-weight: bold');

setTimeout(() => {
  AdminSeedScript.runAllSeeding();
}, 3000);
