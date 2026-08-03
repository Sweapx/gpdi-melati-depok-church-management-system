import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Calendar, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Pendaftaran() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'jemaat' | 'event'>('jemaat');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'event') {
      setActiveTab('event');
    }
  }, [searchParams]);
  const [step, setStep] = useState(1);
  const [totalSteps] = useState(2);
  const [formData, setFormData] = useState<any>({ type: activeTab === 'jemaat' ? 'jemaat_baru' : 'event' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        type: activeTab === 'jemaat' ? 'jemaat_baru' : 'event',
        namaPendaftar: formData.namaPendaftar,
        noHp: formData.noHp,
        status: 'Pending',
        tanggalDaftar: new Date().toISOString(),
        ...(activeTab === 'jemaat' ? {
          gender: formData.gender,
          tempatLahir: formData.tempatLahir,
          tanggalLahir: formData.tanggalLahir,
          alamat: formData.alamat,
          rayon: formData.rayon
        } : {
          jenisKegiatan: formData.jenisKegiatan
        })
      };
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      }
    } catch (e) {
      alert('Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({ type: activeTab === 'jemaat' ? 'jemaat_baru' : 'event' });
    setIsSuccess(false);
  };

  return (
    <div className="bg-sand pb-20">
      {/* Header Section */}
      <div className="bg-navy pt-32 pb-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Pendaftaran</h1>
        <p className="text-sand-dark/80 max-w-xl mx-auto">
          Daftar menjadi jemaat baru atau ikuti kegiatan dan event gereja GPdI Melati Depok.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-border-subtle flex gap-2 max-w-md mx-auto">
          <button
            onClick={() => { setActiveTab('jemaat'); resetForm(); }}
            className={clsx(
              "flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === 'jemaat' ? "bg-navy text-white" : "text-text-muted hover:bg-sand-dark"
            )}
          >
            <UserPlus size={18} /> Pendaftaran Jemaat
          </button>
          <button
            onClick={() => { setActiveTab('event'); resetForm(); }}
            className={clsx(
              "flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === 'event' ? "bg-navy text-white" : "text-text-muted hover:bg-sand-dark"
            )}
          >
            <Calendar size={18} /> Pendaftaran Event
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="bg-white rounded-3xl shadow-2xl border border-border-subtle overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
            <div>
              <h2 className="text-xl font-bold text-navy">
                {activeTab === 'jemaat' ? 'Pendaftaran Jemaat Baru' : 'Pendaftaran Event'}
              </h2>
              {!isSuccess && <p className="text-sm text-text-muted mt-1">Langkah {step} dari {totalSteps}</p>}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-2">Pendaftaran Berhasil!</h3>
                  <p className="text-text-muted max-w-sm mb-8">
                    Data Anda telah kami terima dan sedang dalam proses verifikasi. Kami akan menghubungi Anda segera.
                  </p>
                  <button 
                    onClick={resetForm}
                    className="bg-navy text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-navy-light transition-colors"
                  >
                    Daftar Lagi
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === 1 && (
                    <div className="space-y-5">
                      {activeTab === 'jemaat' ? (
                        <>
                          <h3 className="text-lg font-bold text-navy mb-4 border-b border-border-subtle pb-2">Data Pendaftaran Jemaat Baru</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-sm font-bold text-navy">Nama Lengkap</label>
                              <input name="namaPendaftar" onChange={handleChange} value={formData.namaPendaftar || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold focus:border-gold outline-none transition-all bg-sand-dark/50" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-bold text-navy">Jenis Kelamin</label>
                              <select name="gender" onChange={handleChange} value={formData.gender || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50">
                                <option value="">Pilih...</option>
                                <option value="Pria">Pria</option>
                                <option value="Wanita">Wanita</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-bold text-navy">Tempat Lahir</label>
                              <input name="tempatLahir" onChange={handleChange} value={formData.tempatLahir || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-bold text-navy">Tanggal Lahir</label>
                              <input type="date" name="tanggalLahir" onChange={handleChange} value={formData.tanggalLahir || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-bold text-navy">No. WhatsApp</label>
                              <input name="noHp" onChange={handleChange} value={formData.noHp || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-sm font-bold text-navy">Alamat Lengkap</label>
                              <textarea name="alamat" onChange={handleChange} value={formData.alamat || ''} rows={2} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all resize-none bg-sand-dark/50" />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-sm font-bold text-navy">Rayon</label>
                              <select name="rayon" onChange={handleChange} value={formData.rayon || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50">
                                <option value="">Pilih Rayon...</option>
                                <option value="Rayon 1">Rayon 1</option>
                                <option value="Rayon 2">Rayon 2</option>
                                <option value="Rayon 3">Rayon 3</option>
                                <option value="Rayon 4">Rayon 4</option>
                                <option value="Rayon 5">Rayon 5</option>
                              </select>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold text-navy mb-4 border-b border-border-subtle pb-2">Data Pendaftaran Event</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-sm font-bold text-navy">Jenis Kegiatan</label>
                              <select name="jenisKegiatan" onChange={handleChange} value={formData.jenisKegiatan || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50">
                                <option value="">Pilih Kegiatan...</option>
                                <option value="Ibadah Padang Sekolah Minggu">Ibadah Padang Sekolah Minggu</option>
                                <option value="Retreat Pemudia">Retreat Pemudia</option>
                                <option value="Retreat Pemudi">Retreat Pemudi</option>
                                <option value="Natal Bersama">Natal Bersama</option>
                                <option value="Paskah Bersama">Paskah Bersama</option>
                                <option value="Lainnya">Lainnya</option>
                              </select>
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-sm font-bold text-navy">Nama Lengkap</label>
                              <input name="namaPendaftar" onChange={handleChange} value={formData.namaPendaftar || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold focus:border-gold outline-none transition-all bg-sand-dark/50" />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-sm font-bold text-navy">No. WhatsApp</label>
                              <input name="noHp" onChange={handleChange} value={formData.noHp || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <h3 className="text-lg font-bold text-navy mb-4 border-b border-border-subtle pb-2">Konfirmasi Data</h3>
                      <div className="bg-sand-dark rounded-xl p-5 border border-border-subtle space-y-3">
                        {activeTab === 'jemaat' ? (
                          <>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                              <span className="text-text-muted">Nama Lengkap</span>
                              <span className="col-span-2 font-bold text-navy">{formData.namaPendaftar || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                              <span className="text-text-muted">Jenis Kelamin</span>
                              <span className="col-span-2 font-bold text-navy">{formData.gender || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                              <span className="text-text-muted">Tempat Lahir</span>
                              <span className="col-span-2 font-bold text-navy">{formData.tempatLahir || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                              <span className="text-text-muted">Tanggal Lahir</span>
                              <span className="col-span-2 font-bold text-navy">{formData.tanggalLahir || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                              <span className="text-text-muted">No WA</span>
                              <span className="col-span-2 font-bold text-navy">{formData.noHp || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                              <span className="text-text-muted">Alamat</span>
                              <span className="col-span-2 font-bold text-navy">{formData.alamat || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm pb-1">
                              <span className="text-text-muted">Rayon</span>
                              <span className="col-span-2 font-bold text-navy">{formData.rayon || '-'}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                              <span className="text-text-muted">Jenis Kegiatan</span>
                              <span className="col-span-2 font-bold text-navy">{formData.jenisKegiatan || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                              <span className="text-text-muted">Nama Lengkap</span>
                              <span className="col-span-2 font-bold text-navy">{formData.namaPendaftar || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm pb-1">
                              <span className="text-text-muted">No WA</span>
                              <span className="col-span-2 font-bold text-navy">{formData.noHp || '-'}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-start gap-3 mt-6">
                        <input type="checkbox" id="terms" checked={formData.isAgreedToTerms || false} onChange={e => setFormData({...formData, isAgreedToTerms: e.target.checked})} className="mt-1 w-4 h-4 text-gold rounded border-border-subtle focus:ring-gold accent-gold" />
                        <label htmlFor="terms" className="text-sm text-text-muted leading-relaxed">
                          Saya menyatakan bahwa data yang diisi adalah benar dan menyetujui data ini disimpan untuk keperluan administrasi Gereja GPdI Melati Depok.
                        </label>
                      </div>
                      <p className="text-xs font-bold text-navy bg-gold/20 p-3 rounded-lg border border-gold/40 flex items-center gap-2">
                        <AlertCircle size={14} className="text-gold" /> Pastikan data di atas sudah benar sebelum menekan tombol Kirim.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!isSuccess && (
            <div className="p-4 sm:p-6 border-t border-border-subtle bg-sand-dark flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={step === 1}
                className={clsx(
                  "px-5 py-2.5 rounded-full font-bold uppercase tracking-wider transition-colors flex items-center gap-2 text-xs",
                  step === 1 ? "text-text-muted cursor-not-allowed" : "text-navy bg-white border border-border-subtle hover:bg-sand-darker hover:border-gold"
                )}
              >
                ← Kembali
              </button>
              
              {step < 2 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-full font-bold uppercase tracking-wider bg-navy text-white hover:bg-navy-light transition-colors flex items-center gap-2 text-xs shadow-sm"
                >
                  Selanjutnya →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full font-bold uppercase tracking-wider bg-gold text-navy hover:bg-gold/80 transition-colors flex items-center gap-2 text-xs shadow-md shadow-gold/20 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  ) : (
                    <>Kirim Data <CheckCircle size={16} /></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
