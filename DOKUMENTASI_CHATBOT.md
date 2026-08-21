# Dokumentasi Fitur Chatbot AI — GPdI Melati Depok Church Management System

Dokumen ini menjelaskan secara teknis dan menyeluruh arsitektur, stack teknologi, alur kerja, serta tahapan implementasi fitur **Chatbot AI Hybrid** pada aplikasi Church Management System GPdI Melati Depok.

---

## 1. Gambaran Umum

Chatbot ini menggunakan pendekatan **Hybrid: Keyword Matching + Knowledge Base Injection via System Prompt** dengan Google Gemini AI sebagai model bahasa utama.

> **Catatan Penting**: Chatbot ini **bukan RAG (Retrieval-Augmented Generation)**. Seluruh isi Knowledge Base dimasukkan langsung ke dalam *system prompt* Gemini setiap kali ada permintaan, bukan menggunakan vector similarity search.

---

## 2. Stack Teknologi

### Backend
| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Runtime** | Node.js + TypeScript | Server utama aplikasi |
| **Framework** | Express.js | HTTP server & routing |
| **AI Model** | Google Gemini 2.5 Flash | Model LLM untuk generate jawaban |
| **AI SDK** | `@google/genai` | SDK resmi Google untuk Node.js |
| **Database** | PostgreSQL | Penyimpanan Knowledge Base (produksi) |
| **Fallback DB** | In-Memory (JavaScript Object) | Digunakan jika PostgreSQL tidak tersedia |

### Frontend
| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Framework** | React + TypeScript | Komponen UI chatbot |
| **Animasi** | `motion` (Framer Motion) | Animasi buka/tutup widget |
| **Ikon** | `lucide-react` | Ikon tombol chat |
| **Styling Helper** | `clsx` | Utility class kondisional |
| **Widget Style** | CSS `position: fixed` | Floating widget pojok kanan bawah |

### Konfigurasi Environment
```env
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
```

---

## 3. Struktur File

```
src/
├── server/
│   └── routes/
│       ├── api.ts               ← Endpoint chatbot (POST /chat) + CRUD KB
│       └── api-postgres.ts      ← Versi PostgreSQL dari endpoint
├── components/
│   └── ChatbotWidget.tsx        ← Komponen UI floating widget
├── pages/
│   └── admin/
│       └── KnowledgeBase.tsx    ← Halaman admin untuk kelola Knowledge Base
```

---

## 4. Struktur Database Knowledge Base

### Tabel `knowledge_base` (PostgreSQL)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID / Serial | Primary Key |
| `patterns` | JSONB (Array of Text) | Kata kunci pemicu jawaban. Contoh: `["jadwal", "ibadah minggu"]` |
| `bot_response` | Text | Jawaban baku yang ditulis oleh admin |
| `is_active` | Boolean | Status aktif/nonaktif entri KB |

### In-Memory Fallback (`inMemoryDB.knowledgeBase`)
Struktur identik, disimpan sebagai array JavaScript di memori. Direset setiap kali server restart.

---

## 5. Alur Kerja Chatbot (Flow)

```
User mengirim pesan
        │
        ▼
[Backend: POST /api/chat]
        │
        ▼
Load Knowledge Base dari PostgreSQL
(atau in-memory jika PG tidak tersedia)
        │
        ▼
┌─────────────────────────────────┐
│  STEP 1: Keyword Matching       │
│  Cocokkan pesan user dengan     │
│  field `patterns` di setiap KB  │
└─────────────────────────────────┘
        │
   Ada yang cocok?
   ┌────┴────┐
  YA       TIDAK
   │          │
   │          ▼
   │   Apakah GEMINI_API_KEY ada?
   │     ┌────┴────┐
   │    YA       TIDAK
   │     │          │
   │     ▼          ▼
   │  [STEP 2]   Balas dengan
   │  Panggil    pesan default
   │  Gemini AI  (tanpa AI)
   │     │
   │     ▼
   │  Bangun System Prompt:
   │  - Identitas bot gereja
   │  - Inject SELURUH KB aktif
   │     │
   │     ▼
   │  Kirim ke Gemini 2.5 Flash
   │  → Terima jawaban AI
   │
   └──────────────────┐
                      ▼
              Kirim response ke Frontend
```

---

## 6. Implementasi Backend

**File**: `src/server/routes/api.ts`

