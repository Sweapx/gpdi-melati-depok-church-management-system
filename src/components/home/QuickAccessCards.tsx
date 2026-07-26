import { useState } from 'react';
import { UserPlus, Droplets, Heart, QrCode, FileText, Calendar, X, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import MultiStepRegistrationModal from './MultiStepRegistrationModal.tsx';

const actions = [
  {
    id: 'pemutakhiran_data',
    icon: UserPlus,
    title: 'Pemutakhiran Data',
    desc: 'Update data jemaat aktif',
    color: 'bg-sand-dark text-navy group-hover:bg-navy group-hover:text-gold transition-colors',
    hover: 'hover:border-gold hover:shadow-md group',
  },
  {
    id: 'jemaat_baru',
    icon: UserPlus,
    title: 'Pendaftaran Jemaat',
    desc: 'Formulir data jemaat baru & sensus',
    color: 'bg-sand-dark text-navy group-hover:bg-navy group-hover:text-gold transition-colors',
    hover: 'hover:border-gold hover:shadow-md group',
  },
  {
    id: 'baptisan',
    icon: Droplets,
    title: 'Baptisan Air',
    desc: 'Pendaftaran baptisan selam',
    color: 'bg-sand-dark text-navy group-hover:bg-navy group-hover:text-gold transition-colors',
    hover: 'hover:border-gold hover:shadow-md group',
  },
  {
    id: 'doa',
    icon: Heart,
    title: 'Permohonan Doa',
    desc: 'Kirimkan pokok doa Anda',
    color: 'bg-sand-dark text-navy group-hover:bg-navy group-hover:text-gold transition-colors',
    hover: 'hover:border-gold hover:shadow-md group',
  },
  {
    id: 'qr',
    icon: QrCode,
    title: 'Validasi Surat',
    desc: 'Cek keaslian dokumen gereja',
    color: 'bg-sand-dark text-navy group-hover:bg-navy group-hover:text-gold transition-colors',
    hover: 'hover:border-gold hover:shadow-md group',
  },
  {
    id: 'warta',
    icon: FileText,
    title: 'Warta Jemaat',
    desc: 'Baca warta digital minggu ini',
    color: 'bg-sand-dark text-navy group-hover:bg-navy group-hover:text-gold transition-colors',
    hover: 'hover:border-gold hover:shadow-md group',
  }
];

export default function QuickAccessCards() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    if (id === 'warta') {
      window.location.href = '/warta';
      return;
    }
    setActiveModal(id);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 -mt-10 relative z-10">
        {actions.map((action, idx) => (
          <motion.button
            key={action.title}
            onClick={() => handleCardClick(action.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "bg-white p-5 rounded-2xl border border-border-subtle shadow-sm text-left flex flex-col gap-3 transition-all cursor-pointer",
              action.hover
            )}
          >
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", action.color)}>
              <action.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-navy text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{action.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeModal === 'jemaat_baru' || activeModal === 'baptisan' || activeModal === 'pemutakhiran_data' ? (
          <MultiStepRegistrationModal 
            type={activeModal as 'jemaat_baru' | 'baptisan' | 'pemutakhiran_data'} 
            onClose={() => setActiveModal(null)} 
          />
        ) : null}
        
        {/* Placeholder for others */}
        {activeModal === 'doa' && (
          <GenericModal title="Permohonan Doa" onClose={() => setActiveModal(null)}>
            <DoaForm onClose={() => setActiveModal(null)} />
          </GenericModal>
        )}
        {activeModal === 'qr' && (
          <GenericModal title="Validasi Surat" onClose={() => setActiveModal(null)}>
            <QrValidationForm />
          </GenericModal>
        )}
      </AnimatePresence>
    </>
  );
}

function DoaForm({ onClose }: { onClose: () => void }) {
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
      <div className="text-center py-8">
        <Heart className="mx-auto text-rose-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-navy mb-2">Permohonan Doa Terkirim</h3>
        <p className="text-sm text-text-muted mb-6">Kami akan mendoakan pokok doa Anda.</p>
        <button onClick={onClose} className="bg-navy text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-navy-light transition-colors">Tutup</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-bold text-navy block mb-1">Nama (Opsional)</label>
        <input 
          type="text" 
          disabled={formData.isAnonim}
          value={formData.nama}
          onChange={e => setFormData({ ...formData, nama: e.target.value })}
          className="w-full border border-border-subtle rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-gold outline-none disabled:bg-sand-dark disabled:text-text-muted" 
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
          rows={4}
          value={formData.isiDoa}
          onChange={e => setFormData({ ...formData, isiDoa: e.target.value })}
          className="w-full border border-border-subtle rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-gold outline-none resize-none" 
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
  );
}

function GenericModal({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border-subtle"
      >
        <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
          <h2 className="text-xl font-bold text-navy">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-sand-darker rounded-full transition-colors text-text-muted hover:text-navy"><X size={20} /></button>
        </div>
        <div className="p-6 text-navy">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function QrValidationForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResult(null);
    
    try {
      const res = await fetch(`/api/certificates/validate/${code.trim()}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError('Dokumen tidak ditemukan atau tidak valid.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memvalidasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleValidate}>
        <label className="text-sm font-bold text-navy block mb-2">
          Masukkan Kode Unik Sertifikat / Dokumen
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Misal: BAP-2026-001"
            className="flex-grow border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-gold outline-none" 
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-navy text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-navy-light transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
          >
            {isLoading ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <><Search size={16} /> Cek</>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-bold text-rose-800">Validasi Gagal</p>
            <p className="text-sm text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sand-dark border border-border-subtle p-5 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4 text-emerald-600">
            <CheckCircle size={20} />
            <h3 className="font-bold">Dokumen Valid & Resmi</h3>
          </div>
          
          <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-border-subtle">
            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
              <span className="text-text-muted">Kode</span>
              <span className="col-span-2 font-bold text-navy">{result.code}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
              <span className="text-text-muted">Tipe Dokumen</span>
              <span className="col-span-2 font-bold text-navy">{result.type}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
              <span className="text-text-muted">Atas Nama</span>
              <span className="col-span-2 font-bold text-navy">{result.recipientName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
              <span className="text-text-muted">Tanggal</span>
              <span className="col-span-2 font-bold text-navy">{new Date(result.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
              <span className="text-text-muted">Pendeta</span>
              <span className="col-span-2 font-bold text-navy">{result.pastorName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-text-muted">Dikeluarkan Oleh</span>
              <span className="col-span-2 font-bold text-navy">{result.churchName}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
