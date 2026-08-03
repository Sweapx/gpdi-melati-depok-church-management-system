import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Save, Download, Calendar } from 'lucide-react';
import { Jemaat as JemaatType } from '../../types';
import clsx from 'clsx';

export default function UlangTahun() {
  const [data, setData] = useState<JemaatType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [editingJemaat, setEditingJemaat] = useState<JemaatType | null>(null);

  useEffect(() => {
    fetch('/api/jemaat')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    try {
      const res = await fetch(`/api/jemaat/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setData(data.filter(j => j.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJemaat) return;
    try {
      const res = await fetch(`/api/jemaat/${editingJemaat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(editingJemaat)
      });
      if (res.ok) {
        setData(data.map(j => j.id === editingJemaat.id ? editingJemaat : j));
        setEditingJemaat(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    alert('Export Excel feature - implement with library like xlsx');
  };

  const filteredData = data.filter(j => {
    const birthDate = j.tanggalLahir ? new Date(j.tanggalLahir) : null;
    const birthMonth = birthDate ? birthDate.getMonth() + 1 : null;
    
    const matchesSearch = j.nama.toLowerCase().includes(search.toLowerCase()) || j.nik.includes(search);
    const matchesMonth = filterMonth === '' || birthMonth === parseInt(filterMonth);
    
    return matchesSearch && matchesMonth;
  });

  const months = [
    { value: '', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Ulang Tahun Jemaat</h1>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden mb-6">
        {/* Filter Bar */}
        <div className="p-4 border-b border-border-subtle flex items-center gap-4 bg-sand-dark flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NIK..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-text-muted" />
            <select 
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold text-sm bg-white"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <button 
            onClick={handleExport}
            className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">NAMA JEMAAT</th>
                <th className="px-6 py-4">TANGGAL ULANG TAHUN</th>
                <th className="px-6 py-4">USIA (TAHUN INI)</th>
                <th className="px-6 py-4">WADAH</th>
                <th className="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-muted">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-muted">Tidak ada data jemaat.</td>
                </tr>
              ) : (
                filteredData.map(jemaat => {
                  const birthDate = jemaat.tanggalLahir ? new Date(jemaat.tanggalLahir) : null;
                  const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : '-';
                  const birthday = birthDate ? birthDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : '-';
                  
                  return (
                    <tr key={jemaat.id} className="hover:bg-sand-darker/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{jemaat.nama}</td>
                      <td className="px-6 py-4">{birthday}</td>
                      <td className="px-6 py-4">{age}</td>
                      <td className="px-6 py-4">{jemaat.wadah || '-'}</td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditingJemaat(jemaat)}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(jemaat.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Card */}
      {editingJemaat && (
        <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border-subtle bg-sand-dark">
            <h2 className="text-xl font-bold text-navy">Edit Data Jemaat</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleEditSave} className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="nama"
                  defaultValue={editingJemaat.nama}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Status</label>
                <select 
                  name="statusJemaat"
                  defaultValue={editingJemaat.statusJemaat}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Inaktif">Inaktif</option>
                  <option value="Keluar">Keluar</option>
                  <option value="Meninggal">Meninggal</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Tempat Lahir</label>
                <input 
                  type="text" 
                  name="tempatLahir"
                  defaultValue={editingJemaat.tempatLahir}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Tanggal Lahir</label>
                <input 
                  type="date" 
                  name="tanggalLahir"
                  defaultValue={editingJemaat.tanggalLahir}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Jenis Kelamin</label>
                <select 
                  name="gender"
                  defaultValue={editingJemaat.gender}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                >
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">No. WhatsApp</label>
                <input 
                  type="text" 
                  name="noHp"
                  defaultValue={editingJemaat.noHp}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-bold text-navy">Alamat</label>
                <textarea 
                  name="alamat"
                  defaultValue={editingJemaat.alamat}
                  rows={3}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none resize-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">NIK</label>
                <input 
                  type="text" 
                  name="nik"
                  defaultValue={editingJemaat.nik}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
            </form>
          </div>
          <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
            <button 
              onClick={() => setEditingJemaat(null)}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleEditSave}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} /> Simpan Perubahan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