### Endpoint Chatbot
```typescript
// POST /api/chat
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  const lowercaseMsg = message.toLowerCase();

  // 1. Load Knowledge Base
  let knowledgeBase = inMemoryDB.knowledgeBase;
  if (usePostgres && pool) {
    const { rows } = await pool.query(
      "SELECT id, patterns, bot_response, is_active FROM knowledge_base WHERE is_active = true"
    );
    knowledgeBase = rows.map(row => ({
      ...row,
      patterns: Array.isArray(row.patterns) ? row.patterns : JSON.parse(row.patterns),
      botResponse: row.bot_response,
      isActive: row.is_active
    }));
  }

  // 2. Keyword Matching
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

  // 3. Jika tidak ada API Key → balas dari KB atau pesan default
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      data: { response: kbMatch ?? "Maaf, silakan hubungi sekretariat." }
    });
  }

  // 4. Panggil Gemini dengan KB sebagai konteks
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const kbContext = knowledgeBase
    .filter(k => k.isActive)
    .map(k => `Q: ${k.patterns.join(", ")} A: ${k.botResponse}`)
    .join("\n");

  const systemPrompt = `Anda adalah asisten AI ramah untuk Gereja GPdI Melati Depok.
Jawab dengan singkat, padat, hangat.
Gunakan pengetahuan ini:\n${kbContext}\n\nJika pertanyaan di luar konteks gereja, tolak dengan halus.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message,
    config: { systemInstruction: systemPrompt },
  });

  res.json({ success: true, data: { response: response.text } });
});
```

---

## 7. Implementasi Frontend

**File**: `src/components/ChatbotWidget.tsx`

### State yang Digunakan
```typescript
const [isOpen, setIsOpen] = useState(false);         // Buka/tutup widget
const [messages, setMessages] = useState([            // Riwayat percakapan
  { role: 'bot', text: 'Shalom! Ada yang bisa dibantu?' }
]);
const [input, setInput] = useState('');               // Teks input user
const [isLoading, setIsLoading] = useState(false);    // Status loading AI
```

### Fungsi Kirim Pesan
```typescript
const handleSend = async (text: string) => {
  // 1. Tambah pesan user ke state
  // 2. Set isLoading = true (tampilkan typing indicator)
  // 3. Fetch POST ke /api/chat
  // 4. Tambah balasan bot ke state messages
  // 5. Set isLoading = false
};
```

### Elemen UI
| Elemen | Deskripsi |
|---|---|
| **Tombol Toggle** | Ikon chat, `position: fixed` pojok kanan bawah |
| **Area Chat** | Dibungkus `<AnimatePresence>` + `<motion.div>` untuk animasi |
| **Bubble Chat** | User (kanan) dan Bot (kiri) dibedakan warna |
| **Typing Indicator** | Animasi titik-titik bergerak saat `isLoading = true` |
| **Input Box** | Text input + tombol kirim di bagian bawah |

---

## 8. Manajemen Knowledge Base (Admin)

**File**: `src/pages/admin/KnowledgeBase.tsx`

Admin dapat mengelola Knowledge Base melalui antarmuka admin:
- **Tambah** entri baru (patterns + jawaban)
- **Edit** entri yang sudah ada
- **Aktifkan / Nonaktifkan** entri tanpa menghapus
- **Hapus** entri yang tidak diperlukan

Perubahan pada Knowledge Base langsung berpengaruh ke respons chatbot tanpa perlu restart server.

---

## 9. Integrasi ke Aplikasi Utama

**File**: `App.tsx` atau Layout Utama

```tsx
import ChatbotWidget from './components/ChatbotWidget';

