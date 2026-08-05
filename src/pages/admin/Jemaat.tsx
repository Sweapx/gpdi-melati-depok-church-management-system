import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Download } from 'lucide-react';
import { Jemaat as JemaatType } from '../../types';
import clsx from 'clsx';

export default function Jemaat() {
  const [data, setData] = useState<JemaatType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingJemaat, setEditingJemaat] = useState<JemaatType | null>(null);
  const [wadahList, setWadahList] = useState<any[]>([]);
  const [rayonList, setRayonList] = useState<any[]>([]);
  const [filterWadah, setFilterWadah] = useState('Semua Wadah');
  const [filterRayon, setFilterRayon] = useState('Semua Rayon');

  useEffect(() => {
    fetch('/api/jemaat')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/wadah')
      .then(res => res.json())
      .then(res => {
        if (res.success) setWadahList(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/rayon')
      .then(res => res.json())
      .then(res => {
        if (res.success) setRayonList(res.data);
      })
      .catch(() => {});
  }, []);

  const calculateAge = (tanggalLahir: string): number => {
    const birthDate = new Date(tanggalLahir);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const assignWadahByAge = (tanggalLahir: string): string => {
    const age = calculateAge(tanggalLahir);
    const matchingWadah = wadahList.find(w => age >= w.umur_minimal && age <= w.umur_maksimal);
    return matchingWadah ? matchingWadah.nama_wadah : '';
  };

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
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const tanggalLahir = (formData.get('tanggalLahir') as string) || editingJemaat.tanggalLahir;
    const assignedWadah = assignWadahByAge(tanggalLahir);

    try {
      const backendData = {
        nama: (formData.get('nama') as string) || editingJemaat.nama,
        gender: (formData.get('gender') as string) || editingJemaat.gender,
        tempat_lahir: (formData.get('tempatLahir') as string) || editingJemaat.tempatLahir,
        tanggal_lahir: tanggalLahir,
        alamat: (formData.get('alamat') as string) || editingJemaat.alamat,
        no_hp: (formData.get('noHp') as string) || editingJemaat.noHp,
        status_pernikahan: editingJemaat.statusPernikahan,
        status_jemaat: (formData.get('statusJemaat') as string) || editingJemaat.statusJemaat,
        kategori_kaum: editingJemaat.kategoriKaum,
        sektor: editingJemaat.sektor,
        wadah: assignedWadah,
        rayon: (formData.get('rayon') as string) || editingJemaat.rayon,
        no_telepon: (formData.get('noTelepon') as string) || editingJemaat.noTelepon,
        anggota_keluarga: editingJemaat.anggotaKeluarga
      };

      const res = await fetch(`/api/jemaat/${editingJemaat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(backendData)
      });
      if (res.ok) {
        const json = await res.json();
        const updated = {
          ...json.data,
          tempatLahir: json.data.tempat_lahir,
          tanggalLahir: json.data.tanggal_lahir,
          noHp: json.data.no_hp,
          statusJemaat: json.data.status_jemaat,
          noTelepon: json.data.no_telepon
        };
        setData(data.map(j => j.id === editingJemaat.id ? updated : j));
        setEditingJemaat(null);
      } else {
        const error = await res.json();
        console.error('Error updating jemaat:', error);
        alert('Gagal mengupdate jemaat: ' + (error.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate jemaat: Network error');
    }
  };

  const handleAddSave = async (e: React.FormEvent) => {
    console.log('=== handleAddSave called ===');
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const tanggalLahir = formData.get('tanggalLahir') as string;
    const assignedWadah = assignWadahByAge(tanggalLahir);

    const newJemaat = {
      nama: formData.get('nama') as string,
      status_jemaat: formData.get('statusJemaat') as string,
      tempat_lahir: formData.get('tempatLahir') as string,
      tanggal_lahir: tanggalLahir,
      gender: formData.get('gender') as string,
      rayon: formData.get('rayon') as string,
      wadah: assignedWadah,
      no_telepon: formData.get('noTelepon') as string,
      no_hp: formData.get('noHp') as string,
      alamat: formData.get('alamat') as string,
    };

    console.log('Form data:', newJemaat);
    console.log('Token:', localStorage.getItem('token'));

    try {
      console.log('Sending POST request to /api/jemaat');
      const res = await fetch('/api/jemaat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newJemaat)
      });
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      if (res.ok) {
        const json = await res.json();
        console.log('Response data:', json);
        setData([...data, json.data]);
        setIsAdding(false);
      } else {
        const error = await res.json();
        console.error('Error adding jemaat:', error);
        alert('Gagal menambah jemaat: ' + (error.message || 'Unknown error'));
      }
    } catch (e) {
      console.error('Network error:', e);
      alert('Gagal menambah jemaat: Network error');
    }
  };

  const handleExport = () => {
    // Export functionality - would need XLS library
    alert('Export to XLS feature - implement with library like xlsx');
  };

  const filteredData = data.filter(j =>
    (!j.statusJemaat || j.statusJemaat === 'Aktif') &&
    (filterWadah === 'Semua Wadah' || !j.wadah || j.wadah === filterWadah) &&
    (filterRayon === 'Semua Rayon' || !j.rayon || j.rayon === filterRayon) &&
    (j.nama && j.nama.toLowerCase().includes(search.toLowerCase()))
  );

  const wadahOptions = ['Semua Wadah', ...Array.from(new Set(data.map(j => j.wadah).filter(Boolean)))];
  const rayonOptions = ['Semua Rayon', ...Array.from(new Set(data.map(j => j.rayon).filter(Boolean)))];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Manajemen Data Jemaat</h1>

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
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-navy text-gold px-4 py-2 rounded-xl font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Tambah Jemaat
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">NAMA</th>
                <th className="px-6 py-4">TEMPAT LAHIR</th>
                <th className="px-6 py-4">TGL LAHIR</th>
                <th className="px-6 py-4">WADAH</th>
                <th className="px-6 py-4">RAYON</th>
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
                  <td colSpan={6} className="text-center py-12 text-text-muted">Tidak ada data jemaat.</td>
                </tr>
              ) : (
                filteredData.map(jemaat => (
                  <tr key={jemaat.id} className="hover:bg-sand-darker/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{jemaat.nama}</td>
                    <td className="px-6 py-4">{jemaat.tempatLahir || '-'}</td>
                    <td className="px-6 py-4">{jemaat.tanggalLahir || '-'}</td>
                    <td className="px-6 py-4">{jemaat.wadah || (jemaat.tanggalLahir ? assignWadahByAge(jemaat.tanggalLahir) : '') || '-'}</td>
                    <td className="px-6 py-4">{jemaat.rayon || '-'}</td>
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

      {/* Add/Edit Form Card */}
      {(isAdding || editingJemaat) && (
        <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border-subtle bg-sand-dark">
            <h2 className="text-xl font-bold text-navy">
              {isAdding ? 'Tambah Jemaat Baru' : 'Edit Data Jemaat'}
            </h2>
          </div>
          <div className="p-6">
            <form id="jemaat-form" onSubmit={isAdding ? handleAddSave : handleEditSave} className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="nama"
                  defaultValue={editingJemaat?.nama}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Status</label>
                <select 
                  name="statusJemaat"
                  defaultValue={editingJemaat?.statusJemaat || 'Aktif'}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Keluar">Keluar</option>
                  <option value="Meninggal">Meninggal</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Tempat Lahir</label>
                <input 
                  type="text" 
                  name="tempatLahir"
                  defaultValue={editingJemaat?.tempatLahir}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Tanggal Lahir</label>
                <input 
                  type="date" 
                  name="tanggalLahir"
                  defaultValue={editingJemaat?.tanggalLahir}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Jenis Kelamin</label>
                <select 
                  name="gender"
                  defaultValue={editingJemaat?.gender}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                >
                  <option value="">Pilih...</option>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">Rayon</label>
                <select
                  name="rayon"
                  defaultValue={editingJemaat?.rayon || ''}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                >
                  <option value="">Pilih Rayon...</option>
                  {rayonList.map(rayon => (
                    <option key={rayon.id} value={rayon.nama_rayon}>
                      {rayon.nama_rayon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">No. Telepon</label>
                <input 
                  type="text" 
                  name="noTelepon"
                  defaultValue={editingJemaat?.noTelepon}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy">No. WhatsApp</label>
                <input 
                  type="text" 
                  name="noHp"
                  defaultValue={editingJemaat?.noHp}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none bg-sand-dark/50"
                  required
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-bold text-navy">Alamat</label>
                <textarea
                  name="alamat"
                  defaultValue={editingJemaat?.alamat}
                  rows={3}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-gold outline-none resize-none bg-sand-dark/50"
                  required
                />
              </div>
            </form>
          </div>
          <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
            <button 
              onClick={() => { setIsAdding(false); setEditingJemaat(null); }}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              form="jemaat-form"
              className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} /> {isAdding ? 'Simpan Data Jemaat' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
