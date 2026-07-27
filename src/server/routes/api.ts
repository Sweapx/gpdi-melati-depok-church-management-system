import { Router } from "express";
import { inMemoryDB, usePostgres, pool } from "../db/index.ts";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// A simple generic CRUD generator for inMemoryDB fallback
const createCrud = (route: string, arrayName: keyof typeof inMemoryDB) => {
  router.get(`/${route}`, (req, res) => {
    res.json({ success: true, data: inMemoryDB[arrayName] });
  });

  router.post(`/${route}`, (req, res) => {
    const newItem = { id: `${route}-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    (inMemoryDB[arrayName] as any[]).push(newItem);
    res.json({ success: true, data: newItem });
  });

  router.put(`/${route}/:id`, (req, res) => {
    const arr = inMemoryDB[arrayName] as any[];
    const index = arr.findIndex(item => item.id === req.params.id);
    if (index > -1) {
      arr[index] = { ...arr[index], ...req.body };
      res.json({ success: true, data: arr[index] });
    } else {
      res.status(404).json({ success: false, message: "Not found" });
    }
  });

  router.delete(`/${route}/:id`, (req, res) => {
    const arr = inMemoryDB[arrayName] as any[];
    const index = arr.findIndex(item => item.id === req.params.id);
    if (index > -1) {
      arr.splice(index, 1);
      res.json({ success: true, message: "Deleted" });
    } else {
      res.status(404).json({ success: false, message: "Not found" });
    }
  });
};

createCrud("jemaat", "jemaat");
createCrud("registrations", "registrations");
createCrud("schedules", "schedules");
createCrud("announcements", "announcements");
createCrud("knowledge-base", "knowledgeBase");
createCrud("prayers", "prayerRequests");
createCrud("warta-jemaat", "wartaJemaat");
createCrud("hero-slides", "heroSlides");

// Custom endpoint for validating certificate
router.get("/certificates/validate/:code", (req, res) => {
  const cert = inMemoryDB.certificates.find(c => c.code === req.params.code);
  if (cert) {
    res.json({ success: true, data: cert });
  } else {
    res.status(404).json({ success: false, message: "Invalid or not found" });
  }
});

// Custom endpoint for registration status update
router.put("/registrations/:id/status", (req, res) => {
  const reg = inMemoryDB.registrations.find(r => r.id === req.params.id);
  if (reg) {
    reg.status = req.body.status;
    reg.statusNote = req.body.statusNote;
    
    // Auto insert into jemaat if approved
    if (reg.status === "Disetujui" && (reg.type === "jemaat_baru" || reg.type === "pendataan_terdaftar")) {
      const newJemaat = {
        id: `JEM-${Date.now()}`,
        nama: reg.namaPendaftar,
        nik: reg.nik,
        gender: reg.gender,
        tempatLahir: reg.tempatLahir,
        tanggalLahir: reg.tanggalLahir,
        alamat: reg.alamat,
        noHp: reg.noHp,
        statusPernikahan: 'Belum Menikah', // default, ideally from form
        statusJemaat: 'Aktif',
        kategoriKaum: 'Umum',
        sektor: 'Default Sektor',
        createdAt: new Date().toISOString(),
        anggotaKeluarga: reg.anggotaKeluarga || []
      };
      // Type bypass for simple mock
      (inMemoryDB.jemaat as any[]).push(newJemaat);
    }

    res.json({ success: true, data: reg });
  } else {
    res.status(404).json({ success: false, message: "Not found" });
  }
});

// Custom endpoint for prayer status update
router.put("/prayers/:id/status", (req, res) => {
  const p = inMemoryDB.prayerRequests.find(r => r.id === req.params.id);
  if (p) {
    p.status = req.body.status;
    res.json({ success: true, data: p });
  } else {
    res.status(404).json({ success: false, message: "Not found" });
  }
});

// Chatbot integration
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  const lowercaseMsg = message.toLowerCase();
  
  try {
    // Load knowledge base from PostgreSQL if available
    let knowledgeBase = inMemoryDB.knowledgeBase;
    if (usePostgres && pool) {
      const { rows } = await pool.query(
        "SELECT id, category, intent, patterns, bot_response, is_active FROM knowledge_base WHERE is_active = true"
      );
      knowledgeBase = rows.map(row => ({
        ...row,
        patterns: Array.isArray(row.patterns) ? row.patterns : (typeof row.patterns === 'string' ? JSON.parse(row.patterns) : []),
        botResponse: row.bot_response || row.botResponse,
        isActive: row.is_active !== undefined ? row.is_active : row.isActive
      }));
    }
    
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
    const kbContext = inMemoryDB.knowledgeBase.filter(k=>k.isActive).map(k => `Q: ${k.patterns.join(", ")} A: ${k.botResponse}`).join("\n");
    const systemPrompt = `Anda adalah asisten AI ramah untuk Gereja GPdI Melati Depok. Jawab dengan singkat, padat, hangat. Gunakan pengetahuan ini:\n${kbContext}\n\nJika pertanyaan di luar konteks gereja, tolak dengan halus.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: { systemInstruction: systemPrompt },
    });

    res.json({ success: true, data: { response: response.text } });
  } catch (error) {
    console.error("Chat error:", error);
    // Fallback if AI fails
    res.json({ success: true, data: { response: "Mohon maaf, sistem chat sedang sibuk. Silakan hubungi nomor WhatsApp sekretariat gereja." } });
  }
});

// File upload
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