function App() {
  return (
    <div>
      <Router />
      {/* Widget Chatbot muncul di semua halaman */}
      <ChatbotWidget />
    </div>
  );
}
```

Widget dipasang secara **global** sehingga muncul di seluruh halaman aplikasi (publik maupun internal).

---

## 10. Keterbatasan & Catatan Teknis

| Aspek | Kondisi Saat Ini | Rekomendasi |
|---|---|---|
| **Metode retrieval** | Keyword matching sederhana | Bisa ditingkatkan ke fuzzy matching atau semantic search |
| **Skalabilitas KB** | Seluruh KB dikirim ke Gemini setiap request | Jika KB besar, pertimbangkan RAG dengan pgvector |
| **Riwayat percakapan** | Tidak ada multi-turn memory | Tambahkan session/context window untuk percakapan berkelanjutan |
| **Fallback AI gagal** | Balas dengan pesan statis | Sudah tertangani di blok `catch` |
| **Keamanan API Key** | Disimpan di `.env` server | Jangan expose ke frontend, sudah benar |

---

*Dokumentasi ini dibuat berdasarkan analisis kode aktual pada: `src/server/routes/api.ts` dan `src/components/ChatbotWidget.tsx`*

---

## Tahap 1: Persiapan dan Kebutuhan (Prerequisites)

Sebelum mulai menulis kode, ada beberapa pustaka (*libraries*) dan konfigurasi yang perlu disiapkan:

1. **Dependensi Backend**:
   Install SDK resmi Google Gemini untuk Node.js:
   ```bash
   npm install @google/genai
   ```

2. **Dependensi Frontend**:
   Untuk membuat UI yang menarik, install pustaka ikon dan animasi:
   ```bash
   npm install lucide-react motion clsx
   ```

3. **Konfigurasi Environment**:
   Dapatkan API Key dari Google AI Studio dan tambahkan ke file `.env` di proyek Anda:
   ```env
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
   ```

---

## Tahap 2: Menyiapkan Database "Knowledge Base"

Agar chatbot memiliki konteks spesifik seputar gereja, buat tabel di database PostgreSQL (atau siapkan struktur data *in-memory*).

**Struktur Tabel `knowledge_base`**:
- `id` (UUID / Serial): Primary Key
- `patterns` (JSONB / Array of Text): Kata kunci yang memicu jawaban (contoh: `["jadwal", "ibadah minggu"]`)
- `bot_response` (Text): Jawaban baku dari admin
- `is_active` (Boolean): Status aktif/tidaknya basis pengetahuan tersebut.

---

## Tahap 3: Implementasi Backend (Endpoint API)
**Lokasi File**: `src/server/routes/api.ts` (atau sejenisnya)

Buat endpoint `POST /chat` yang akan memproses pesan dari pengguna:

1. **Tangkap Pesan Pengguna**:
   ```typescript
   router.post("/chat", async (req, res) => {
     const { message } = req.body;
     const lowercaseMsg = message.toLowerCase();
     // ...
   });
   ```

2. **Muat Knowledge Base dari Database**:
   Lakukan *query* ke PostgreSQL untuk mengambil semua data *knowledge base* yang berstatus aktif.

3. **Logika Fallback (Jika Tanpa AI)**:
   Buat perulangan untuk mencocokkan kata dalam pesan pengguna dengan `patterns` di *knowledge base*. Jika cocok, simpan jawaban ke dalam sebuah variabel (misal: `kbMatch`).

4. **Integrasi Google Gemini AI**:
   Gabungkan data *knowledge base* menjadi satu string konteks, lalu buat *System Prompt*:
   ```typescript
   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
   
   // Inject Knowledge Base ke System Prompt
   const kbContext = knowledgeBase.map(k => `Q: ${k.patterns.join(", ")} A: ${k.botResponse}`).join("\n");
   const systemPrompt = `Anda adalah asisten AI ramah untuk Gereja GPdI Melati Depok. Jawab dengan singkat, padat, hangat. Gunakan pengetahuan ini:\n${kbContext}\n\nJika pertanyaan di luar konteks gereja, tolak dengan halus.`;
   
   const response = await ai.models.generateContent({
     model: "gemini-2.5-flash",
     contents: message,
     config: { systemInstruction: systemPrompt },
   });

   res.json({ success: true, data: { response: response.text } });
   ```

---

## Tahap 4: Implementasi Frontend (Komponen Chatbot)
**Lokasi File**: `src/components/ChatbotWidget.tsx`

Buat komponen antarmuka chat bergaya *floating widget* (melayang di pojok kanan bawah):

1. **Manajemen State (Hook React)**:
   Siapkan *state* untuk mengelola obrolan:
   ```typescript
   const [isOpen, setIsOpen] = useState(false);
   const [messages, setMessages] = useState([{ role: 'bot', text: 'Shalom! Ada yang bisa dibantu?' }]);
   const [input, setInput] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   ```

2. **Fungsi Mengirim Pesan**:
   Buat fungsi `handleSend` yang melakukan *fetch* ke `/api/chat`:
   ```typescript
   const handleSend = async (text: string) => {
     // Tambahkan pesan user ke state
     // Set isLoading = true
     // Fetch ke /api/chat method POST
     // Terima balasan dari API dan tambahkan ke state messages
     // Set isLoading = false
   }
   ```

3. **Menyusun UI (Antarmuka)**:
   - Buat **Tombol Toggle** di pojok layar (menggunakan posisi `fixed`).
   - Buat **Area Chat** yang dibungkus oleh `<AnimatePresence>` dan `<motion.div>` agar memiliki efek animasi saat dibuka/tutup.
   - Buat pemetaan (`map`) dari *state* `messages` untuk membedakan gelembung obrolan (bubble chat) antara `user` (di kanan) dan `bot` (di kiri).
   - Tambahkan efek *typing indicator* (animasi titik-titik bergerak) saat `isLoading` bernilai *true*.
   - Siapkan **Input Box** di bagian bawah komponen untuk mengetik pesan.

---

## Tahap 5: Pemasangan (Integrasi ke Aplikasi)

Setelah komponen `ChatbotWidget` selesai, pasangkan secara global di halaman aplikasi utama agar widget selalu muncul di setiap halaman publik maupun internal (sesuai kebutuhan).

**Contoh di `App.tsx` atau Layout Utama**:
```tsx
import ChatbotWidget from './components/ChatbotWidget';

function App() {
  return (
    <div>
      {/* Konten Utama Aplikasi */}
      <Router />
      
      {/* Pasang Widget Chatbot di Sini */}
      <ChatbotWidget />
    </div>
  );
}
```

---
**Selesai!** Fitur Chatbot AI pintar dan dinamis Anda kini telah berhasil dibuat dan siap digunakan.
