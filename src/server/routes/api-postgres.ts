import { Router } from "express";
import { pool } from "../db/index.ts";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// Helper function to check if PostgreSQL is available
const checkPostgres = (): void => {
  if (!pool) {
    throw new Error("PostgreSQL not available");
  }
};

// Helper function to generate ID
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ JEMAAT CRUD ============
router.get("/jemaat", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM jemaat ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
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

// ============ SCHEDULES CRUD ============
router.get("/schedules", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM schedules ORDER BY created_at DESC");
    // Convert snake_case to camelCase for frontend
    const data = result.rows.map(row => ({
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

    const finalTanggal = tanggal || new Date().toISOString().split('T')[0];
    const id = generateId("SCH");
    const query = `
      INSERT INTO schedules (
        id, judul, tanggal, waktu, lokasi, deskripsi, is_registration_required,
        hari_jam, kategori, kuota, terdaftar, registration_fee, need_payment_proof
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      id, judul, finalTanggal, waktu, lokasi, deskripsi,
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

    const query = `
      UPDATE schedules SET
        judul = $1, tanggal = $2, waktu = $3, lokasi = $4, deskripsi = $5,
        is_registration_required = $6, hari_jam = $7, kategori = $8,
        kuota = $9, terdaftar = $10, registration_fee = $11, need_payment_proof = $12
      WHERE id = $13
      RETURNING *
    `;
    const values = [
      judul, tanggal, waktu, lokasi, deskripsi,
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
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Error fetching warta jemaat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/warta-jemaat", async (req, res) => {
  try {
    checkPostgres();
    const { judul, tanggal, pdf_url, petugas_list, edisi, tema_minggu, ayat_minggu, pengumuman } = req.body;

    const id = generateId("WJ");
    const query = `
      INSERT INTO warta_jemaat (
        id, judul, tanggal, pdf_url, petugas_list, edisi, tema_minggu, ayat_minggu, pengumuman
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      id, judul, tanggal, pdf_url,
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
          const jemaatQuery = `
            INSERT INTO jemaat (
              id, nama, nik, gender, tempat_lahir, tanggal_lahir,
              alamat, no_hp, status_jemaat, anggota_keluarga
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `;
          await pool!.query(jemaatQuery, [
            jemaatId, reg.nama_pendaftar, reg.nik, reg.gender,
            reg.tempat_lahir, reg.tanggal_lahir, reg.alamat,
            reg.no_hp, 'Aktif', reg.anggota_keluarga
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
    checkPostgres();
    const result = await pool!.query("SELECT * FROM knowledge_base ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Error fetching knowledge base:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/knowledge-base", async (req, res) => {
  try {
    checkPostgres();
    const { patterns } = req.body;
    const bot_response = req.body.bot_response || req.body.botResponse;
    const is_active = req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== undefined ? req.body.isActive : true);

    const id = generateId("KB");
    const query = `
      INSERT INTO knowledge_base (id, patterns, bot_response, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      id,
      Array.isArray(patterns) ? JSON.stringify(patterns) : patterns,
      bot_response,
      is_active
    ];

    const result = await pool!.query(query, values);
    const row = result.rows[0];
    const data = {
      ...row,
      botResponse: row.bot_response,
      isActive: row.is_active
    };
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error creating knowledge base:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/knowledge-base/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const { patterns } = req.body;
    const bot_response = req.body.bot_response || req.body.botResponse;
    const is_active = req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== undefined ? req.body.isActive : true);

    const query = `
      UPDATE knowledge_base SET
        patterns = $1, bot_response = $2, is_active = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [
      Array.isArray(patterns) ? JSON.stringify(patterns) : patterns,
      bot_response,
      is_active,
      id
    ];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Knowledge base not found" });
    } else {
      const row = result.rows[0];
      const data = {
        ...row,
        botResponse: row.bot_response,
        isActive: row.is_active
      };
      res.json({ success: true, data });
    }
  } catch (error: any) {
    console.error("Error updating knowledge base:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/knowledge-base/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM knowledge_base WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Knowledge base not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting knowledge base:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PRAYER REQUESTS CRUD ============
router.get("/prayers", async (req, res) => {
  try {
    checkPostgres();
    const result = await pool!.query("SELECT * FROM prayer_requests ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Error fetching prayer requests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/prayers", async (req, res) => {
  try {
    checkPostgres();
    const { name, request, status } = req.body;

    const id = generateId("PR");
    const query = `
      INSERT INTO prayer_requests (id, name, request, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [id, name, request, status || 'Pending'];

    const result = await pool!.query(query, values);
    res.json({ success: true, data: result.rows[0] });
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
    checkPostgres();
    const wadahRes = await pool!.query("SELECT * FROM wadah ORDER BY nama_wadah ASC");
    const jemaatRes = await pool!.query("SELECT * FROM jemaat WHERE status_jemaat = 'Aktif' OR status_jemaat IS NULL");
    const jemaats = jemaatRes.rows;

    const data = wadahRes.rows.map(w => {
      const minAge = Number(w.umur_minimal) || 0;
      const maxAge = Number(w.umur_maksimal) || 150;
      let count = 0;
      for (const j of jemaats) {
        if (j.wadah && j.wadah.trim().toLowerCase() === w.nama_wadah.trim().toLowerCase()) {
          count++;
        } else if (j.tanggal_lahir) {
          const birthDate = new Date(j.tanggal_lahir);
          if (!isNaN(birthDate.getTime())) {
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            if (age >= minAge && age <= maxAge) {
              count++;
            }
          }
        }
      }
      return {
        ...w,
        jumlah_anggota: count
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
    checkPostgres();
    const { nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota } = req.body;

    const id = generateId("WAD");
    const query = `
      INSERT INTO wadah (
        id, nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      id, nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota || 0
    ];

    const result = await pool!.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating wadah:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/wadah/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const { nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota } = req.body;

    const query = `
      UPDATE wadah SET
        nama_wadah = $1, ketua_wadah = $2, umur_minimal = $3, umur_maksimal = $4, jumlah_anggota = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota || 0, id];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Wadah not found" });
    } else {
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating wadah:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/wadah/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM wadah WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Wadah not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
  } catch (error: any) {
    console.error("Error deleting wadah:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ RAYON CRUD ============
router.get("/rayon", async (req, res) => {
  try {
    checkPostgres();
    const rayonRes = await pool!.query("SELECT * FROM rayon ORDER BY nama_rayon ASC");
    const jemaatRes = await pool!.query("SELECT * FROM jemaat WHERE status_jemaat = 'Aktif' OR status_jemaat IS NULL");
    const jemaats = jemaatRes.rows;

    const data = rayonRes.rows.map(r => {
      const count = jemaats.filter(j => j.rayon && j.rayon.trim().toLowerCase() === r.nama_rayon.trim().toLowerCase()).length;
      return {
        ...r,
        jumlah_anggota: count
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
    checkPostgres();
    const { nama_rayon, ketua_rayon, jumlah_anggota } = req.body;

    const id = generateId("RAY");
    const query = `
      INSERT INTO rayon (
        id, nama_rayon, ketua_rayon, jumlah_anggota
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [id, nama_rayon, ketua_rayon, jumlah_anggota || 0];

    const result = await pool!.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating rayon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/rayon/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const { nama_rayon, ketua_rayon, jumlah_anggota } = req.body;

    const query = `
      UPDATE rayon SET
        nama_rayon = $1, ketua_rayon = $2, jumlah_anggota = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [nama_rayon, ketua_rayon, jumlah_anggota, id];

    const result = await pool!.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Rayon not found" });
    } else {
      res.json({ success: true, data: result.rows[0] });
    }
  } catch (error: any) {
    console.error("Error updating rayon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/rayon/:id", async (req, res) => {
  try {
    checkPostgres();
    const { id } = req.params;
    const result = await pool!.query("DELETE FROM rayon WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Rayon not found" });
    } else {
      res.json({ success: true, message: "Deleted" });
    }
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
  const { message } = req.body;
  const lowercaseMsg = message.toLowerCase();

  try {
    // Load knowledge base from PostgreSQL
    const { rows } = await pool!.query(
      "SELECT id, patterns, bot_response, is_active FROM knowledge_base WHERE is_active = true"
    );
    const knowledgeBase = rows.map(row => ({
      ...row,
      patterns: Array.isArray(row.patterns) ? row.patterns : (typeof row.patterns === 'string' ? JSON.parse(row.patterns) : []),
      botResponse: row.bot_response || row.botResponse,
      isActive: row.is_active !== undefined ? row.is_active : row.isActive
    }));

    console.log('Knowledge base loaded:', knowledgeBase.length, 'items');

    // 1. Fallback to knowledge base first if perfect match or no api key
    let kbMatch = null;
    for (const kb of knowledgeBase) {
      if (!kb.isActive) continue;
      for (const pattern of kb.patterns) {
        if (lowercaseMsg.includes(pattern.toLowerCase())) {
          kbMatch = kb.botResponse;
          break;
        }
      }
      if (kbMatch) break;
    }

    if (!process.env.GEMINI_API_KEY) {
      if (kbMatch) {
        return res.json({ success: true, data: { response: kbMatch } });
      } else {
        return res.json({ success: true, data: { response: "Maaf, saya hanya dapat menjawab pertanyaan seputar jadwal ibadah, pendaftaran jemaat, dan informasi gereja. Silakan hubungi sekretariat untuk informasi lebih lanjut." } });
      }
    }

    // 2. Call Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Inject KB context
    const kbContext = knowledgeBase.filter(k => k.isActive).map(k => `Q: ${k.patterns.join(", ")} A: ${k.botResponse}`).join("\n");
    const systemPrompt = `Anda adalah asisten AI ramah untuk Gereja GPdI Melati Depok. Jawab dengan singkat, padat, hangat. Gunakan pengetahuan ini:\n${kbContext}\n\nJika pertanyaan di luar konteks gereja, tolak dengan halus.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: { systemInstruction: systemPrompt },
    });

    res.json({ success: true, data: { response: response.text } });
  } catch (error: any) {
    console.error("Chat error:", error);
    // Fallback if AI fails
    res.json({ success: true, data: { response: "Mohon maaf, sistem chat sedang sibuk. Silakan hubungi nomor WhatsApp sekretariat gereja." } });
  }
});

// ============ FILE UPLOAD ============
import multer from "multer";
import path from "path";
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
