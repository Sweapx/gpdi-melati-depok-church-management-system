import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Save, Download } from 'lucide-react';
import { Jemaat as JemaatType } from '../../types';
import * as XLSX from 'xlsx';
import clsx from 'clsx';

export default function JemaatKeluarMeninggal() {
  const [data, setData] = useState<JemaatType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterWadah, setFilterWadah] = useState('Semua Wadah');
  const [filterRayon, setFilterRayon] = useState('Semua Rayon');
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
    if (!window.confirm('Yakin ingin menghapus data ini secara permanen?')) return;
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
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const nama = (formData.get('nama') as string) || editingJemaat.nama;
    const statusJemaat = (formData.get('statusJemaat') as string) || editingJemaat.statusJemaat;
    const tempatLahir = (formData.get('tempatLahir') as string) || editingJemaat.tempatLahir;
    const tanggalLahir = (formData.get('tanggalLahir') as string) || editingJemaat.tanggalLahir;
    const gender = (formData.get('gender') as string) || editingJemaat.gender;
    const rayon = (formData.get('rayon') as string) || (editingJemaat as any).rayon;
    const noTelepon = (formData.get('noTelepon') as string) || (editingJemaat as any).noTelepon;
    const noHp = (formData.get('noHp') as string) || editingJemaat.noHp;
    const alamat = (formData.get('alamat') as string) || editingJemaat.alamat;

    const payload = {
      ...editingJemaat,
      nama,
      status_jemaat: statusJemaat,
      tempat_lahir: tempatLahir,
      tanggal_lahir: tanggalLahir,
      gender,
      rayon,
      no_telepon: noTelepon,
      no_hp: noHp,
      alamat,
      nik
    };

    try {
      const res = await fetch(`/api/jemaat/${editingJemaat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated: JemaatType = {
          ...editingJemaat,
          nama,
          statusJemaat: statusJemaat as any,
          tempatLahir,
          tanggalLahir,
          gender: gender as 'Pria' | 'Wanita',
          rayon,
          noTelepon,
          noHp,
          alamat
        };
        setData(data.map(j => j.id === editingJemaat.id ? updated : j));
        setEditingJemaat(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    alert('Export to XLS feature - implement with library like xlsx');
  };

  const filteredData = data.filter(j => 
    (j.statusJemaat === 'Keluar' || j.statusJemaat === 'Meninggal') &&
    (filterStatus === 'Semua' || j.statusJemaat === filterStatus) &&
    (filterWadah === 'Semua Wadah' || (j as any).wadah === filterWadah) &&
    (filterRayon === 'Semua Rayon' || (j as any).rayon === filterRayon) &&
    (j.nama && j.nama.toLowerCase().includes(search.toLowerCase()))
  );

  const wadahOptions = ['Semua Wadah', ...Array.from(new Set(data.map(j => (j as any).wadah).filter(Boolean)))];
  const rayonOptions = ['Semua Rayon', ...Array.from(new Set(data.map(j => (j as any).rayon).filter(Boolean)))];
  const statusOptions = ['Semua', 'Keluar', 'Meninggal'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Jemaat Keluar & Meninggal</h1>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden mb-6">
        {/* Filter Bar */}
        <div className="p-4 border-b border-border-subtle flex items-center gap-4 bg-sand-dark flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-white"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold text-sm bg-white"
          >
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select 
            value={filterWadah}
            onChange={e => setFilterWadah(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold text-sm bg-white"
          >
            {wadahOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select 
            value={filterRayon}
            onChange={e => setFilterRayon(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold text-sm bg-white"
          >
            {rayonOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button 
            onClick={handleExport}
            className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Export XLS
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">NAMA</th>
                <th className="px-6 py-4">TGL LAHIR</th>
                <th className="px-6 py-4">WADAH</th>
                <th className="px-6 py-4">RAYON</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">Tidak ada data jemaat keluar atau meninggal.</td>
                </tr>
              ) : (
                filteredData.map(jemaat => (
                  <tr key={jemaat.id} className="hover:bg-sand-darker/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{jemaat.nama}</td>
                    <td className="px-6 py-4">{jemaat.tanggalLahir}</td>
                    <td className="px-6 py-4">{(jemaat as any).wadah || '-'}</td>
                    <td className="px-6 py-4">{(jemaat as any).rayon || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        jemaat.statusJemaat === 'Keluar' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {jemaat.statusJemaat}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditingJemaat(jemaat)}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(jemaat.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Modal */}
      {editingJemaat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border-subtle shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
            <div className="p-6 border-b border-border-subtle bg-sand-dark flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">Edit Data Jemaat</h2>
              <button 
                onClick={() => setEditingJemaat(null)}
                className="text-text-muted hover:text-navy p-1 rounded-lg transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="keluar-meninggal-form" key={editingJemaat.id} onSubmit={handleEditSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    <option value="Keluar">Keluar</option>
                    <option value="Meninggal">Meninggal</option>
                    <option value="Aktif">Aktif</option>
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
                  <label className="text-sm font-bold text-navy">Rayon</label>
                  <input 
                    type="text" 
                    name="rayon"
                    defaultValue={(editingJemaat as any).rayon}
                    className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-navy">No. Telepon</label>
                  <input 
                    type="text" 
                    name="noTelepon"
                    defaultValue={(editingJemaat as any).noTelepon}
                    className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  />
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
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-navy">Alamat</label>
                  <textarea 
                    name="alamat"
                    defaultValue={editingJemaat.alamat}
                    rows={3}
                    className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none resize-none bg-sand-dark/50"
                    required
                  />
                </div>

              </form>
            </div>
            <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setEditingJemaat(null)}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="keluar-meninggal-form"
                className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
