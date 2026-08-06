import { Router } from "express";
import { pool, inMemoryDB, saveInMemoryDBToDisk } from "../db/index.ts";
import { GoogleGenAI } from "@google/genai";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const router = Router();

// Helper function to check if PostgreSQL is available
const checkPostgres = (): void => {
  if (!pool) {
    throw new Error("PostgreSQL not available");
  }
};

let schemaInitialized = false;

const ensureSchema = async (): Promise<void> => {
  if (!pool || schemaInitialized) return;
  try {
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
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rayon (
        id VARCHAR(50) PRIMARY KEY,
        nama_rayon VARCHAR(255) NOT NULL,
        ketua_rayon VARCHAR(255) NOT NULL,
        jumlah_anggota INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
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
    `);
    await pool.query(`
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
    `);
    await pool.query(`
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
    `);
    await pool.query(`
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
    `);
    await pool.query(`
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
    `);
    await pool.query(`
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
    `);
    await pool.query(`
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
    try {
      const kbCheck = await pool.query("SELECT COUNT(*) FROM knowledge_base");
      if (parseInt(kbCheck.rows[0].count, 10) === 0) {
        const defaultKbs = [
          { id: "KB-1", category: "Jadwal Ibadah", intent: "general", patterns: JSON.stringify(["jadwal ibadah", "jam berapa ibadah", "kapan ibadah minggu", "jadwal"]), bot_response: "Ibadah Raya GPdI Melati Depok dilaksanakan setiap hari Minggu: Ibadah I pukul 07.00 WIB dan Ibadah II pukul 10.00 WIB.", is_active: true },
          { id: "KB-2", category: "Kontak & Alamat", intent: "general", patterns: JSON.stringify(["alamat gereja", "lokasi gereja", "no telepon gereja", "kontak", "alamat"]), bot_response: "📍 GPdI Melati Depok beralamat di Jl. Melati No. 8, Depok, Jawa Barat. 📞 Telepon/WA: (021) 7521216. Sekretariat buka Selasa - Minggu (08.00 - 17.00 WIB).", is_active: true },
          { id: "KB-3", category: "Layanan", intent: "general", patterns: JSON.stringify(["baptisan", "baptis air", "daftar baptis", "syarat baptis"]), bot_response: "Pendaftaran Baptisan Air dapat dilakukan secara online melalui menu Layanan -> Baptisan di website ini. Siapkan foto dan data diri Anda.", is_active: true },
          { id: "KB-4", category: "Layanan", intent: "general", patterns: JSON.stringify(["permohonan doa", "minta doa", "titip doa", "doa"]), bot_response: "Anda dapat mengirimkan Permohonan Doa melalui menu Layanan -> Permohonan Doa di website ini. Tim pendoa kami siap mendoakan pergumulan Anda.", is_active: true }
        ];
        for (const item of defaultKbs) {
          await pool.query(
            `INSERT INTO knowledge_base (id, category, intent, patterns, bot_response, is_active) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
            [item.id, item.category, item.intent, item.patterns, item.bot_response, item.is_active]
          );
        }
      }
    } catch (seedErr) {
      console.error("Knowledge base seeding error:", seedErr);
    }
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prayer_requests (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        nama VARCHAR(255),
        request TEXT,
        isi_doa TEXT,
        kategori VARCHAR(100),
        privasi VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Baru',
        no_hp VARCHAR(50),
        tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    schemaInitialized = true;
  } catch (e) {
    console.error("Auto schema creation error:", e);
  }
};

const queryWithAutoTable = async (queryText: string, values?: any[]) => {
  await ensureSchema();
  try {
    return await pool!.query(queryText, values);
  } catch (err: any) {
    if (err && err.code === '42P01') { // 42P01 = undefined_table
      schemaInitialized = false;
      await ensureSchema();
      return await pool!.query(queryText, values);
    }
    throw err;
  }
};

// Helper function to generate ID
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ JEMAAT CRUD ============
router.get("/jemaat", async (req, res) => {
  try {
    checkPostgres();
    let result = await pool!.query("SELECT * FROM jemaat ORDER BY created_at DESC");
    
    if (result.rows.length === 0) {
      const parsedPath = path.resolve(process.cwd(), './data_jemaat_parsed.json');
      if (fs.existsSync(parsedPath)) {
        try {
          const parsedData = JSON.parse(fs.readFileSync(parsedPath, 'utf-8'));
          for (const item of parsedData) {
            await pool!.query(`
              INSERT INTO jemaat (id, nama, nik, gender, tempat_lahir, tanggal_lahir, alamat, no_hp, status_jemaat, wadah, rayon)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (id) DO UPDATE SET
                nama = EXCLUDED.nama,
                gender = EXCLUDED.gender,
                tanggal_lahir = EXCLUDED.tanggal_lahir,
                status_jemaat = EXCLUDED.status_jemaat,
                wadah = EXCLUDED.wadah,
                rayon = EXCLUDED.rayon;
            `, [
              item.id, item.nama, item.nik, item.gender, item.tempat_lahir,
              item.tanggal_lahir, item.alamat, item.no_hp, item.status_jemaat || 'Aktif',
              item.wadah, item.rayon
            ]);
          }
          result = await pool!.query("SELECT * FROM jemaat ORDER BY created_at DESC");
        } catch (seedErr) {
          console.error("Error auto-seeding jemaat table:", seedErr);
        }
      }
    }

    const data = result.rows.map(row => ({
      ...row,
      tempatLahir: row.tempat_lahir || row.tempatLahir || '',
      tanggalLahir: row.tanggal_lahir ? (typeof row.tanggal_lahir === 'string' ? row.tanggal_lahir.split('T')[0] : new Date(row.tanggal_lahir).toISOString().split('T')[0]) : '',
      noHp: row.no_hp || row.noHp || '',
      statusPernikahan: row.status_pernikahan || row.statusPernikahan || '',
      statusJemaat: row.status_jemaat || row.statusJemaat || 'Aktif',
      kategoriKaum: row.kategori_kaum || row.kategoriKaum || '',
      noTelepon: row.no_telepon || row.noTelepon || '',
      anggotaKeluarga: row.anggota_keluarga || row.anggotaKeluarga || []
    }));
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/jemaat", async (req, res) => {
  try {
    checkPostgres();
    const {
      nama, nik, gender, tempat_lahir, tanggal_lahir, alamat,
      no_hp, status_pernikahan, status_jemaat, kategori_kaum,
      sektor, wadah, rayon, no_telepon, anggota_keluarga
    } = req.body;

    const id = generateId("JEM");
    const query = `
      INSERT INTO jemaat (
        id, nama, nik, gender, tempat_lahir, tanggal_lahir, alamat,
        no_hp, status_pernikahan, status_jemaat, kategori_kaum,
        sektor, wadah, rayon, no_telepon, anggota_keluarga
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    const values = [
      id, nama, nik, gender, tempat_lahir, tanggal_lahir, alamat,
      no_hp, status_pernikahan, status_jemaat, kategori_kaum,
      sektor, wadah, rayon, no_telepon, anggota_keluarga ? JSON.stringify(anggota_keluarga) : null
    ];

    const result = await pool!.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/jemaat/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const {
      nama, nik, gender, tempat_lahir, tanggal_lahir, alamat,
      no_hp, status_pernikahan, status_jemaat, kategori_kaum,
      sektor, wadah, rayon, no_telepon, anggota_keluarga
    } = req.body;

    const query = `
      UPDATE jemaat SET
        nama = $1, nik = $2, gender = $3, tempat_lahir = $4, tanggal_lahir = $5,
        alamat = $6, no_hp = $7, status_pernikahan = $8, status_jemaat = $9,
        kategori_kaum = $10, sektor = $11, wadah = $12, rayon = $13,
        no_telepon = $14, anggota_keluarga = $15
      WHERE id = $16
      RETURNING *
    `;
    const values = [
      nama, nik, gender, tempat_lahir, tanggal_lahir, alamat,
      no_hp, status_pernikahan, status_jemaat, kategori_kaum,
      sektor, wadah, rayon, no_telepon, anggota_keluarga ? JSON.stringify(anggota_keluarga) : null,
      id
    ];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Jemaat not found" });
    } else {
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/jemaat/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM jemaat WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Jemaat not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/import-excel-jemaat", async (req, res) => {
  try {
    const excelPath = path.resolve(process.cwd(), './data jemaat/PI_Data Jemaat_Tugas Daniel (1).xlsx');
    if (!fs.existsSync(excelPath)) {
      return res.status(404).json({ success: false, message: "File Excel data jemaat tidak ditemukan di server" });
    }

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData: any[] = xlsx.utils.sheet_to_json(sheet);

    const wadahMap: Record<number, string> = {
      1: 'Wadah 1',
      2: 'Wadah 2',
      3: 'Wadah 3',
      4: 'Wadah 4',
      5: 'Wadah 5'
    };

    const rayonMap: Record<number, string> = {
      1: 'Rayon 1',
      2: 'Rayon 2',
      3: 'Rayon 3',
      4: 'Rayon 4'
    };

    const formatTanggal = (val: any) => {
      if (!val) return '1990-01-01';
      if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
      }
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
      return '1990-01-01';
    };

    let importedCount = 0;
    const jemaatsToSave: any[] = [];

    rawData.forEach((row: any, idx: number) => {
      const nama = (row.nama || row.Nama || `Jemaat ${idx + 1}`).toString().trim();
      const genderRaw = (row.jenis_kelamin || row.gender || 'Pria').toString().trim();
      const gender = (genderRaw.toLowerCase() === 'wanita' || genderRaw.toLowerCase() === 'perempuan') ? 'Wanita' : 'Pria';
      const tempat_lahir = (row.tempat_lahir || 'Depok').toString().trim();
      const tanggal_lahir = formatTanggal(row.tanggal_lahir);
      const alamat = (row.alamat || '-').toString().trim();
      const no_wa = (row.no_wa || row.no_hp || row.no_telp || '-').toString().replace(/[^0-9+]/g, '');
      const no_hp = no_wa.length > 5 ? no_wa : '-';

      const rawNik = row.nik || row.NIK;
      const nik = (rawNik && rawNik.toString().trim() !== '-' && rawNik.toString().trim() !== '') 
        ? rawNik.toString().trim() 
        : `327500${String(idx + 1).padStart(10, '0')}`;

      const wadah = row.wadah_id && wadahMap[row.wadah_id] ? wadahMap[row.wadah_id] : `Wadah ${row.wadah_id || 1}`;
      const rayon = row.rayon_id && rayonMap[row.rayon_id] ? rayonMap[row.rayon_id] : `Rayon ${row.rayon_id || 1}`;

      jemaatsToSave.push({
        id: `JEM-${String(idx + 1).padStart(4, '0')}`,
        nama,
        nik,
        gender,
        tempat_lahir,
        tanggal_lahir,
        alamat,
        no_hp,
        status_jemaat: 'Aktif',
        wadah,
        rayon
      });
    });

    if (pool) {
      try {
        try {
          await queryWithAutoTable(`
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
          `);
          await pool.query(`ALTER TABLE jemaat DROP CONSTRAINT IF EXISTS jemaat_nik_key;`);
        } catch (tErr) {
          // Table already exists
        }

        // Ensure Wadah 1-5 default rows exist with accurate counts
        const defaultWadahList = [
          { id: 'WAD-001', nama: 'Kaum Muda', ketua: 'Joyhill Abineno', min: 21, max: 30, count: 64 },
          { id: 'WAD-002', nama: 'Kaum Pria', ketua: 'Mardongan Simanjuntak', min: 31, max: 100, count: 80 },
          { id: 'WAD-003', nama: 'Kaum Remaja', ketua: 'Chloe Davincia Michelle', min: 14, max: 20, count: 23 },
          { id: 'WAD-004', nama: 'Kaum Wanita', ketua: 'Ester Wuarlela', min: 31, max: 100, count: 136 },
          { id: 'WAD-005', nama: 'Sekolah Minggu', ketua: 'Seresy Matius', min: 1, max: 13, count: 68 }
        ];

        for (const w of defaultWadahList) {
          try {
            await pool.query(`
              INSERT INTO wadah (id, nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO UPDATE SET
                nama_wadah = EXCLUDED.nama_wadah,
                ketua_wadah = EXCLUDED.ketua_wadah,
                umur_minimal = EXCLUDED.umur_minimal,
                umur_maksimal = EXCLUDED.umur_maksimal,
                jumlah_anggota = EXCLUDED.jumlah_anggota;
            `, [w.id, w.nama, w.ketua, w.min, w.max, w.count]);
          } catch (wErr) {}
        }

        // Ensure Rayon 1-4 default rows exist
        const defaultRayonList = [
          { id: 'RAY-001', nama: 'Rayon 1', ketua: 'Suci Br Kembaren', count: 78 },
          { id: 'RAY-002', nama: 'Rayon 2', ketua: 'Tarningsih', count: 83 },
          { id: 'RAY-003', nama: 'Rayon 3', ketua: 'Harliarso', count: 123 },
          { id: 'RAY-004', nama: 'Rayon 4', ketua: 'Mega Sihombing', count: 87 }
        ];

        for (const r of defaultRayonList) {
          try {
            await pool.query(`
              INSERT INTO rayon (id, nama_rayon, ketua_rayon, jumlah_anggota)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (id) DO UPDATE SET
                nama_rayon = EXCLUDED.nama_rayon,
                ketua_rayon = EXCLUDED.ketua_rayon,
                jumlah_anggota = EXCLUDED.jumlah_anggota;
            `, [r.id, r.nama, r.ketua, r.count]);
          } catch (rErr) {}
        }

        for (const item of jemaatsToSave) {
          const query = `
            INSERT INTO jemaat (id, nama, nik, gender, tempat_lahir, tanggal_lahir, alamat, no_hp, status_jemaat, wadah, rayon)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              nama = EXCLUDED.nama,
              nik = EXCLUDED.nik,
              gender = EXCLUDED.gender,
              tempat_lahir = EXCLUDED.tempat_lahir,
              tanggal_lahir = EXCLUDED.tanggal_lahir,
              alamat = EXCLUDED.alamat,
              no_hp = EXCLUDED.no_hp,
              wadah = EXCLUDED.wadah,
              rayon = EXCLUDED.rayon;
          `;
          await queryWithAutoTable(query, [
            item.id, item.nama, item.nik, item.gender, item.tempat_lahir,
            item.tanggal_lahir, item.alamat, item.no_hp, item.status_jemaat,
            item.wadah, item.rayon
          ]);
          importedCount++;
        }
      } catch (dbErr) {
        console.error("Database import excel error, fallbacking to memory:", dbErr);
      }
    }

    if (importedCount === 0) {
      (inMemoryDB as any).jemaat = jemaatsToSave;
      importedCount = jemaatsToSave.length;
    }

    res.json({ success: true, count: importedCount, message: `Berhasil mengimpor ${importedCount} data jemaat dari file Excel.` });
  } catch (error: any) {
    console.error("Error importing excel jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ SCHEDULES CRUD ============
router.get("/schedules", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM schedules ORDER BY created_at DESC");
    // Convert snake_case to camelCase for frontend
    const data = result.rows.map(row => ({
      id: row.id,
      judul: row.judul,
      tanggal: row.tanggal ? (typeof row.tanggal === 'string' ? row.tanggal.split('T')[0] : new Date(row.tanggal).toISOString().split('T')[0]) : '',
      waktu: row.waktu,
      lokasi: row.lokasi,
      deskripsi: row.deskripsi,
      isRegistrationRequired: row.is_registration_required,
      hariJam: row.hari_jam,
      kategori: row.kategori,
      kuota: row.kuota,
      terdaftar: row.terdaftar,
      registrationFee: row.registration_fee,
      needPaymentProof: row.need_payment_proof,
      createdAt: row.created_at
    }));
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/schedules", async (req, res) => {
  try {
    checkPostgres();
    const {
      judul, tanggal, waktu, lokasi, deskripsi, is_registration_required,
      hari_jam, kategori, kuota, terdaftar, registration_fee, need_payment_proof
    } = req.body;

    const finalTanggal = (tanggal && typeof tanggal === 'string' && tanggal.trim() !== '') ? tanggal : new Date().toISOString().split('T')[0];
    const finalWaktu = (waktu && typeof waktu === 'string' && waktu.trim() !== '') ? waktu : null;
    const id = generateId("SCH");
    const query = `
      INSERT INTO schedules (
        id, judul, tanggal, waktu, lokasi, deskripsi, is_registration_required,
        hari_jam, kategori, kuota, terdaftar, registration_fee, need_payment_proof
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      id, judul, finalTanggal, finalWaktu, lokasi, deskripsi,
      is_registration_required || false, hari_jam, kategori,
      kuota || 0, terdaftar || 0, registration_fee, need_payment_proof || false
    ];

    const result = await pool!.query(query, values);
    // Convert snake_case to camelCase for frontend
    const row = result.rows[0];
    const data = {
      id: row.id,
      judul: row.judul,
      tanggal: row.tanggal,
      waktu: row.waktu,
      lokasi: row.lokasi,
      deskripsi: row.deskripsi,
      isRegistrationRequired: row.is_registration_required,
      hariJam: row.hari_jam,
      kategori: row.kategori,
      kuota: row.kuota,
      terdaftar: row.terdaftar,
      registrationFee: row.registration_fee,
      needPaymentProof: row.need_payment_proof,
      createdAt: row.created_at
    };
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/schedules/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const {
      judul, tanggal, waktu, lokasi, deskripsi, is_registration_required,
      hari_jam, kategori, kuota, terdaftar, registration_fee, need_payment_proof
    } = req.body;

    const finalTanggal = (tanggal && typeof tanggal === 'string' && tanggal.trim() !== '') ? tanggal : new Date().toISOString().split('T')[0];
    const finalWaktu = (waktu && typeof waktu === 'string' && waktu.trim() !== '') ? waktu : null;

    const query = `
      UPDATE schedules SET
        judul = $1, tanggal = $2, waktu = $3, lokasi = $4, deskripsi = $5,
        is_registration_required = $6, hari_jam = $7, kategori = $8,
        kuota = $9, terdaftar = $10, registration_fee = $11, need_payment_proof = $12
      WHERE id = $13
      RETURNING *
    `;
    const values = [
      judul, finalTanggal, finalWaktu, lokasi, deskripsi,
      is_registration_required || false, hari_jam, kategori,
      kuota || 0, terdaftar || 0, registration_fee, need_payment_proof || false,
      id
    ];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Schedule not found" });
    } else {
      // Convert snake_case to camelCase for frontend
      const row = result.rows[0];
      const data = {
        id: row.id,
        judul: row.judul,
        tanggal: row.tanggal,
        waktu: row.waktu,
        lokasi: row.lokasi,
        deskripsi: row.deskripsi,
        isRegistrationRequired: row.is_registration_required,
        hariJam: row.hari_jam,
        kategori: row.kategori,
        kuota: row.kuota,
        terdaftar: row.terdaftar,
        registrationFee: row.registration_fee,
        needPaymentProof: row.need_payment_proof,
        createdAt: row.created_at
      };
      res.json({ success: true, data });
    }
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/schedules/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM schedules WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Schedule not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ HERO SLIDES CRUD ============
router.get("/hero-slides", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM hero_slides ORDER BY order_index ASC");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Error fetching hero slides:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/hero-slides", async (req, res) => {
  try {
    checkPostgres();
    const { title, image_url, link_url, is_active, order_index, subtitle, badge, cta_text, cta_type, event_name } = req.body;

    const id = generateId("HS");
    const query = `
      INSERT INTO hero_slides (
        id, title, image_url, link_url, is_active, order_index,
        subtitle, badge, cta_text, cta_type, event_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      id, title, image_url, link_url, is_active !== undefined ? is_active : true,
      order_index || 0, subtitle, badge, cta_text, cta_type, event_name
    ];

    const result = await pool!.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating hero slide:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/hero-slides/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const { title, image_url, link_url, is_active, order_index, subtitle, badge, cta_text, cta_type, event_name } = req.body;

    const query = `
      UPDATE hero_slides SET
        title = $1, image_url = $2, link_url = $3, is_active = $4, order_index = $5,
        subtitle = $6, badge = $7, cta_text = $8, cta_type = $9, event_name = $10
      WHERE id = $11
      RETURNING *
    `;
    const values = [
      title, image_url, link_url, is_active !== undefined ? is_active : true,
      order_index || 0, subtitle, badge, cta_text, cta_type, event_name, id
    ];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Hero slide not found" });
    } else {
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating hero slide:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/hero-slides/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM hero_slides WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Hero slide not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting hero slide:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ANNOUNCEMENTS CRUD ============
router.get("/announcements", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM announcements ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/announcements", async (req, res) => {
  try {
    checkPostgres();
    const { judul, konten, tanggal, is_active, ringkasan, isi, penting, gambar_url } = req.body;

    const id = generateId("ANN");
    const query = `
      INSERT INTO announcements (
        id, judul, konten, tanggal, is_active, ringkasan, isi, penting, gambar_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      id, judul, konten, tanggal, is_active !== undefined ? is_active : true,
      ringkasan, isi, penting || false, gambar_url
    ];

    const result = await pool!.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/announcements/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const { judul, konten, tanggal, is_active, ringkasan, isi, penting, gambar_url } = req.body;

    const query = `
      UPDATE announcements SET
        judul = $1, konten = $2, tanggal = $3, is_active = $4,
        ringkasan = $5, isi = $6, penting = $7, gambar_url = $8
      WHERE id = $9
      RETURNING *
    `;
    const values = [
      judul, konten, tanggal, is_active !== undefined ? is_active : true,
      ringkasan, isi, penting || false, gambar_url, id
    ];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Announcement not found" });
    } else {
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/announcements/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM announcements WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Announcement not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ WARTA JEMAAT CRUD ============
router.get("/warta-jemaat", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM warta_jemaat ORDER BY created_at DESC");
    const data = result.rows.map(row => ({
      ...row,
      pdfUrl: row.pdf_url || row.pdfUrl || '',
      temaMinggu: row.tema_minggu || row.temaMinggu || '',
      ayatMinggu: row.ayat_minggu || row.ayatMinggu || '',
      petugasList: row.petugas_list || row.petugasList || []
    }));
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching warta jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/warta-jemaat", async (req, res) => {
  try {
    checkPostgres();
    const { judul, tanggal, pdf_url, petugas_list, edisi, tema_minggu, ayat_minggu, pengumuman } = req.body;

    const finalJudul = judul || (edisi ? `Warta Edisi ${edisi}` : 'Warta Jemaat');
    const finalTanggal = tanggal || new Date().toISOString().split('T')[0];
    const id = generateId("WJ");
    const query = `
      INSERT INTO warta_jemaat (
        id, judul, tanggal, pdf_url, petugas_list, edisi, tema_minggu, ayat_minggu, pengumuman
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      id, finalJudul, finalTanggal, pdf_url,
      petugas_list ? JSON.stringify(petugas_list) : null,
      edisi, tema_minggu, ayat_minggu, pengumuman
    ];

    const result = await pool!.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating warta jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/warta-jemaat/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const { judul, tanggal, pdf_url, petugas_list, edisi, tema_minggu, ayat_minggu, pengumuman } = req.body;

    const query = `
      UPDATE warta_jemaat SET
        judul = $1, tanggal = $2, pdf_url = $3, petugas_list = $4,
        edisi = $5, tema_minggu = $6, ayat_minggu = $7, pengumuman = $8
      WHERE id = $9
      RETURNING *
    `;
    const values = [
      judul, tanggal, pdf_url,
      petugas_list ? JSON.stringify(petugas_list) : null,
      edisi, tema_minggu, ayat_minggu, pengumuman, id
    ];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Warta jemaat not found" });
    } else {
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating warta jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/warta-jemaat/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM warta_jemaat WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Warta jemaat not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting warta jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ REGISTRATIONS CRUD ============
router.get("/registrations", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM registrations ORDER BY created_at DESC");
    // Convert snake_case to camelCase for frontend
    const data = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      namaPendaftar: row.nama_pendaftar || row.namaPendaftar || row.nama || 'Pendaftar Baru',
      nik: row.nik,
      gender: row.gender,
      tempatLahir: row.tempat_lahir || row.tempatLahir || '',
      tanggalLahir: row.tanggal_lahir || row.tanggalLahir || '',
      alamat: row.alamat,
      noHp: row.no_hp || row.noHp || '-',
      lampiranKtp: row.lampiran_ktp,
      lampiranBuktiBayar: row.lampiran_bukti_bayar,
      status: row.status,
      statusNote: row.status_note,
      anggotaKeluarga: row.anggota_keluarga,
      rayon: row.rayon,
      jenisKegiatan: row.jenis_kegiatan || row.jenisKegiatan || '-',
      tanggalDaftar: row.tanggal_daftar || row.created_at,
      createdAt: row.created_at
    }));
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/registrations", async (req, res) => {
  try {
    checkPostgres();
    const {
      type, status, status_note, anggota_keluarga, rayon
    } = req.body;

    const nama_pendaftar = req.body.nama_pendaftar || req.body.namaPendaftar;
    const nik = req.body.nik;
    const gender = req.body.gender;
    const tempat_lahir = req.body.tempat_lahir || req.body.tempatLahir;
    const tanggal_lahir = req.body.tanggal_lahir || req.body.tanggalLahir;
    const alamat = req.body.alamat;
    const no_hp = req.body.no_hp || req.body.noHp;
    const lampiran_ktp = req.body.lampiran_ktp || req.body.lampiranKtp;
    const lampiran_bukti_bayar = req.body.lampiran_bukti_bayar || req.body.lampiranBuktiBayar;
    const jenis_kegiatan = req.body.jenis_kegiatan || req.body.jenisKegiatan;
    const tanggal_daftar = req.body.tanggal_daftar || req.body.tanggalDaftar || new Date().toISOString();

    const id = generateId("REG");
    const query = `
      INSERT INTO registrations (
        id, type, nama_pendaftar, nik, gender, tempat_lahir, tanggal_lahir,
        alamat, no_hp, lampiran_ktp, lampiran_bukti_bayar, status,
        status_note, anggota_keluarga, rayon, jenis_kegiatan, tanggal_daftar
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    const values = [
      id, type, nama_pendaftar, nik, gender, tempat_lahir, tanggal_lahir,
      alamat, no_hp, lampiran_ktp, lampiran_bukti_bayar,
      status || 'Pending', status_note,
      anggota_keluarga ? JSON.stringify(anggota_keluarga) : null,
      rayon, jenis_kegiatan, tanggal_daftar
    ];

    const result = await pool!.query(query, values);
    // Convert snake_case to camelCase for frontend
    const row = result.rows[0];
    const data = {
      id: row.id,
      type: row.type,
      namaPendaftar: row.nama_pendaftar,
      nik: row.nik,
      gender: row.gender,
      tempatLahir: row.tempat_lahir,
      tanggalLahir: row.tanggal_lahir,
      alamat: row.alamat,
      noHp: row.no_hp,
      lampiranKtp: row.lampiran_ktp,
      lampiranBuktiBayar: row.lampiran_bukti_bayar,
      status: row.status,
      statusNote: row.status_note,
      anggotaKeluarga: row.anggota_keluarga,
      rayon: row.rayon,
      jenisKegiatan: row.jenis_kegiatan,
      tanggalDaftar: row.tanggal_daftar,
      createdAt: row.created_at
    };
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error creating registration:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/registrations/:id/status", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const { status, status_note } = req.body;

    const query = `
      UPDATE registrations SET status = $1, status_note = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool!.query(query, [status, status_note, id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Registration not found" });
    } else {
      // Auto insert into jemaat if approved
      if (status === "Disetujui") {
        const reg = result.rows[0];
        if (reg.type === "jemaat_baru" || reg.type === "pendataan_terdaftar") {
          const jemaatId = generateId("JEM");

          // Determine Wadah
          let computedWadah = 'Kaum Pria';
          const genderLower = (reg.gender || '').toLowerCase();
          let age = 35;
          if (reg.tanggal_lahir) {
            const birthStr = reg.tanggal_lahir.toString().split('T')[0];
            const parts = birthStr.split('-');
            if (parts.length === 3) {
              const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
            }
          }
          if (age <= 13) computedWadah = 'Sekolah Minggu';
          else if (age <= 20) computedWadah = 'Kaum Remaja';
          else if (age <= 30) computedWadah = 'Kaum Muda';
          else if (genderLower === 'wanita' || genderLower === 'perempuan') computedWadah = 'Kaum Wanita';
          else computedWadah = 'Kaum Pria';

          const jemaatQuery = `
            INSERT INTO jemaat (
              id, nama, nik, gender, tempat_lahir, tanggal_lahir,
              alamat, no_hp, status_jemaat, anggota_keluarga, rayon, wadah
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `;
          await pool!.query(jemaatQuery, [
            jemaatId, reg.nama_pendaftar, reg.nik, reg.gender,
            reg.tempat_lahir, reg.tanggal_lahir, reg.alamat,
            reg.no_hp, 'Aktif', reg.anggota_keluarga, reg.rayon || 'Rayon 1', computedWadah
          ]);
        }
      }
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating registration status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/registrations/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM registrations WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Registration not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting registration:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ KNOWLEDGE BASE CRUD ============
router.get("/knowledge-base", async (req, res) => {
  try {
    let rows: any[] = [];
    if (pool) {
      try {
        const result = await queryWithAutoTable("SELECT * FROM knowledge_base ORDER BY created_at DESC");
        rows = result.rows;
      } catch (dbErr) {
        console.error("Database fetch knowledge base error:", dbErr);
      }
    }

    if (!pool || rows.length === 0) {
      rows = (inMemoryDB as any).knowledgeBase || [];
    }

    const data = rows.map(r => {
      let patterns: string[] = [];
      if (Array.isArray(r.patterns)) {
        patterns = r.patterns;
      } else if (typeof r.patterns === 'string') {
        const trimmed = r.patterns.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed);
            patterns = Array.isArray(parsed) ? parsed : [trimmed];
          } catch {
            patterns = trimmed.split(',').map((s: string) => s.trim());
          }
        } else {
          patterns = trimmed.split(',').map((s: string) => s.trim());
        }
      }
      return {
        id: r.id,
        category: r.category || 'Umum',
        intent: r.intent || 'general',
        patterns: patterns.filter(Boolean),
        botResponse: r.bot_response || r.botResponse || '',
        isActive: r.is_active !== undefined ? r.is_active : (r.isActive !== undefined ? r.isActive : true),
        lastUpdated: r.last_updated || r.lastUpdated || r.created_at || new Date().toISOString()
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching knowledge base:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/knowledge-base", async (req, res) => {
  try {
    const category = (req.body.category || "Umum").toString();
    const intent = (req.body.intent || "general").toString();
    const rawPatterns = req.body.patterns || [];
    const patterns = Array.isArray(rawPatterns) 
      ? rawPatterns 
      : (typeof rawPatterns === 'string' ? rawPatterns.split(',').map(s => s.trim()) : [rawPatterns]);
    const patternStr = patterns.join(', ');
    const patternsJson = JSON.stringify(patterns);
    const bot_response = (req.body.bot_response || req.body.botResponse || "").toString();
    const is_active = req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== undefined ? req.body.isActive : true);

    const id = generateId("KB");
    let savedItem: any = null;
    let lastError: any = null;

    if (pool) {
      try {
        let result: any;
        try {
          const query1 = `
            INSERT INTO knowledge_base (id, category, intent, patterns, bot_response, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;
          result = await queryWithAutoTable(query1, [id, category, intent, patternStr, bot_response, is_active]);
        } catch (err1) {
          try {
            const query2 = `
              INSERT INTO knowledge_base (id, category, intent, patterns, bot_response, is_active)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *
            `;
            result = await queryWithAutoTable(query2, [id, category, intent, patternsJson, bot_response, is_active]);
          } catch (err2) {
            const query3 = `
              INSERT INTO knowledge_base (id, category, intent, patterns, bot_response, is_active)
              VALUES ($1, $2, $3, $4::jsonb, $5, $6)
              RETURNING *
            `;
            result = await queryWithAutoTable(query3, [id, category, intent, patternsJson, bot_response, is_active]);
          }
        }

        if (result && result.rows && result.rows.length > 0) {
          const row = result.rows[0];
          savedItem = {
            id: row.id,
            category: row.category || category,
            intent: row.intent || intent,
            patterns,
            botResponse: row.bot_response || row.botResponse || bot_response,
            isActive: row.is_active !== undefined ? row.is_active : is_active,
            lastUpdated: new Date().toISOString()
          };
        }
      } catch (dbErr: any) {
        console.error("Database insert knowledge base error:", dbErr);
        lastError = dbErr;
      }
    }

    if (!savedItem) {
      if (pool && lastError) {
        return res.status(500).json({ success: false, message: `Database insert failed: ${lastError.message}` });
      }
      savedItem = {
        id,
        category,
        intent,
        patterns,
        botResponse: bot_response,
        isActive: is_active,
        lastUpdated: new Date().toISOString()
      };
    }

    (inMemoryDB as any).knowledgeBase = (inMemoryDB as any).knowledgeBase || [];
    const idx = (inMemoryDB as any).knowledgeBase.findIndex((k: any) => k.id === id);
    if (idx >= 0) {
      (inMemoryDB as any).knowledgeBase[idx] = savedItem;
    } else {
      (inMemoryDB as any).knowledgeBase.unshift(savedItem);
    }
    saveInMemoryDBToDisk(inMemoryDB);

    res.json({ success: true, data: savedItem });
  } catch (error: any) {
    console.error("Error creating knowledge base:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/knowledge-base/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = (req.body.category || "Umum").toString();
    const intent = (req.body.intent || "general").toString();
    const rawPatterns = req.body.patterns || [];
    const patterns = Array.isArray(rawPatterns) 
      ? rawPatterns 
      : (typeof rawPatterns === 'string' ? rawPatterns.split(',').map(s => s.trim()) : [rawPatterns]);
    const patternStr = patterns.join(', ');
    const patternsJson = JSON.stringify(patterns);
    const bot_response = (req.body.bot_response || req.body.botResponse || "").toString();
    const is_active = req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== undefined ? req.body.isActive : true);

    let updatedItem: any = null;
    let lastError: any = null;

    if (pool) {
      try {
        let result: any;
        try {
          const query1 = `
            UPDATE knowledge_base SET
              category = $1, intent = $2, patterns = $3, bot_response = $4, is_active = $5, last_updated = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
          `;
          result = await queryWithAutoTable(query1, [category, intent, patternStr, bot_response, is_active, id]);
        } catch (err1) {
          try {
            const query2 = `
              UPDATE knowledge_base SET
                category = $1, intent = $2, patterns = $3, bot_response = $4, is_active = $5, last_updated = CURRENT_TIMESTAMP
              WHERE id = $6
              RETURNING *
            `;
            result = await queryWithAutoTable(query2, [category, intent, patternsJson, bot_response, is_active, id]);
          } catch (err2) {
            const query3 = `
              UPDATE knowledge_base SET
                category = $1, intent = $2, patterns = $3::jsonb, bot_response = $4, is_active = $5, last_updated = CURRENT_TIMESTAMP
              WHERE id = $6
              RETURNING *
            `;
            result = await queryWithAutoTable(query3, [category, intent, patternsJson, bot_response, is_active, id]);
          }
        }

        if (result && result.rows && result.rows.length > 0) {
          const row = result.rows[0];
          updatedItem = {
            id: row.id,
            category: row.category || category,
            intent: row.intent || intent,
            patterns,
            botResponse: row.bot_response || row.botResponse || bot_response,
            isActive: row.is_active !== undefined ? row.is_active : is_active,
            lastUpdated: new Date().toISOString()
          };
        }
      } catch (dbErr: any) {
        console.error("Database update knowledge base error:", dbErr);
        lastError = dbErr;
      }
    }

    if (!updatedItem) {
      if (pool && lastError) {
        return res.status(500).json({ success: false, message: `Database update failed: ${lastError.message}` });
      }
      updatedItem = {
        id,
        category,
        intent,
        patterns,
        botResponse: bot_response,
        isActive: is_active,
        lastUpdated: new Date().toISOString()
      };
    }

    (inMemoryDB as any).knowledgeBase = (inMemoryDB as any).knowledgeBase || [];
    (inMemoryDB as any).knowledgeBase = (inMemoryDB as any).knowledgeBase.map((k: any) => k.id === id ? updatedItem : k);
    saveInMemoryDBToDisk(inMemoryDB);

    res.json({ success: true, data: updatedItem });
  } catch (error: any) {
    console.error("Error updating knowledge base:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/knowledge-base/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (pool) {
      try {
        await queryWithAutoTable("DELETE FROM knowledge_base WHERE id = $1", [id]);
      } catch (dbErr) {
        console.error("Database delete knowledge base error:", dbErr);
      }
    }
    if ((inMemoryDB as any).knowledgeBase) {
      (inMemoryDB as any).knowledgeBase = (inMemoryDB as any).knowledgeBase.filter((k: any) => k.id !== id);
      saveInMemoryDBToDisk(inMemoryDB);
    }
    res.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    console.error("Error deleting knowledge base:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PRAYER REQUESTS CRUD ============
router.get("/prayers", async (req, res) => {
  try {
    let rows: any[] = [];
    if (pool) {
      try {
        const result = await queryWithAutoTable("SELECT * FROM prayer_requests ORDER BY created_at DESC");
        rows = result.rows;
      } catch (dbErr) {
        console.error("Database fetch prayers error:", dbErr);
      }
    }

    if (rows.length === 0) {
      rows = (inMemoryDB as any).prayerRequests || [];
    }

    const data = rows.map(r => ({
      id: r.id,
      name: r.name || r.nama || 'Anonim',
      nama: r.name || r.nama || 'Anonim',
      request: r.request || r.isi_doa || r.isiDoa || '',
      isiDoa: r.request || r.isi_doa || r.isiDoa || '',
      kategori: r.kategori || 'Umum',
      privasi: r.privasi || 'Publik',
      status: r.status || 'Baru',
      noHp: r.no_hp || r.noHp || '-',
      createdAt: r.created_at || r.createdAt
    }));

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching prayer requests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/prayers", async (req, res) => {
  try {
    const name = (req.body.name || req.body.nama || "Anonim").toString();
    const request = (req.body.request || req.body.isiDoa || req.body.isi_doa || "-").toString();
    const kategori = (req.body.kategori || "Umum").toString();
    const privasi = (req.body.privasi || "Publik").toString();
    const status = (req.body.status || "Baru").toString();
    const no_hp = (req.body.noHp || req.body.no_hp || "-").toString();

    const id = generateId("PR");

    if (pool) {
      try {
        const query = `
          INSERT INTO prayer_requests (id, name, nama, request, isi_doa, kategori, privasi, status, no_hp)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;
        const values = [id, name, name, request, request, kategori, privasi, status, no_hp];
        const result = await queryWithAutoTable(query, values);
        if (result.rows.length > 0) {
          const row = result.rows[0];
          return res.json({
            success: true,
            data: {
              ...row,
              name: row.name || row.nama,
              nama: row.name || row.nama,
              request: row.request || row.isi_doa,
              isiDoa: row.request || row.isi_doa,
              noHp: row.no_hp
            }
          });
        }
      } catch (dbErr) {
        console.error("Database insert prayer error, using fallback:", dbErr);
      }
    }

    const fallbackItem = {
      id,
      name,
      nama: name,
      request,
      isiDoa: request,
      kategori,
      privasi,
      status,
      noHp: no_hp,
      createdAt: new Date().toISOString()
    };
    (inMemoryDB as any).prayerRequests = (inMemoryDB as any).prayerRequests || [];
    (inMemoryDB as any).prayerRequests.push(fallbackItem);
    res.json({ success: true, data: fallbackItem });
  } catch (error: any) {
    console.error("Error creating prayer request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/registrations/:id/status", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const { status, status_note } = req.body;

    const query = `
      UPDATE registrations SET status = $1, status_note = $2
      WHERE id = $3
      RETURNING *
    `;
    const values = [status, status_note, id];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Registration not found" });
    } else {
      const row = result.rows[0];

      // Auto-insert into jemaat table if new jemaat registration is approved
      if (status === 'Disetujui' && (row.type === 'jemaat_baru' || row.type === 'pendataan_terdaftar')) {
        try {
          const jId = generateId("JEM");
          const tglStr = row.tanggal_lahir ? (typeof row.tanggal_lahir === 'string' ? row.tanggal_lahir.split('T')[0] : new Date(row.tanggal_lahir).toISOString().split('T')[0]) : null;
          let age = 30;
          if (tglStr) {
            const parts = tglStr.split(/[-/]/);
            if (parts.length === 3) {
              let year = 0, month = 0, day = 0;
              if (parseInt(parts[0]) > 1000) { year = parseInt(parts[0]); month = parseInt(parts[1]) - 1; day = parseInt(parts[2]); }
              else if (parseInt(parts[2]) > 1000) { year = parseInt(parts[2]); month = parseInt(parts[1]) - 1; day = parseInt(parts[0]); }
              if (year > 0) {
                const birthDate = new Date(year, month, day);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
              }
            }
          }
          let autoWadah = '';
          if (age > 0 && age <= 13) autoWadah = 'Sekolah Minggu';
          else if (age >= 14 && age <= 20) autoWadah = 'Kaum Remaja';
          else if (age >= 21 && age <= 30) autoWadah = 'Kaum Muda';
          else if ((row.gender || '').toLowerCase() === 'wanita' || (row.gender || '').toLowerCase() === 'perempuan') autoWadah = 'Kaum Wanita';
          else autoWadah = 'Kaum Pria';

          await pool!.query(`
            INSERT INTO jemaat (id, nama, nik, gender, tempat_lahir, tanggal_lahir, alamat, no_hp, status_jemaat, wadah, rayon)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING;
          `, [
            jId, row.nama_pendaftar || 'Jemaat Baru', row.nik, row.gender || 'Pria',
            row.tempat_lahir || 'Depok', tglStr, row.alamat || '-', row.no_hp || '-',
            'Aktif', autoWadah, row.rayon || 'Rayon 1'
          ]);
        } catch (jInsErr) {
          console.error("Error auto inserting new jemaat on approval:", jInsErr);
        }
      }

      // Convert snake_case to camelCase for frontend
      const data = {
        id: row.id,
        type: row.type,
        namaPendaftar: row.nama_pendaftar,
        nik: row.nik,
        gender: row.gender,
        tempatLahir: row.tempat_lahir,
        tanggalLahir: row.tanggal_lahir,
        alamat: row.alamat,
        noHp: row.no_hp,
        lampiranKtp: row.lampiran_ktp,
        lampiranBuktiBayar: row.lampiran_bukti_bayar,
        status: row.status,
        statusNote: row.status_note,
        anggotaKeluarga: row.anggota_keluarga,
        rayon: row.rayon,
        jenisKegiatan: row.jenis_kegiatan,
        tanggalDaftar: row.tanggal_daftar,
        createdAt: row.created_at
      };
      res.json({ success: true, data });
    }
  } catch (error: any) {
    console.error("Error updating registration status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/prayers/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM prayer_requests WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Prayer request not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting prayer request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ WADAH CRUD ============
router.get("/wadah", async (req, res) => {
  try {
    let wadahRows: any[] = [];
    let jemaats: any[] = [];

    if (pool) {
      try {
        const wadahRes = await queryWithAutoTable("SELECT * FROM wadah ORDER BY id ASC");
        const jemaatRes = await queryWithAutoTable("SELECT * FROM jemaat WHERE status_jemaat = 'Aktif' OR status_jemaat IS NULL");
        wadahRows = wadahRes.rows;
        jemaats = jemaatRes.rows;
      } catch (dbErr) {
        console.error("Database fetch wadah error:", dbErr);
      }
    }

    const defaultWadah = [
      { id: 'WAD-001', nama_wadah: 'Kaum Muda', ketua_wadah: 'Joyhill Abineno', umur_minimal: 20, umur_maksimal: 30, jumlah_anggota: 91 },
      { id: 'WAD-002', nama_wadah: 'Kaum Pria', ketua_wadah: 'Mardongan Simanjuntak', umur_minimal: 31, umur_maksimal: 100, jumlah_anggota: 79 },
      { id: 'WAD-003', nama_wadah: 'Kaum Remaja', ketua_wadah: 'Chloe Davincia Michelle', umur_minimal: 13, umur_maksimal: 19, jumlah_anggota: 34 },
      { id: 'WAD-004', nama_wadah: 'Kaum Wanita', ketua_wadah: 'Ester Wuarlela', umur_minimal: 31, umur_maksimal: 100, jumlah_anggota: 134 },
      { id: 'WAD-005', nama_wadah: 'Sekolah Minggu', ketua_wadah: 'Seresy Matius', umur_minimal: 1, umur_maksimal: 12, jumlah_anggota: 36 }
    ];

    if (wadahRows.length === 0) {
      if ((inMemoryDB as any).wadah && (inMemoryDB as any).wadah.length > 0) {
        wadahRows = (inMemoryDB as any).wadah;
      } else {
        wadahRows = defaultWadah;
      }
    }

    const data = wadahRows.map(w => {
      const wName = (w.nama_wadah || w.namaWadah || '').trim().toLowerCase();
      const minAge = Number(w.umur_minimal !== undefined ? w.umur_minimal : w.umurMinimal) || 0;
      const maxAge = Number(w.umur_maksimal !== undefined ? w.umur_maksimal : w.umurMaksimal) || 150;

      let count = 0;
      for (const j of jemaats) {
        const isAktif = !j.statusJemaat || j.statusJemaat === 'Aktif' || j.status_jemaat === 'Aktif';
        if (!isAktif) continue;

        let age: number | null = null;
        if (j.tanggal_lahir || j.tanggalLahir) {
          const birthStr = (j.tanggal_lahir || j.tanggalLahir).toString().split('T')[0];
          const parts = birthStr.split(/[-/]/);
          if (parts.length === 3) {
            let year = 0, month = 0, day = 0;
            if (parseInt(parts[0]) > 1000) {
              year = parseInt(parts[0]);
              month = parseInt(parts[1]) - 1;
              day = parseInt(parts[2]);
            } else if (parseInt(parts[2]) > 1000) {
              year = parseInt(parts[2]);
              month = parseInt(parts[1]) - 1;
              day = parseInt(parts[0]);
            }
            if (year > 0) {
              const birthDate = new Date(year, month, day);
              const today = new Date();
              let calculatedAge = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
              }
              age = calculatedAge;
            }
          }
        }

        let computedWadah = '';
        const jw = (j.wadah || (j as any).wadah_id || '').toString().trim();

        // 1. Explicit Wadah set in DB/Excel (Direct match)
        if (jw && jw !== 'Otomatis' && jw !== '-') {
          const jwLower = jw.toLowerCase();
          if (jw === '1' || jw === 'wad-002' || jwLower.includes('pria') || jwLower.includes('bapak')) computedWadah = 'Kaum Pria';
          else if (jw === '2' || jw === 'wad-004' || jwLower.includes('wanita') || jwLower.includes('ibu')) computedWadah = 'Kaum Wanita';
          else if (jw === '3' || jw === 'wad-005' || jwLower.includes('sekolah minggu') || jwLower.includes('anak')) computedWadah = 'Sekolah Minggu';
          else if (jw === '4' || jw === 'wad-003' || jwLower.includes('remaja')) computedWadah = 'Kaum Remaja';
          else if (jw === '5' || jw === 'wad-001' || jwLower.includes('muda') || jwLower.includes('pemuda')) computedWadah = 'Kaum Muda';
          else computedWadah = jw;
        }

        // 2. Fallback ONLY for new / unassigned jemaat:
        if (!computedWadah) {
          if (age !== null && age > 0 && age <= 13) computedWadah = 'Sekolah Minggu';
          else if (age !== null && age >= 14 && age <= 20) computedWadah = 'Kaum Remaja';
          else if (age !== null && age >= 21 && age <= 30) computedWadah = 'Kaum Muda';
          else {
            const g = (j.gender || '').trim().toLowerCase();
            if (g === 'wanita' || g === 'perempuan') computedWadah = 'Kaum Wanita';
            else computedWadah = 'Kaum Pria';
          }
        }

        let isMatch = false;
        if (wName.includes('sekolah minggu') && computedWadah === 'Sekolah Minggu') isMatch = true;
        else if (wName.includes('remaja') && computedWadah === 'Kaum Remaja') isMatch = true;
        else if (wName.includes('muda') && computedWadah === 'Kaum Muda') isMatch = true;
        else if (wName.includes('wanita') && computedWadah === 'Kaum Wanita') isMatch = true;
        else if (wName.includes('pria') && computedWadah === 'Kaum Pria') isMatch = true;
        else if (computedWadah.toLowerCase() === wName) isMatch = true;

        if (isMatch) {
          count++;
        }
      }

      if (jemaats.length === 0) {
        if (w.id === 'WAD-001' || wName.includes('muda')) count = 64;
        else if (w.id === 'WAD-002' || wName.includes('pria')) count = 80;
        else if (w.id === 'WAD-003' || wName.includes('remaja')) count = 23;
        else if (w.id === 'WAD-004' || wName.includes('wanita')) count = 136;
        else if (w.id === 'WAD-005' || wName.includes('sekolah minggu')) count = 68;
      }

      return {
        id: w.id,
        nama_wadah: w.nama_wadah || w.namaWadah,
        namaWadah: w.nama_wadah || w.namaWadah,
        ketua_wadah: w.ketua_wadah || w.ketuaWadah,
        ketuaWadah: w.ketua_wadah || w.ketuaWadah,
        umur_minimal: w.umur_minimal || w.umurMinimal || 0,
        umurMinimal: w.umur_minimal || w.umurMinimal || 0,
        umur_maksimal: w.umur_maksimal || w.umurMaksimal || 100,
        umurMaksimal: w.umur_maksimal || w.umurMaksimal || 100,
        jumlah_anggota: count,
        jumlahAnggota: count
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching wadah:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/wadah", async (req, res) => {
  try {
    const nama_wadah = (req.body.nama_wadah || req.body.namaWadah || "Wadah Baru").toString();
    const ketua_wadah = (req.body.ketua_wadah || req.body.ketuaWadah || "-").toString();
    const umur_minimal = Number(req.body.umur_minimal !== undefined ? req.body.umur_minimal : req.body.umurMinimal) || 0;
    const umur_maksimal = Number(req.body.umur_maksimal !== undefined ? req.body.umur_maksimal : req.body.umurMaksimal) || 150;
    const jumlah_anggota = Number(req.body.jumlah_anggota !== undefined ? req.body.jumlah_anggota : req.body.jumlahAnggota) || 0;

    const id = generateId("WAD");

    if (pool) {
      try {
        const query = `
          INSERT INTO wadah (
            id, nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        const values = [id, nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota];
        const result = await queryWithAutoTable(query, values);
        if (result.rows.length > 0) {
          const row = result.rows[0];
          return res.json({
            success: true,
            data: {
              ...row,
              namaWadah: row.nama_wadah,
              ketuaWadah: row.ketua_wadah,
              umurMinimal: row.umur_minimal,
              umurMaksimal: row.umur_maksimal,
              jumlahAnggota: row.jumlah_anggota
            }
          });
        }
      } catch (dbErr: any) {
        console.error("Database insert wadah error, using fallback:", dbErr);
      }
    }

    const fallbackItem = {
      id,
      nama_wadah,
      namaWadah: nama_wadah,
      ketua_wadah,
      ketuaWadah: ketua_wadah,
      umur_minimal,
      umurMinimal: umur_minimal,
      umur_maksimal,
      umurMaksimal: umur_maksimal,
      jumlah_anggota,
      jumlahAnggota: jumlah_anggota
    };
    (inMemoryDB as any).wadah = (inMemoryDB as any).wadah || [];
    (inMemoryDB as any).wadah = (inMemoryDB as any).wadah.filter((w: any) => w.id !== id);
    (inMemoryDB as any).wadah.push(fallbackItem);
    saveInMemoryDBToDisk(inMemoryDB);
    res.json({ success: true, data: fallbackItem });
  } catch (error: any) {
    console.error("Error creating wadah:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/wadah/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const nama_wadah = (req.body.nama_wadah || req.body.namaWadah || "Wadah").toString();
    const ketua_wadah = (req.body.ketua_wadah || req.body.ketuaWadah || "-").toString();
    const umur_minimal = Number(req.body.umur_minimal !== undefined ? req.body.umur_minimal : req.body.umurMinimal) || 0;
    const umur_maksimal = Number(req.body.umur_maksimal !== undefined ? req.body.umur_maksimal : req.body.umurMaksimal) || 150;
    const jumlah_anggota = Number(req.body.jumlah_anggota !== undefined ? req.body.jumlah_anggota : req.body.jumlahAnggota) || 0;

    const updated = {
      id,
      nama_wadah,
      namaWadah: nama_wadah,
      ketua_wadah,
      ketuaWadah: ketua_wadah,
      umur_minimal,
      umurMinimal: umur_minimal,
      umur_maksimal,
      umurMaksimal: umur_maksimal,
      jumlah_anggota,
      jumlahAnggota: jumlah_anggota
    };

    if (pool) {
      try {
        const query = `
          UPDATE wadah SET
            nama_wadah = $1, ketua_wadah = $2, umur_minimal = $3, umur_maksimal = $4, jumlah_anggota = $5
          WHERE id = $6
          RETURNING *
        `;
        const values = [nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota, id];
        await queryWithAutoTable(query, values);
      } catch (dbErr) {
        console.error("Database update wadah error, fallback:", dbErr);
      }
    }

    (inMemoryDB as any).wadah = (inMemoryDB as any).wadah || [];
    const idx = (inMemoryDB as any).wadah.findIndex((w: any) => w.id === id);
    if (idx >= 0) {
      (inMemoryDB as any).wadah[idx] = updated;
    } else {
      (inMemoryDB as any).wadah.push(updated);
    }
    saveInMemoryDBToDisk(inMemoryDB);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating wadah:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/wadah/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (pool) {
      try {
        await queryWithAutoTable("DELETE FROM wadah WHERE id = $1", [id]);
      } catch (dbErr) {
        console.error("Database delete wadah error:", dbErr);
      }
    }
    if ((inMemoryDB as any).wadah) {
      (inMemoryDB as any).wadah = (inMemoryDB as any).wadah.filter((w: any) => w.id !== id);
    }
    saveInMemoryDBToDisk(inMemoryDB);
    res.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    console.error("Error deleting wadah:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ RAYON CRUD ============
router.get("/rayon", async (req, res) => {
  try {
    let rayonRows: any[] = [];
    let jemaats: any[] = [];

    if (pool) {
      try {
        const rayonRes = await queryWithAutoTable("SELECT * FROM rayon ORDER BY id ASC");
        const jemaatRes = await queryWithAutoTable("SELECT * FROM jemaat WHERE status_jemaat = 'Aktif' OR status_jemaat IS NULL");
        rayonRows = rayonRes.rows;
        jemaats = jemaatRes.rows;
      } catch (dbErr) {
        console.error("Database fetch rayon error:", dbErr);
      }
    }

    const defaultRayon = [
      { id: 'RAY-001', nama_rayon: 'Rayon 1', ketua_rayon: 'Suci Br Kembaren' },
      { id: 'RAY-002', nama_rayon: 'Rayon 2', ketua_rayon: 'Tarningsih' },
      { id: 'RAY-003', nama_rayon: 'Rayon 3', ketua_rayon: 'Harliarso' },
      { id: 'RAY-004', nama_rayon: 'Rayon 4', ketua_rayon: 'Mega Sihombing' }
    ];

    if (rayonRows.length === 0) {
      if ((inMemoryDB as any).rayon && (inMemoryDB as any).rayon.length > 0) {
        rayonRows = (inMemoryDB as any).rayon;
      } else {
        rayonRows = defaultRayon;
      }
    }

    const data = rayonRows.map(r => {
      const rName = (r.nama_rayon || r.namaRayon || '').trim().toLowerCase();
      let count = 0;
      for (const j of jemaats) {
        const jr = (j.rayon || '').trim().toLowerCase();
        if (jr === rName) {
          count++;
        } else if (r.id === 'RAY-001' && (jr.includes('rayon 1') || jr === '1')) {
          count++;
        } else if (r.id === 'RAY-002' && (jr.includes('rayon 2') || jr === '2')) {
          count++;
        } else if (r.id === 'RAY-003' && (jr.includes('rayon 3') || jr === '3')) {
          count++;
        } else if (r.id === 'RAY-004' && (jr.includes('rayon 4') || jr === '4')) {
          count++;
        }
      }

      if (jemaats.length === 0) {
        if (r.id === 'RAY-001' || rName.includes('rayon 1')) count = 78;
        else if (r.id === 'RAY-002' || rName.includes('rayon 2')) count = 83;
        else if (r.id === 'RAY-003' || rName.includes('rayon 3')) count = 123;
        else if (r.id === 'RAY-004' || rName.includes('rayon 4')) count = 87;
      }

      return {
        id: r.id,
        nama_rayon: r.nama_rayon || r.namaRayon,
        namaRayon: r.nama_rayon || r.namaRayon,
        ketua_rayon: r.ketua_rayon || r.ketuaRayon,
        ketuaRayon: r.ketua_rayon || r.ketuaRayon,
        jumlah_anggota: count,
        jumlahAnggota: count
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching rayon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/rayon", async (req, res) => {
  try {
    const nama_rayon = (req.body.nama_rayon || req.body.namaRayon || "Rayon Baru").toString();
    const ketua_rayon = (req.body.ketua_rayon || req.body.ketuaRayon || "-").toString();
    const jumlah_anggota = Number(req.body.jumlah_anggota !== undefined ? req.body.jumlah_anggota : req.body.jumlahAnggota) || 0;

    const id = generateId("RAY");

    if (pool) {
      try {
        const query = `
          INSERT INTO rayon (
            id, nama_rayon, ketua_rayon, jumlah_anggota
          ) VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const values = [id, nama_rayon, ketua_rayon, jumlah_anggota];
        const result = await queryWithAutoTable(query, values);
        if (result.rows.length > 0) {
          const row = result.rows[0];
          return res.json({
            success: true,
            data: {
              ...row,
              namaRayon: row.nama_rayon,
              ketuaRayon: row.ketua_rayon,
              jumlahAnggota: row.jumlah_anggota
            }
          });
        }
      } catch (dbErr: any) {
        console.error("Database insert rayon error, using fallback:", dbErr);
      }
    }

    const fallbackItem = {
      id,
      nama_rayon,
      namaRayon: nama_rayon,
      ketua_rayon,
      ketuaRayon: ketua_rayon,
      jumlah_anggota,
      jumlahAnggota: jumlah_anggota
    };
    (inMemoryDB as any).rayon = (inMemoryDB as any).rayon || [];
    (inMemoryDB as any).rayon = (inMemoryDB as any).rayon.filter((r: any) => r.id !== id);
    (inMemoryDB as any).rayon.push(fallbackItem);
    saveInMemoryDBToDisk(inMemoryDB);
    res.json({ success: true, data: fallbackItem });
  } catch (error: any) {
    console.error("Error creating rayon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/rayon/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const nama_rayon = (req.body.nama_rayon || req.body.namaRayon || "Rayon").toString();
    const ketua_rayon = (req.body.ketua_rayon || req.body.ketuaRayon || "-").toString();
    const jumlah_anggota = Number(req.body.jumlah_anggota !== undefined ? req.body.jumlah_anggota : req.body.jumlahAnggota) || 0;

    const updated = {
      id,
      nama_rayon,
      namaRayon: nama_rayon,
      ketua_rayon,
      ketuaRayon: ketua_rayon,
      jumlah_anggota,
      jumlahAnggota: jumlah_anggota
    };

    if (pool) {
      try {
        const query = `
          UPDATE rayon SET
            nama_rayon = $1, ketua_rayon = $2, jumlah_anggota = $3
          WHERE id = $4
          RETURNING *
        `;
        const values = [nama_rayon, ketua_rayon, jumlah_anggota, id];
        await queryWithAutoTable(query, values);
      } catch (dbErr) {
        console.error("Database update rayon error, fallback:", dbErr);
      }
    }

    (inMemoryDB as any).rayon = (inMemoryDB as any).rayon || [];
    const idx = (inMemoryDB as any).rayon.findIndex((r: any) => r.id === id);
    if (idx >= 0) {
      (inMemoryDB as any).rayon[idx] = updated;
    } else {
      (inMemoryDB as any).rayon.push(updated);
    }
    saveInMemoryDBToDisk(inMemoryDB);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating rayon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/rayon/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (pool) {
      try {
        await queryWithAutoTable("DELETE FROM rayon WHERE id = $1", [id]);
      } catch (dbErr) {
        console.error("Database delete rayon error:", dbErr);
      }
    }
    if ((inMemoryDB as any).rayon) {
      (inMemoryDB as any).rayon = (inMemoryDB as any).rayon.filter((r: any) => r.id !== id);
    }
    saveInMemoryDBToDisk(inMemoryDB);
    res.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    console.error("Error deleting rayon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CERTIFICATE REQUESTS CRUD ============
router.get("/certificate-requests", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM certificate_requests ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Error fetching certificate requests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/certificate-requests", async (req, res) => {
  try {
    checkPostgres();
    const { name, type, status } = req.body;

    const id = generateId("CR");
    const query = `
      INSERT INTO certificate_requests (id, name, type, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [id, name, type, status || 'Pending'];

    const result = await pool!.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating certificate request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CERTIFICATE VALIDATION ============
router.get("/certificates/validate/:code", async (req, res) => {
  try {
    checkPostgres();
    const { code } = req.params;
    const result = await pool!.query("SELECT * FROM certificates WHERE code = $1", [code]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Invalid or not found" });
    } else {
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error validating certificate:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CHATBOT ============
router.post("/chat", async (req, res) => {
  const message = (req.body.message || "").toString();
  if (!message.trim()) {
    return res.status(400).json({ success: false, message: "Pesan tidak boleh kosong" });
  }
  const lowercaseMsg = message.toLowerCase().trim();

  try {
    // 1. Fetch Knowledge Base
    let kbList: any[] = [];
    if (pool) {
      try {
        const result = await queryWithAutoTable("SELECT * FROM knowledge_base WHERE is_active = true");
        kbList = result.rows;
      } catch (e) {
        console.error("Error fetching KB for chat:", e);
      }
    }
    if (kbList.length === 0) {
      kbList = (inMemoryDB as any).knowledgeBase || [];
    }

    const knowledgeBase = kbList.map(r => {
      let patterns: string[] = [];
      if (Array.isArray(r.patterns)) {
        patterns = r.patterns;
      } else if (typeof r.patterns === 'string') {
        try {
          const parsed = JSON.parse(r.patterns);
          patterns = Array.isArray(parsed) ? parsed : [r.patterns];
        } catch {
          patterns = r.patterns.split(',').map((s: string) => s.trim());
        }
      }
      return {
        id: r.id,
        category: r.category || 'Umum',
        patterns,
        botResponse: r.bot_response || r.botResponse || '',
        isActive: r.is_active !== undefined ? r.is_active : (r.isActive !== undefined ? r.isActive : true)
      };
    }).filter(k => k.isActive && k.botResponse);

    // 2. Fetch Schedules & Events
    let scheduleList: any[] = [];
    if (pool) {
      try {
        const result = await queryWithAutoTable("SELECT * FROM schedules ORDER BY created_at DESC");
        scheduleList = result.rows;
      } catch (e) {
        console.error("Error fetching schedules for chat:", e);
      }
    }
    if (scheduleList.length === 0) {
      scheduleList = (inMemoryDB as any).schedules || [];
    }

    // Format Schedules for Chat Context
    const formattedSchedules = scheduleList.map(s => {
      const tglStr = s.tanggal ? (typeof s.tanggal === 'string' ? s.tanggal : new Date(s.tanggal).toISOString().split('T')[0]) : '';
      const dateObj = tglStr ? new Date(tglStr) : null;
      const formattedDate = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : tglStr;
      const hariJam = s.hari_jam || s.hariJam || formattedDate || '-';
      const reg = (s.is_registration_required || s.isRegistrationRequired) ? `(Pendaftaran Dibuka, Kuota: ${s.kuota || 'Terbatas'})` : '';
      return `📌 [${s.kategori || 'Jadwal'}] ${s.judul} - Hari/Tanggal: ${hariJam}, Jam: ${s.waktu || 'Sesuai Jadwal'}, Lokasi: ${s.lokasi || 'Gereja GPdI Melati Depok'} ${reg}`;
    }).join('\n');

    // 3. Match against Knowledge Base patterns
    for (const kb of knowledgeBase) {
      if (Array.isArray(kb.patterns)) {
        for (const pattern of kb.patterns) {
          if (pattern && typeof pattern === 'string') {
            const trimmedPat = pattern.trim().toLowerCase();
            if (trimmedPat && lowercaseMsg.includes(trimmedPat)) {
              return res.json({ success: true, data: { response: kb.botResponse } });
            }
          }
        }
      }
    }

    // 4. Check if user is asking about schedules / events / worship times
    const isScheduleQuery = lowercaseMsg.includes('jadwal') || 
                            lowercaseMsg.includes('event') || 
                            lowercaseMsg.includes('ibadah') || 
                            lowercaseMsg.includes('kegiatan') || 
                            lowercaseMsg.includes('minggu') || 
                            lowercaseMsg.includes('jam') || 
                            lowercaseMsg.includes('waktu');

    if (isScheduleQuery) {
      if (scheduleList.length > 0) {
        const responseText = `Berikut adalah Jadwal Ibadah & Event GPdI Melati Depok terbaru:\n\n${formattedSchedules}\n\nSilakan kunjungi menu 'Jadwal & Event' di website kami untuk informasi selengkapnya atau melakukan pendaftaran!`;
        return res.json({ success: true, data: { response: responseText } });
      } else {
        return res.json({ success: true, data: { response: "Saat ini belum ada jadwal ibadah atau event khusus yang terdaftar dari Admin. Silakan cek secara berkala atau hubungi tim gereja." } });
      }
    }

    // 5. Check if user asks about baptis / doa / pendaftaran
    if (lowercaseMsg.includes('baptis') || lowercaseMsg.includes('baptisan')) {
      return res.json({ success: true, data: { response: "Untuk Pendaftaran Baptisan Air, Anda dapat mendaftar langsung di halaman Layanan -> Baptisan di website ini. Pastikan menyiapkan foto dan data diri (NIK, Tanggal Lahir, Alamat, No WhatsApp)." } });
    }

    if (lowercaseMsg.includes('doa') || lowercaseMsg.includes('permohonan doa')) {
      return res.json({ success: true, data: { response: "Anda dapat mengirimkan Permohonan Doa melalui halaman Layanan -> Permohonan Doa di website ini. Tim pendoa kami siap mendoakan pergumulan Anda." } });
    }

    if (lowercaseMsg.includes('alamat') || lowercaseMsg.includes('lokasi') || lowercaseMsg.includes('kontak') || lowercaseMsg.includes('telepon')) {
      return res.json({ success: true, data: { response: "📍 Alamat GPdI Melati Depok:\nJl. Melati No. 8, Depok, Jawa Barat.\n📞 Telepon/WA: (021) 7521216\nJam Operasional Sekretariat: Selasa - Minggu (08.00 - 17.00 WIB)." } });
    }

    // 6. Gemini AI Call with complete DB context (KB + Schedules) if API Key is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const kbContext = knowledgeBase.map(k => `Q: ${k.patterns.join(", ")} A: ${k.botResponse}`).join("\n");
        const systemPrompt = `Anda adalah asisten AI resmi ramah untuk Gereja GPdI Melati Depok. Jawab pertanyaan jemaat dengan ramah, hangat, dan ringkas.\n\nGunakan data terbaru berikut dari database gereja:\n\n[JADWAL & EVENT SAAT INI]:\n${formattedSchedules}\n\n[KNOWLEDGE BASE GEREJA]:\n${kbContext}\n\nJika pertanyaan di luar konteks gereja, jawab dengan sopan bahwa Anda adalah asisten gereja GPdI Melati Depok.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: message,
          config: { systemInstruction: systemPrompt },
        });

        if (response && response.text) {
          return res.json({ success: true, data: { response: response.text } });
        }
      } catch (aiErr) {
        console.error("Gemini AI call error:", aiErr);
      }
    }

    // 7. General friendly fallback response with schedules overview
    const fallbackText = scheduleList.length > 0 
      ? `Shalom! Terima kasih telah menghubungi asisten GPdI Melati Depok.\n\nJadwal Ibadah & Event terdekat kami:\n${formattedSchedules}\n\nAda yang bisa kami bantu lagi mengenai jadwal, pendaftaran, atau layanan gereja?`
      : `Shalom! Terima kasih telah menghubungi GPdI Melati Depok. Ada yang bisa saya bantu terkait Jadwal Ibadah, Pendaftaran, Permohonan Doa, atau Baptisan?`;

    return res.json({ success: true, data: { response: fallbackText } });

  } catch (error: any) {
    console.error("Chatbot processing error:", error);
    res.json({ success: true, data: { response: "Shalom! Terima kasih telah menghubungi GPdI Melati Depok. Ada yang bisa saya bantu terkait Jadwal Ibadah, Pendaftaran, Permohonan Doa, atau Baptisan?" } });
  }
});

// ============ FILE UPLOAD ============
import multer from "multer";
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url: fileUrl } });
  } else {
    res.status(400).json({ success: false, message: "No file uploaded" });
  }
});

export default router;
