import React, { useState, useEffect } from 'react';
import { Heart, Search, CheckCircle, Trash2, Plus, MessageSquare, X, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { PrayerRequest } from '../../types';
import clsx from 'clsx';

export default function Prayers() {
  const [data, setData] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'Semua' | 'Baru' | 'Didoakan' | 'Selesai'>('Semua');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    noHp: '',
    kategori: 'Umum' as PrayerRequest['kategori'],
    isiDoa: '',
    privasi: 'Publik' as PrayerRequest['privasi'],
    status: 'Baru' as PrayerRequest['status']
  });

  const fetchPrayers = () => {
    setIsLoading(true);
    fetch('/api/prayers')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading prayers:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: PrayerRequest['status']) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/prayers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      } else {
        alert(json.message || 'Gagal mengubah status permohonan doa');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi saat memperbarui status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus permohonan doa ini?')) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/prayers/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(prev => prev.filter(item => item.id !== id));
      } else {
        alert(json.message || 'Gagal menghapus permohonan doa');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi saat menghapus data');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.isiDoa) {
      alert('Nama dan isi doa wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(prev => [json.data, ...prev]);
        setIsAddModalOpen(false);
        setFormData({
          nama: '',
          noHp: '',
          kategori: 'Umum',
          isiDoa: '',
          privasi: 'Publik',
          status: 'Baru'
        });
      } else {
        alert(json.message || 'Gagal menambahkan permohonan doa');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi saat mengirim doa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayDate = (dateVal?: string) => {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch (e) {}
    return '-';
  };

  const formatWaUrl = (noHp?: string, nama?: string) => {
    if (!noHp || noHp === '-') return null;
    let clean = noHp.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    if (!clean) return null;
    const msg = encodeURIComponent(`Halo Bpk/Ibu ${nama || ''}, kami dari Tim Doa GPdI Melati Depok ingin mengabarkan bahwa permohonan doa Anda telah kami bawa dalam doa.`);
    return `https://wa.me/${clean}?text=${msg}`;
  };

  // Filter Data
  const filteredData = data.filter(item => {
    const matchesSearch = 
      (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.isiDoa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.kategori || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'Semua' || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const countBaru = data.filter(i => i.status === 'Baru').length;
  const countDidoakan = data.filter(i => i.status === 'Didoakan').length;
  const countSelesai = data.filter(i => i.status === 'Selesai').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Permohonan Doa</h1>
          <p className="text-sm text-text-muted mt-1">Kelola dan update status permohonan doa jemaat</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-navy hover:bg-navy-light text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Permohonan Doa
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-border-subtle shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Semua', 'Baru', 'Didoakan', 'Selesai'] as const).map(status => {
            const count = status === 'Semua' ? data.length : status === 'Baru' ? countBaru : status === 'Didoakan' ? countDidoakan : countSelesai;
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  isActive 
                    ? "bg-navy text-white shadow-sm" 
                    : "bg-sand-dark text-text-muted hover:text-navy hover:bg-sand-darker"
                )}
              >
                {status}
                <span className={clsx(
                  "px-1.5 py-0.5 rounded-full text-[10px]",
                  isActive ? "bg-white/20 text-white" : "bg-black/10 text-navy"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Cari nama atau isi doa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-sand-dark/50 border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-gold transition-colors text-navy placeholder:text-text-muted"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-text-muted flex flex-col items-center gap-2">
            <RefreshCw size={24} className="animate-spin text-gold" />
            Memuat data permohonan doa...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-border-subtle text-text-muted">
            {searchTerm || selectedStatus !== 'Semua' 
              ? 'Tidak ada permohonan doa yang sesuai dengan filter.' 
              : 'Belum ada permohonan doa terdaftar.'}
          </div>
        ) : (
          filteredData.map(item => {
            const isUpdating = actionLoadingId === item.id;
            const waUrl = formatWaUrl(item.noHp, item.nama);

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-border-subtle shadow-sm p-6 flex flex-col h-full hover:shadow-md hover:border-gold transition-all group relative overflow-hidden"
              >
                {/* Header Card */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div>
                    <h3 className="font-bold text-navy flex items-center gap-2">
                      {item.nama || 'Anonim'}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatDisplayDate(item.tanggal || (item as any).createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.privasi === 'Rahasia Tim Doa' ? "bg-sand-dark text-text-muted" : "bg-gold/20 text-navy"
                    )}>
                      {item.privasi === 'Rahasia Tim Doa' ? 'Anonim' : 'Publik'}
                    </span>
                    {item.kategori && (
                      <span className="text-[10px] text-text-muted bg-sand-dark px-2 py-0.5 rounded-md font-medium">
                        {item.kategori}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-navy/90 mb-6 flex-grow leading-relaxed italic bg-sand-dark/30 p-3.5 rounded-xl border border-border-subtle/50">
                  "{item.isiDoa}"
                </p>

                {/* Footer Info & WA button */}
                <div className="flex items-center justify-between mb-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-text-muted" />
                    <span>Status:</span>
                    <span className={clsx(
                      "font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider",
                      item.status === 'Selesai' ? "bg-emerald-100 text-emerald-800" :
                      item.status === 'Didoakan' ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                    )}>
                      {item.status || 'Baru'}
                    </span>
                  </div>

                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 hover:underline text-xs"
                      title="Hubungi via WhatsApp"
                    >
                      <MessageSquare size={13} />
                      WhatsApp
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle gap-2">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.status !== 'Didoakan' && item.status !== 'Selesai' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Didoakan')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold tracking-wide transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
                      >
                        {isUpdating ? <RefreshCw size={13} className="animate-spin" /> : <Heart size={13} className="fill-white" />}
                        Doakan
                      </button>
                    )}

                    {item.status === 'Didoakan' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Selesai')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold tracking-wide transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
                      >
                        {isUpdating ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        Selesai
                      </button>
                    )}

                    {item.status === 'Selesai' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Didoakan')}
                        disabled={isUpdating}
                        className="px-2.5 py-1.5 bg-sand-dark hover:bg-sand-darker text-navy rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isUpdating ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                        Doakan Lagi
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isUpdating}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Hapus Permohonan Doa"
                  >
                    {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Tambah Permohonan Doa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-border-subtle relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-navy p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-navy mb-4">Tambah Permohonan Doa</h2>

            <form onSubmit={handleCreatePrayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Nama Pemohon *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama pemohon"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3.5 py-2 bg-sand-dark/40 border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-gold text-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={formData.noHp}
                  onChange={e => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full px-3.5 py-2 bg-sand-dark/40 border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-gold text-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sand-dark/40 border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-gold text-navy"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Pemulihan">Pemulihan</option>
                    <option value="Pekerjaan">Pekerjaan</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Privasi</label>
                  <select
                    value={formData.privasi}
                    onChange={e => setFormData({ ...formData, privasi: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sand-dark/40 border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-gold text-navy"
                  >
                    <option value="Publik">Publik</option>
                    <option value="Rahasia Tim Doa">Anonim / Tim Doa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Isi Permohonan Doa *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan pokok doa secara jelas..."
                  value={formData.isiDoa}
                  onChange={e => setFormData({ ...formData, isiDoa: e.target.value })}
                  className="w-full px-3.5 py-2 bg-sand-dark/40 border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-gold text-navy resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-sand-dark hover:bg-sand-darker text-navy rounded-xl text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-navy hover:bg-navy-light text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  Simpan Doa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
