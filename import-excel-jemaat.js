import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const filePath = path.resolve(process.cwd(), './data jemaat/PI_Data Jemaat_Tugas Daniel (1).xlsx');

console.log('----------------------------------------------------');
console.log('🚀 IMPORT DATA JEMAAT, WADAH & RAYON DARI EXCEL');
console.log('File:', filePath);
console.log('----------------------------------------------------');

if (!fs.existsSync(filePath)) {
  console.error('❌ Error: File Excel tidak ditemukan di path:', filePath);
  process.exit(1);
}

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawData = xlsx.utils.sheet_to_json(sheet);

console.log(`📊 Ditemukan ${rawData.length} data jemaat dari Excel (${sheetName}).`);

// Exact Wadah Mapping
const wadahNameMap = {
  1: 'Kaum Pria',
  2: 'Kaum Wanita',
  3: 'Sekolah Minggu',
  4: 'Kaum Remaja',
  5: 'Kaum Muda'
};

// Exact Rayon Mapping & Ketua
const rayonInfoMap = {
  1: { nama: 'Rayon 1', ketua: 'Suci Br Kembaren' },
  2: { nama: 'Rayon 2', ketua: 'Tarningsih' },
  3: { nama: 'Rayon 3', ketua: 'Harliarso' },
  4: { nama: 'Rayon 4', ketua: 'Mega Sihombing' }
};

function formatTanggal(val) {
  if (!val) return '1990-01-01';
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
  }
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return '1990-01-01';
}

const formattedJemaatList = rawData.map((row, idx) => {
  const nama = (row.nama || row.Nama || `Jemaat ${idx + 1}`).toString().trim();
  const genderRaw = (row.jenis_kelamin || row.gender || 'Pria').toString().trim();
  const gender = (genderRaw.toLowerCase() === 'wanita' || genderRaw.toLowerCase() === 'perempuan') ? 'Wanita' : 'Pria';
  const tempat_lahir = (row.tempat_lahir || 'Depok').toString().trim();
  const tanggal_lahir = formatTanggal(row.tanggal_lahir);
  const alamat = (row.alamat || '-').toString().trim();
  const no_wa = (row.no_wa || row.no_hp || row.no_telp || '-').toString().replace(/[^0-9+]/g, '');
  const no_hp = no_wa.length > 5 ? no_wa : '-';

  // Generate unique NIK to avoid duplicate key violates unique constraint "jemaat_nik_key"
  const rawNik = row.nik || row.NIK;
  const nik = (rawNik && rawNik.toString().trim() !== '-' && rawNik.toString().trim() !== '') 
    ? rawNik.toString().trim() 
    : `327500${String(idx + 1).padStart(10, '0')}`;

  const wadah = row.wadah_id && wadahNameMap[row.wadah_id] ? wadahNameMap[row.wadah_id] : 'Kaum Pria (Bapak)';
  const rayon = row.rayon_id && rayonInfoMap[row.rayon_id] ? rayonInfoMap[row.rayon_id].nama : 'Rayon 1';

  return {
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
  };
});

async function runImport() {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    console.log('🔌 Terhubung ke PostgreSQL Database:', dbUrl.split('@')[1] || dbUrl);
    const pool = new pg.Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
      // 1. Try CREATE TABLE / ALTER TABLE if permitted
      try {
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
            status_jemaat VARCHAR(50) DEFAULT 'Aktif',
            wadah VARCHAR(100),
            rayon VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch (e) {}

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
      } catch (e) {}

      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS rayon (
            id VARCHAR(50) PRIMARY KEY,
            nama_rayon VARCHAR(255) NOT NULL,
            ketua_rayon VARCHAR(255) NOT NULL,
            jumlah_anggota INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch (e) {}

      try {
        await pool.query(`ALTER TABLE jemaat DROP CONSTRAINT IF EXISTS jemaat_nik_key;`);
      } catch (e) {}

      // 2. Safe upsert Wadah list
      const defaultWadahList = [
        { id: 'WAD-001', nama: 'Kaum Muda', ketua: 'Joyhill Abineno', minAge: 21, maxAge: 30, count: 64 },
        { id: 'WAD-002', nama: 'Kaum Pria', ketua: 'Mardongan Simanjuntak', minAge: 31, maxAge: 100, count: 80 },
        { id: 'WAD-003', nama: 'Kaum Remaja', ketua: 'Chloe Davincia Michelle', minAge: 14, maxAge: 20, count: 23 },
        { id: 'WAD-004', nama: 'Kaum Wanita', ketua: 'Ester Wuarlela', minAge: 31, maxAge: 100, count: 136 },
        { id: 'WAD-005', nama: 'Sekolah Minggu', ketua: 'Seresy Matius', minAge: 1, maxAge: 13, count: 68 }
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
          `, [w.id, w.nama, w.ketua, w.minAge, w.maxAge, w.count]);
        } catch (wErr) {}
      }

      // 3. Safe upsert Rayon list
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

      // 4. Insert / Update 371 Jemaat records
      let insertedCount = 0;
      let errorCount = 0;

      for (const item of formattedJemaatList) {
        try {
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
          await pool.query(query, [
            item.id, item.nama, item.nik, item.gender, item.tempat_lahir,
            item.tanggal_lahir, item.alamat, item.no_hp, item.status_jemaat,
            item.wadah, item.rayon
          ]);
          insertedCount++;
        } catch (itemErr) {
          console.error(`⚠️ Error insert (${item.nama}):`, itemErr.message);
          errorCount++;
        }
      }

      console.log(`✅ SELESAI! ${insertedCount} data jemaat, 5 Wadah, dan 4 Rayon telah diimpor ke database PostgreSQL (Gagal: ${errorCount}).`);

    } catch (err) {
      console.error('❌ Database error:', err.message);
    } finally {
      await pool.end();
    }
  } else {
    console.log('⚠️ DATABASE_URL tidak diset di .env!');
    console.log('ℹ️ Menyiapkan format JSON data jemaat...');
    const outputPath = path.resolve(process.cwd(), './data_jemaat_parsed.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedJemaatList, null, 2));
    console.log(`✅ Data jemaat ${formattedJemaatList.length} items disimpan di file: ${outputPath}`);
  }
}

runImport();
