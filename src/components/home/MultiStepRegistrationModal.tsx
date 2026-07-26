import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, UploadCloud, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { RegistrationType } from '../../types/index.ts';
import FileUpload from '../ui/FileUpload';

type Props = {
  type: RegistrationType;
  onClose: () => void;
  eventConfig?: any;
};

export default function MultiStepRegistrationModal({ type, onClose, eventConfig }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({ type });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'Pending', tanggalDaftar: new Date().toISOString() })
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

  const getTitle = () => {
    if (type === 'jemaat_baru') return 'Pendaftaran Jemaat Baru';
    if (type === 'pemutakhiran_data') return 'Pemutakhiran Data Jemaat';
    if (type === 'baptisan') return 'Pendaftaran Baptisan Air';
    if (type === 'event') return `Pendaftaran ${eventConfig?.judul || 'Event'}`;
    return 'Registrasi';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-border-subtle"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
          <div>
            <h2 className="text-xl font-bold text-navy">{getTitle()}</h2>
            {!isSuccess && <p className="text-sm text-text-muted mt-1">Langkah {step} dari 3</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sand-darker rounded-full transition-colors text-text-muted hover:text-navy">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6">
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
                  onClick={onClose}
                  className="bg-navy text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-navy-light transition-colors"
                >
                  Selesai & Tutup
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
                    <h3 className="text-lg font-bold text-navy mb-4 border-b border-border-subtle pb-2">Data Pribadi / Kepala Keluarga</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-navy">Nama Lengkap</label>
                        <input name="namaPendaftar" onChange={handleChange} value={formData.namaPendaftar || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold focus:border-gold outline-none transition-all bg-sand-dark/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-navy">NIK (Sesuai KTP)</label>
                        <input name="nik" onChange={handleChange} value={formData.nik || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
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
                        <label className="text-sm font-bold text-navy">No. WhatsApp</label>
                        <input name="noHp" onChange={handleChange} value={formData.noHp || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-sm font-bold text-navy">Alamat Lengkap</label>
                        <textarea name="alamat" onChange={handleChange} value={formData.alamat || ''} rows={2} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all resize-none bg-sand-dark/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-navy">Provinsi</label>
                        <input name="provinsi" onChange={handleChange} value={formData.provinsi || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-navy">Kota / Kabupaten</label>
                        <input name="kabupatenKota" onChange={handleChange} value={formData.kabupatenKota || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-navy">Kecamatan</label>
                        <input name="kecamatan" onChange={handleChange} value={formData.kecamatan || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-navy">Kelurahan / Desa</label>
                        <input name="kelurahan" onChange={handleChange} value={formData.kelurahan || ''} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" />
                      </div>
                    </div>

                    {type === 'event' && eventConfig?.customFields && eventConfig.customFields.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-border-subtle">
                        <h3 className="text-lg font-bold text-navy mb-4">Informasi Tambahan</h3>
                        <div className="grid grid-cols-1 gap-5">
                          {eventConfig.customFields.map((field: any) => (
                            <div key={field.id} className="space-y-1.5">
                              {field.type === 'checkbox' ? (
                                <div className="flex items-start gap-3 mt-2">
                                  <input 
                                    type="checkbox" 
                                    id={field.id}
                                    checked={formData.customResponses?.[field.label] === true}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        customResponses: {
                                          ...(formData.customResponses || {}),
                                          [field.label]: e.target.checked
                                        }
                                      });
                                    }}
                                    className="mt-1 w-4 h-4 text-gold rounded border-border-subtle focus:ring-gold accent-gold" 
                                  />
                                  <label htmlFor={field.id} className="text-sm font-bold text-navy leading-relaxed">
                                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                                  </label>
                                </div>
                              ) : (
                                <>
                                  <label className="text-sm font-bold text-navy">{field.label} {field.required && <span className="text-rose-500">*</span>}</label>
                                  {field.type === 'select' ? (
                                    <select 
                                      value={formData.customResponses?.[field.label] || ''}
                                      onChange={(e) => {
                                        setFormData({
                                          ...formData,
                                          customResponses: {
                                            ...(formData.customResponses || {}),
                                            [field.label]: e.target.value
                                          }
                                        });
                                      }}
                                      className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50"
                                    >
                                      <option value="">Pilih...</option>
                                      {field.options?.map((opt: string, i: number) => (
                                        <option key={i} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input 
                                      type="text"
                                      value={formData.customResponses?.[field.label] || ''}
                                      onChange={(e) => {
                                        setFormData({
                                          ...formData,
                                          customResponses: {
                                            ...(formData.customResponses || {}),
                                            [field.label]: e.target.value
                                          }
                                        });
                                      }}
                                      className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none transition-all bg-sand-dark/50" 
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(type === 'jemaat_baru' || type === 'pemutakhiran_data') && (
                      <div className="mt-8 pt-6 border-t border-border-subtle">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-navy">Anggota Keluarga (Opsional)</h3>
                          <button
                            type="button"
                            onClick={() => {
                              const existing = formData.anggotaKeluarga || [];
                              setFormData({ ...formData, anggotaKeluarga: [...existing, { nama: '', nik: '', gender: '', statusKeluarga: '', noHp: '', tanggalLahir: '', kategoriKaum: '' }] });
                            }}
                            className="text-xs font-bold bg-navy text-gold px-3 py-1.5 rounded-full hover:bg-navy-light transition-colors"
                          >
                            + Tambah Anggota
                          </button>
                        </div>
                        
                        {(formData.anggotaKeluarga || []).map((anggota: any, idx: number) => (
                          <div key={idx} className="bg-sand-dark rounded-xl p-4 mb-4 relative border border-border-subtle">
                            <button
                              type="button"
                              onClick={() => {
                                const newArr = [...formData.anggotaKeluarga];
                                newArr.splice(idx, 1);
                                setFormData({ ...formData, anggotaKeluarga: newArr });
                              }}
                              className="absolute top-3 right-3 text-rose-500 hover:text-rose-700"
                            >
                              <X size={16} />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                              <div>
                                <label className="text-xs font-bold text-navy">Nama Lengkap</label>
                                <input
                                  value={anggota.nama}
                                  onChange={(e) => {
                                    const newArr = [...formData.anggotaKeluarga];
                                    newArr[idx].nama = e.target.value;
                                    setFormData({ ...formData, anggotaKeluarga: newArr });
                                  }}
                                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-navy">NIK</label>
                                <input
                                  value={anggota.nik}
                                  onChange={(e) => {
                                    const newArr = [...formData.anggotaKeluarga];
                                    newArr[idx].nik = e.target.value;
                                    setFormData({ ...formData, anggotaKeluarga: newArr });
                                  }}
                                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-navy">No. HP (Opsional)</label>
                                <input
                                  value={anggota.noHp}
                                  onChange={(e) => {
                                    const newArr = [...formData.anggotaKeluarga];
                                    newArr[idx].noHp = e.target.value;
                                    setFormData({ ...formData, anggotaKeluarga: newArr });
                                  }}
                                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-navy">Tanggal Lahir</label>
                                <input
                                  type="date"
                                  value={anggota.tanggalLahir}
                                  onChange={(e) => {
                                    const newArr = [...formData.anggotaKeluarga];
                                    newArr[idx].tanggalLahir = e.target.value;
                                    setFormData({ ...formData, anggotaKeluarga: newArr });
                                  }}
                                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-navy">Jenis Kelamin</label>
                                <select
                                  value={anggota.gender}
                                  onChange={(e) => {
                                    const newArr = [...formData.anggotaKeluarga];
                                    newArr[idx].gender = e.target.value;
                                    setFormData({ ...formData, anggotaKeluarga: newArr });
                                  }}
                                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none"
                                >
                                  <option value="">Pilih...</option>
                                  <option value="Pria">Pria</option>
                                  <option value="Wanita">Wanita</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-navy">Kategori Kaum</label>
                                <select
                                  value={anggota.kategoriKaum}
                                  onChange={(e) => {
                                    const newArr = [...formData.anggotaKeluarga];
                                    newArr[idx].kategoriKaum = e.target.value;
                                    setFormData({ ...formData, anggotaKeluarga: newArr });
                                  }}
                                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none"
                                >
                                  <option value="">Pilih...</option>
                                  <option value="Anak">Anak</option>
                                  <option value="Muda">Muda</option>
                                  <option value="Pria">Pria</option>
                                  <option value="Wanita">Wanita</option>
                                  <option value="Lansia">Lansia</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-navy">Status Keluarga</label>
                                <select
                                  value={anggota.statusKeluarga}
                                  onChange={(e) => {
                                    const newArr = [...formData.anggotaKeluarga];
                                    newArr[idx].statusKeluarga = e.target.value;
                                    setFormData({ ...formData, anggotaKeluarga: newArr });
                                  }}
                                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none"
                                >
                                  <option value="">Pilih...</option>
                                  <option value="Suami">Suami</option>
                                  <option value="Istri">Istri</option>
                                  <option value="Anak">Anak</option>
                                  <option value="Lainnya">Lainnya</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-navy mb-4 border-b border-border-subtle pb-2">Berkas & Persyaratan</h3>
                    <div className="space-y-4">
                      
                      {type !== 'event' && (
                        <FileUpload label="Upload Foto KTP" accept="image/jpeg, image/png, application/pdf" previewUrl={formData.lampiranKTP} onFileSelect={(base64) => setFormData({...formData, lampiranKTP: base64})} />
                      )}

                      {type === 'event' && eventConfig?.needPaymentProof && (
                        <FileUpload label="Upload Bukti Pembayaran" accept="image/jpeg, image/png, application/pdf" previewUrl={formData.lampiranBuktiBayar} onFileSelect={(base64) => setFormData({...formData, lampiranBuktiBayar: base64})} />
                      )}
                      
                      {type === 'baptisan' && (
                        <FileUpload label="Upload Pasfoto 3x4" accept="image/jpeg, image/png" previewUrl={formData.pasfotoBaptis} onFileSelect={(base64) => setFormData({...formData, pasfotoBaptis: base64})} />
                      )}

                      <div className="flex items-start gap-3 mt-6">
                        <input type="checkbox" id="terms" checked={formData.isAgreedToTerms || false} onChange={e => setFormData({...formData, isAgreedToTerms: e.target.checked})} className="mt-1 w-4 h-4 text-gold rounded border-border-subtle focus:ring-gold accent-gold" />
                        <label htmlFor="terms" className="text-sm text-text-muted leading-relaxed">
                          Saya menyatakan bahwa data yang diisi adalah benar dan menyetujui data ini disimpan untuk keperluan administrasi Gereja GPdI Melati Depok.
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-navy mb-4 border-b border-border-subtle pb-2">Konfirmasi Data</h3>
                    <div className="bg-sand-dark rounded-xl p-5 border border-border-subtle space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                        <span className="text-text-muted">Nama</span>
                        <span className="col-span-2 font-bold text-navy">{formData.namaPendaftar || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                        <span className="text-text-muted">NIK</span>
                        <span className="col-span-2 font-bold text-navy">{formData.nik || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b border-border-subtle pb-2">
                        <span className="text-text-muted">No WA</span>
                        <span className="col-span-2 font-bold text-navy">{formData.noHp || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm pb-1">
                        <span className="text-text-muted">Alamat</span>
                        <span className="col-span-2 font-bold text-navy">{formData.alamat || '-'}</span>
                      </div>
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
              <ChevronLeft size={16} /> Kembali
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full font-bold uppercase tracking-wider bg-navy text-white hover:bg-navy-light transition-colors flex items-center gap-2 text-xs shadow-sm"
              >
                Selanjutnya <ChevronRight size={16} />
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
      </motion.div>
    </div>
  );
}
