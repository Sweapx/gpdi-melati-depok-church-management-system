import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, X, Save, Download, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';

interface Wadah {
  id: string;
  namaWadah: string;
  ketuaWadah: string;
  umurMinimal: number;
  umurMaksimal: number;
  jumlahAnggota: number;
}

export default function Wadah() {
  const [data, setData] = useState<Wadah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'nama-asc' | 'nama-desc'>('nama-asc');
  const [editingWadah, setEditingWadah] = useState<Wadah | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingWadah, setViewingWadah] = useState<Wadah | null>(null);

  useEffect(() => {
    fetch('/api/wadah')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const convertedData = res.data.map((row: any) => ({
            id: row.id,
            namaWadah: row.nama_wadah,
            ketuaWadah: row.ketua_wadah,
            umurMinimal: row.umur_minimal,
            umurMaksimal: row.umur_maksimal,
            jumlahAnggota: row.jumlah_anggota,
          }));
          setData(convertedData);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus wadah ini?')) return;
    try {
      // API call here
      setData(data.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWadah) return;
    try {
      // API call here
      setData(data.map(w => w.id === editingWadah.id ? editingWadah : w));
      setEditingWadah(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newWadah = {
      nama_wadah: formData.get('namaWadah') as string,
      ketua_wadah: formData.get('ketuaWadah') as string,
      umur_minimal: parseInt(formData.get('umurMinimal') as string),
      umur_maksimal: parseInt(formData.get('umurMaksimal') as string),
      jumlah_anggota: 0,
    };

    try {
      const res = await fetch('/api/wadah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newWadah)
      });
      if (res.ok) {
        const json = await res.json();
        const convertedData = {
          id: json.data.id,
          namaWadah: json.data.nama_wadah,
          ketuaWadah: json.data.ketua_wadah,
          umurMinimal: json.data.umur_minimal,
          umurMaksimal: json.data.umur_maksimal,
          jumlahAnggota: json.data.jumlah_anggota,
        };
        setData([...data, convertedData]);
        setIsAdding(false);
      } else {
        const error = await res.json();
        alert('Gagal menambah wadah: ' + (error.message || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menambah wadah: Network error');
    }
  };

  const handleExport = () => {
    alert('Export to XLS feature - implement with library like xlsx');
  };

  const filteredData = data.filter(w => 
    w.namaWadah.toLowerCase().includes(search.toLowerCase()) ||
    w.ketuaWadah.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'nama-asc') return a.namaWadah.localeCompare(b.namaWadah);
    return b.namaWadah.localeCompare(a.namaWadah);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Manajemen Wadah</h1>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden mb-6">
        {/* Filter Bar */}
        <div className="p-4 border-b border-border-subtle flex items-center gap-4 bg-sand-dark flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Cari wadah..." 
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
            onClick={() => setIsAdding(true)}
            className="bg-navy text-gold px-4 py-2 rounded-xl font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Tambah Wadah
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">NAMA WADAH</th>
                <th className="px-6 py-4">KETUA WADAH</th>
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
                  <td colSpan={4} className="text-center py-12 text-text-muted">Tidak ada data wadah.</td>
                </tr>
              ) : (
                filteredData.map(wadah => (
                  <tr key={wadah.id} className="hover:bg-sand-darker/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{wadah.namaWadah}</td>
                    <td className="px-6 py-4">{wadah.ketuaWadah}</td>
                    <td className="px-6 py-4">{wadah.jumlahAnggota}</td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" onClick={() => setViewingWadah(wadah)}><Eye size={16} /></button>
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditingWadah(wadah)}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(wadah.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Card */}
      {(isAdding || editingWadah) && (
        <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border-subtle bg-sand-dark">
            <h2 className="text-xl font-bold text-navy">
              {isAdding ? 'Tambah Wadah Baru' : 'Edit Data Wadah'}
            </h2>
          </div>
          <div className="p-6">
            <form id="wadah-form" onSubmit={isAdding ? handleAddSave : handleEditSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Nama Wadah</label>
                <input
                  type="text"
                  name="namaWadah"
                  defaultValue={editingWadah?.namaWadah}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Ketua Wadah</label>
                <input
                  type="text"
                  name="ketuaWadah"
                  defaultValue={editingWadah?.ketuaWadah}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Umur Minimal</label>
                  <input
                    type="number"
                    name="umurMinimal"
                    defaultValue={editingWadah?.umurMinimal}
                    className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">Umur Maksimal</label>
                  <input
                    type="number"
                    name="umurMaksimal"
                    defaultValue={editingWadah?.umurMaksimal}
                    className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                    required
                  />
                </div>
              </div>
            </form>
          </div>
          <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
            <button
              onClick={() => { setIsAdding(false); setEditingWadah(null); }}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              form="wadah-form"
              className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} /> {isAdding ? 'Simpan Data Wadah' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingWadah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border-subtle">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
              <h2 className="text-xl font-bold text-navy">Detail Wadah</h2>
              <button onClick={() => setViewingWadah(null)} className="p-2 hover:bg-sand-darker rounded-full transition-colors text-text-muted hover:text-navy">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Nama Wadah</p>
                <p className="font-medium text-navy">{viewingWadah.namaWadah}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Ketua Wadah</p>
                <p className="font-medium text-navy">{viewingWadah.ketuaWadah}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Umur Minimal</p>
                  <p className="font-medium text-navy">{viewingWadah.umurMinimal} tahun</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Umur Maksimal</p>
                  <p className="font-medium text-navy">{viewingWadah.umurMaksimal} tahun</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Jumlah Anggota</p>
                <p className="font-medium text-navy">{viewingWadah.jumlahAnggota} orang</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
