import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Heart, QrCode, Search, CheckCircle, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';
import FileUpload from '../components/ui/FileUpload';

export default function Layanan() {
  const [activeTab, setActiveTab] = useState<'baptisan' | 'doa'>('baptisan');

  return (
    <div className="bg-sand pb-20">
      {/* Header Section */}
      <div className="bg-navy pt-32 pb-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Layanan</h1>
        <p className="text-sand-dark/80 max-w-xl mx-auto">
          Berbagai layanan digital gereja untuk memudahkan kebutuhan rohani dan administrasi jemaat.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-border-subtle flex gap-2 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('baptisan')}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === 'baptisan' ? "bg-navy text-white" : "text-text-muted hover:bg-sand-dark"
            )}
          >
            <Droplets size={18} /> Baptisan
          </button>
          <button
            onClick={() => setActiveTab('doa')}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === 'doa' ? "bg-navy text-white" : "text-text-muted hover:bg-sand-dark"
            )}
          >
            <Heart size={18} /> Permohonan Doa
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <AnimatePresence mode="wait">
          {activeTab === 'baptisan' && (
            <motion.div
              key="baptisan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BaptisanForm />
            </motion.div>
          )}
          {activeTab === 'doa' && (
            <motion.div
              key="doa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DoaForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BaptisanForm() {
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    alamat: '',
    noHp: '',
    gender: '',
    tanggalLahir: ''
  });
  const [pasfoto, setPasfoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        type: 'baptisan',
        namaPendaftar: formData.nama,
        nik: formData.nik,
        alamat: formData.alamat,
        noHp: formData.noHp,
        gender: formData.gender,
        tanggalLahir: formData.tanggalLahir,
        pasfotoBaptis: pasfoto,
        status: 'Pending',
        tanggalDaftar: new Date().toISOString()
      };
      
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsSuccess(true);
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl border border-border-subtle p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h3 className="text-2xl font-bold text-navy mb-2">Pendaftaran Baptisan Terkirim</h3>
        <p className="text-text-muted max-w-sm mx-auto mb-8">
          Data pendaftaran baptisan Anda telah kami terima dan sedang dalam proses verifikasi.
        </p>
        <button 
          onClick={() => { setIsSuccess(false); setFormData({ nama: '', nik: '', alamat: '', noHp: '', gender: '', tanggalLahir: '' }); setPasfoto(''); }}
          className="bg-navy text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-navy-light transition-colors"
        >
          Daftar Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-border-subtle overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border-subtle bg-sand-dark">
        <h2 className="text-xl font-bold text-navy mb-2">Pendaftaran Baptisan Air</h2>
        <p className="text-sm text-text-muted">Isi formulir di bawah untuk mendaftar baptisan air selam.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-navy">Nama Lengkap</label>
            <input 
              type="text" 
              value={formData.nama}
              onChange={e => setFormData({ ...formData, nama: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-navy">NIK</label>
            <input 
              type="text" 
              value={formData.nik}
              onChange={e => setFormData({ ...formData, nik: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-navy">Jenis Kelamin</label>
            <select 
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
              required
            >
              <option value="">Pilih...</option>
              <option value="Pria">Pria</option>
              <option value="Wanita">Wanita</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-navy">No. WhatsApp</label>
            <input 
              type="text" 
              value={formData.noHp}
              onChange={e => setFormData({ ...formData, noHp: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-navy">Tanggal Lahir</label>
            <input 
              type="date" 
              value={formData.tanggalLahir}
              onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-navy">Alamat Lengkap</label>
          <textarea 
            value={formData.alamat}
            onChange={e => setFormData({ ...formData, alamat: e.target.value })}
            rows={3}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none resize-none bg-sand-dark/50"
            required
          />
        </div>
        <div>
          <FileUpload label="Upload Pasfoto 3x4" accept="image/jpeg, image/png" previewUrl={pasfoto} onFileSelect={setPasfoto} />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-navy text-gold font-bold py-3 rounded-full hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
        </button>
      </form>
    </div>
  );
}

function DoaForm() {
  const [formData, setFormData] = useState({ nama: '', isiDoa: '', isAnonim: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        nama: formData.isAnonim ? 'Anonim' : formData.nama || 'Anonim',
        isiDoa: formData.isiDoa,
        kategori: 'Lainnya',
        privasi: formData.isAnonim ? 'Rahasia Tim Doa' : 'Publik',
        status: 'Baru',
        noHp: '-',
        tanggal: new Date().toISOString()
      };
      
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsSuccess(true);
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl border border-border-subtle p-8 text-center">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart size={40} />
        </div>
        <h3 className="text-2xl font-bold text-navy mb-2">Permohonan Doa Terkirim</h3>
        <p className="text-text-muted max-w-sm mx-auto mb-8">
          Kami akan mendoakan pokok doa Anda.
        </p>
        <button 
          onClick={() => { setIsSuccess(false); setFormData({ nama: '', isiDoa: '', isAnonim: false }); }}
          className="bg-navy text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-navy-light transition-colors"
        >
          Kirim Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-border-subtle overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border-subtle bg-sand-dark">
        <h2 className="text-xl font-bold text-navy mb-2">Permohonan Doa</h2>
        <p className="text-sm text-text-muted">Kirimkan pokok doa Anda, tim doa kami akan mendoakan Anda.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
        <div>
          <label className="text-sm font-bold text-navy block mb-1">Nama (Opsional)</label>
          <input 
            type="text" 
            disabled={formData.isAnonim}
            value={formData.nama}
            onChange={e => setFormData({ ...formData, nama: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none disabled:bg-sand-dark disabled:text-text-muted"
            placeholder={formData.isAnonim ? 'Anonim' : 'Nama Anda'}
          />
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="anonim" 
              checked={formData.isAnonim}
              onChange={e => setFormData({ ...formData, isAnonim: e.target.checked, nama: e.target.checked ? 'Anonim' : '' })}
              className="text-gold focus:ring-gold"
            />
            <label htmlFor="anonim" className="text-xs text-text-muted">Kirim sebagai Anonim</label>
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-navy block mb-1">Pokok Doa</label>
          <textarea 
            required
            rows={5}
            value={formData.isiDoa}
            onChange={e => setFormData({ ...formData, isiDoa: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none resize-none bg-sand-dark/50"
            placeholder="Tuliskan pokok doa Anda di sini..."
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-navy text-gold font-bold py-3 rounded-full hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Pokok Doa'}
        </button>
      </form>
    </div>
  );
}


