import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, X, Save, Download, ArrowLeft } from 'lucide-react';

interface Rayon {
  id: string;
  namaRayon: string;
  ketuaRayon: string;
  jumlahAnggota: number;
}

interface AnggotaRayon {
  id: string;
  nama: string;
  tanggalLahir: string;
  noWhatsApp: string;
}

export default function Rayon() {
  const [data, setData] = useState<Rayon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'nama-asc' | 'nama-desc'>('nama-asc');
  const [editingRayon, setEditingRayon] = useState<Rayon | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingRayon, setViewingRayon] = useState<Rayon | null>(null);
  const [anggotaRayon, setAnggotaRayon] = useState<AnggotaRayon[]>([]);
  const [isLoadingAnggota, setIsLoadingAnggota] = useState(false);

  const fetchAllData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/rayon').then(res => res.json()),
      fetch('/api/jemaat').then(res => res.json())
    ]).then(([rayonRes, jemaatRes]) => {
      let jList: any[] = [];
      if (jemaatRes.success) {
        jList = jemaatRes.data || [];
      }
      if (rayonRes.success) {
        const convertedData = rayonRes.data.map((row: any) => {
          const rName = (row.nama_rayon || row.namaRayon || '').trim().toLowerCase();
          let count = 0;
          if (jList.length > 0) {
            count = jList.filter((j: any) => {
              const isAktif = !j.statusJemaat || j.statusJemaat === 'Aktif' || j.status_jemaat === 'Aktif';
              if (!isAktif) return false;
              const jr = (j.rayon || '').trim().toLowerCase();
              return jr === rName || (row.id === 'RAY-001' && (jr.includes('rayon 1') || jr === '1'))
                || (row.id === 'RAY-002' && (jr.includes('rayon 2') || jr === '2'))
                || (row.id === 'RAY-003' && (jr.includes('rayon 3') || jr === '3'))
                || (row.id === 'RAY-004' && (jr.includes('rayon 4') || jr === '4'));
            }).length;
          } else {
            count = row.jumlah_anggota || row.jumlahAnggota || 0;
          }

          return {
            id: row.id,
            namaRayon: row.nama_rayon || row.namaRayon,
            ketuaRayon: row.ketua_rayon || row.ketuaRayon,
            jumlahAnggota: count,
          };
        });
        setData(convertedData);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleViewAnggota = async (rayon: Rayon) => {
    setViewingRayon(rayon);
    setIsLoadingAnggota(true);
    try {
      const res = await fetch('/api/jemaat');
      const json = await res.json();
      if (json.success) {
        const rName = (rayon.namaRayon || '').trim().toLowerCase();
        const filtered = json.data
          .filter((j: any) => {
            const isAktif = !j.statusJemaat || j.statusJemaat === 'Aktif' || j.status_jemaat === 'Aktif';
            if (!isAktif) return false;
            const jr = (j.rayon || '').trim().toLowerCase();
            return jr === rName || (rayon.id === 'RAY-001' && (jr.includes('rayon 1') || jr === '1'))
              || (rayon.id === 'RAY-002' && (jr.includes('rayon 2') || jr === '2'))
              || (rayon.id === 'RAY-003' && (jr.includes('rayon 3') || jr === '3'))
              || (rayon.id === 'RAY-004' && (jr.includes('rayon 4') || jr === '4'));
          })
          .map((j: any) => ({
            id: j.id,
            nama: j.nama,
            tanggalLahir: (j.tanggal_lahir || j.tanggalLahir || '').split('T')[0] || '-',
            noWhatsApp: j.no_hp || j.noHp || '-'
          }));
        setAnggotaRayon(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnggota(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus rayon ini?')) return;
    try {
      const res = await fetch(`/api/rayon/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRayon) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const updatedRayon = {
      nama_rayon: (formData.get('namaRayon') as string) || editingRayon.namaRayon,
      ketua_rayon: (formData.get('ketuaRayon') as string) || editingRayon.ketuaRayon,
      jumlah_anggota: editingRayon.jumlahAnggota,
    };

    try {
      const res = await fetch(`/api/rayon/${editingRayon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(updatedRayon)
      });
      if (res.ok) {
        setEditingRayon(null);
        fetchAllData();
      } else {
        const error = await res.json();
        alert('Gagal mengupdate rayon: ' + (error.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate rayon: Network error');
    }
  };

  const handleAddSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newRayon = {
      nama_rayon: formData.get('namaRayon') as string,
      namaRayon: formData.get('namaRayon') as string,
      ketua_rayon: formData.get('ketuaRayon') as string,
      ketuaRayon: formData.get('ketuaRayon') as string,
      jumlah_anggota: 0,
      jumlahAnggota: 0,
    };

    try {
      const res = await fetch('/api/rayon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newRayon)
      });
      if (res.ok) {
        setIsAdding(false);
        fetchAllData();
      } else {
        const error = await res.json();
        alert('Gagal menambah rayon: ' + (error.message || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menambah rayon: Network error');
    }
  };

  const handleExport = () => {
    alert('Export to XLS feature - implement with library like xlsx');
  };

  const handleExportDetail = () => {
    alert('Export Detail XLS feature - implement with library like xlsx');
  };

  const filteredData = data.filter(r => 
    r.namaRayon.toLowerCase().includes(search.toLowerCase()) ||
    r.ketuaRayon.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'nama-asc') return a.namaRayon.localeCompare(b.namaRayon);
    return b.namaRayon.localeCompare(a.namaRayon);
  });

  return (
    <div>
      {viewingRayon ? (
        // Detail Anggota Rayon View
        <div>
          <button 
            onClick={() => setViewingRayon(null)}
            className="flex items-center gap-2 text-navy hover:text-gold transition-colors mb-6 font-bold"
          >
            <ArrowLeft size={20} /> Kembali ke Daftar Rayon
          </button>
          
          <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-subtle bg-sand-dark flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-navy">Detail Anggota Rayon</h2>
                <p className="text-sm text-text-muted">{viewingRayon.namaRayon} • Ketua: {viewingRayon.ketuaRayon}</p>
              </div>
              <button 
                onClick={handleExportDetail}
                className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Export Detail XLS
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy">
                <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-4">NAMA ANGGOTA</th>
                    <th className="px-6 py-4">TANGGAL LAHIR</th>
                    <th className="px-6 py-4">NO WHATSAPP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {isLoadingAnggota ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-text-muted">Memuat data...</td>
                    </tr>
                  ) : anggotaRayon.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-text-muted">Tidak ada anggota rayon.</td>
                    </tr>
                  ) : (
                    anggotaRayon.map(anggota => (
                      <tr key={anggota.id} className="hover:bg-sand-darker/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{anggota.nama}</td>
                        <td className="px-6 py-4">{anggota.tanggalLahir}</td>
                        <td className="px-6 py-4">{anggota.noWhatsApp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // Main Rayon List View
        <>
          <h1 className="text-2xl font-bold text-navy mb-6">Manajemen Rayon</h1>

          {/* Table Card */}
          <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden mb-6">
            {/* Filter Bar */}
            <div className="p-4 border-b border-border-subtle flex items-center gap-4 bg-sand-dark flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari rayon..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-white"
                />
              </div>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold text-sm bg-white"
              >
                <option value="nama-asc">Urutkan Nama (A-Z)</option>
                <option value="nama-desc">Urutkan Nama (Z-A)</option>
              </select>
              <button 
                onClick={handleExport}
                className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Export XLS
              </button>
              <button 
                onClick={() => { setEditingRayon(null); setIsAdding(true); }}
                className="bg-navy text-gold px-4 py-2 rounded-xl font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Tambah Rayon
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy">
                <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-4">NAMA RAYON</th>
                    <th className="px-6 py-4">KETUA RAYON</th>
                    <th className="px-6 py-4">JUMLAH ANGGOTA</th>
                    <th className="px-6 py-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-text-muted">Memuat data...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-text-muted">Tidak ada data rayon.</td>
                    </tr>
                  ) : (
                    filteredData.map(rayon => (
                      <tr key={rayon.id} className="hover:bg-sand-darker/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{rayon.namaRayon}</td>
                        <td className="px-6 py-4">{rayon.ketuaRayon}</td>
                        <td className="px-6 py-4 font-bold">{rayon.jumlahAnggota} orang</td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" onClick={() => handleViewAnggota(rayon)} title="Lihat Anggota"><Eye size={16} /></button>
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => { setIsAdding(false); setEditingRayon(rayon); }} title="Edit Rayon"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(rayon.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add/Edit Modal */}
          {(isAdding || editingRayon) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white rounded-2xl border border-border-subtle shadow-xl w-full max-w-lg overflow-hidden my-auto">
                <div className="p-6 border-b border-border-subtle bg-sand-dark flex justify-between items-center">
                  <h2 className="text-xl font-bold text-navy">
                    {isAdding ? 'Tambah Rayon Baru' : 'Edit Data Rayon'}
                  </h2>
                  <button onClick={() => { setIsAdding(false); setEditingRayon(null); }} className="text-text-muted hover:text-navy p-1 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <form id="rayon-form" key={editingRayon?.id || (isAdding ? 'add' : 'none')} onSubmit={isAdding ? handleAddSave : handleEditSave} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-navy">Nama Rayon</label>
                      <input
                        type="text"
                        name="namaRayon"
                        defaultValue={editingRayon?.namaRayon || ''}
                        className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-navy">Ketua Rayon</label>
                      <input
                        type="text"
                        name="ketuaRayon"
                        defaultValue={editingRayon?.ketuaRayon || ''}
                        className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                        required
                      />
                    </div>
                  </form>
                </div>
                <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingRayon(null); }}
                    className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="rayon-form"
                    className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} /> {isAdding ? 'Simpan Data Rayon' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
