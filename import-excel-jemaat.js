import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const filePath = path.resolve(process.cwd(), './data jemaat/PI_Data Jemaat_Tugas Daniel (1).xlsx');

console.log('----------------------------------------------------');
console.log('🚀 IMPORT DATA JEMAAT DARI EXCEL');
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

// Wadah Mapping
const wadahMap = {
  1: 'Sekolah Minggu',
  2: 'Remaja',
  3: 'Pemuda',
  4: 'Wadah Wanita (W/P)',
  5: 'Wadah Pria (P/P)'
};

// Rayon Mapping
const rayonMap = {
  1: 'Rayon 1',
  2: 'Rayon 2',
  3: 'Rayon 3',
  4: 'Rayon 4'
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

function calculateAge(birthDateStr) {
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function determineWadah(age, gender, wadahId) {
  if (wadahId && wadahMap[wadahId]) {
    return wadahMap[wadahId];
  }
  if (age < 13) return 'Sekolah Minggu';
  if (age >= 13 && age <= 17) return 'Remaja';
  if (age >= 18 && age <= 25) return 'Pemuda';
  if (gender === 'Wanita' || gender === 'Perempuan') return 'Wadah Wanita (W/P)';
  return 'Wadah Pria (P/P)';
}

function determineRayon(rayonId) {
  if (rayonId && rayonMap[rayonId]) {
    return rayonMap[rayonId];
  }
  return 'Rayon 1';
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
  const status_jemaat = (row.status || 'aktif').toString().toLowerCase() === 'aktif' ? 'Aktif' : 'Aktif';

  const age = calculateAge(tanggal_lahir);
  const wadah = determineWadah(age, gender, row.wadah_id);
  const rayon = determineRayon(row.rayon_id);

  return {
    id: `JEM-${String(idx + 1).padStart(4, '0')}`,
    nama,
    nik: `-`,
    gender,
    tempat_lahir,
    tanggal_lahir,
    alamat,
    no_hp,
    status_jemaat,
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
      // Try CREATE TABLE if schema permits, otherwise proceed directly to INSERT
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
      } catch (tableErr) {
        console.log('ℹ️ Skip CREATE TABLE (menggunakan tabel jemaat yang sudah ada):', tableErr.message);
      }

      let insertedCount = 0;
      let errorCount = 0;

      for (const item of formattedJemaatList) {
        try {
          const query = `
            INSERT INTO jemaat (id, nama, nik, gender, tempat_lahir, tanggal_lahir, alamat, no_hp, status_jemaat, wadah, rayon)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              nama = EXCLUDED.nama,
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

      console.log(`✅ SELESAI! ${insertedCount} data jemaat telah diimpor ke database PostgreSQL (Gagal: ${errorCount}).`);

    } catch (err) {
      console.error('❌ Database error:', err.message);
    } finally {
      await pool.end();
    }
  } else {
    console.log('⚠️ DATABASE_URL tidak diset di .env!');
    console.log('ℹ️ Menyiapkan format JSON data jemaat yang siap digunakan untuk API / Seeding server...');
    const outputPath = path.resolve(process.cwd(), './data_jemaat_parsed.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedJemaatList, null, 2));
    console.log(`✅ Data jemaat ${formattedJemaatList.length} items disimpan di file: ${outputPath}`);
  }
}

runImport();
