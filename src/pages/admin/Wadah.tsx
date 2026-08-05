import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, X, Save, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
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
  const [jemaatList, setJemaatList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'nama-asc' | 'nama-desc'>('nama-asc');
  const [editingWadah, setEditingWadah] = useState<Wadah | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingWadah, setViewingWadah] = useState<Wadah | null>(null);

  const calculateAge = (tanggalLahir: string): number => {
    if (!tanggalLahir) return 0;
    const cleanStr = tanggalLahir.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return 0;
    const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isMemberOfWadah = (j: any, wadahId: string, wadahName: string): boolean => {
    const isAktif = !j.statusJemaat || j.statusJemaat === 'Aktif' || j.status_jemaat === 'Aktif';
    if (!isAktif) return false;

    const jw = (j.wadah || '').trim().toLowerCase();
    const jGender = (j.gender || '').trim().toLowerCase();
    const wName = (wadahName || '').trim().toLowerCase();

    const tgl = j.tanggalLahir || j.tanggal_lahir;
    const age = tgl ? calculateAge(tgl) : null;

    if (jw !== '') {
      if (jw === wName || jw.includes(wName) || wName.includes(jw)) {
        if (wName.includes('pria') && jGender === 'wanita') return false;
        if (wName.includes('wanita') && jGender === 'pria') return false;
        return true;
      }
    } else {
      if (wadahId === 'WAD-002' || wName.includes('pria')) {
        return jGender === 'pria' && (age === null || age >= 31);
      }
      if (wadahId === 'WAD-004' || wName.includes('wanita')) {
        return jGender === 'wanita' && (age === null || age >= 31);
      }
      if (wadahId === 'WAD-001' || wName.includes('muda')) {
        return age !== null && age >= 20 && age <= 30;
      }
      if (wadahId === 'WAD-003' || wName.includes('remaja')) {
        return age !== null && age >= 13 && age <= 19;
      }
      if (wadahId === 'WAD-005' || wName.includes('sekolah minggu')) {
        return age !== null && age <= 12;
      }
    }

    return false;
  };

  const fetchAllData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/wadah').then(res => res.json()),
      fetch('/api/jemaat').then(res => res.json())
    ]).then(([wadahRes, jemaatRes]) => {
      let jList: any[] = [];
      if (jemaatRes.success) {
        jList = jemaatRes.data || [];
        setJemaatList(jList);
      }
      if (wadahRes.success) {
        const convertedData = wadahRes.data.map((row: any) => {
          const wName = row.nama_wadah || row.namaWadah || '';
          const minAge = Number(row.umur_minimal !== undefined ? row.umur_minimal : row.umurMinimal) || 0;
          const maxAge = Number(row.umur_maksimal !== undefined ? row.umur_maksimal : row.umurMaksimal) || 150;

          // Count matching active members
          let count = 0;
          if (jList.length > 0) {
            count = jList.filter((j: any) => isMemberOfWadah(j, row.id, wName)).length;
          } else {
            count = row.jumlah_anggota || row.jumlahAnggota || 0;
          }

          return {
            id: row.id,
            namaWadah: wName,
            ketuaWadah: row.ketua_wadah || row.ketuaWadah,
            umurMinimal: minAge,
            umurMaksimal: maxAge,
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

  const getWadahMembers = (wadah: Wadah) => {
    return jemaatList.filter((j: any) => isMemberOfWadah(j, wadah.id, wadah.namaWadah));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus wadah ini?')) return;
    try {
      const res = await fetch(`/api/wadah/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setData(data.filter(w => w.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWadah) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const updatedWadah = {
      nama_wadah: (formData.get('namaWadah') as string) || editingWadah.namaWadah,
      ketua_wadah: (formData.get('ketuaWadah') as string) || editingWadah.ketuaWadah,
      umur_minimal: parseInt(formData.get('umurMinimal') as string) || editingWadah.umurMinimal,
      umur_maksimal: parseInt(formData.get('umurMaksimal') as string) || editingWadah.umurMaksimal,
      jumlah_anggota: editingWadah.jumlahAnggota,
    };

    try {
      const res = await fetch(`/api/wadah/${editingWadah.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(updatedWadah)
      });
      if (res.ok) {
        setEditingWadah(null);
        fetchAllData();
      } else {
        const error = await res.json();
        alert('Gagal mengupdate wadah: ' + (error.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate wadah: Network error');
    }
  };

  const handleAddSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newWadah = {
      nama_wadah: formData.get('namaWadah') as string,
      namaWadah: formData.get('namaWadah') as string,
      ketua_wadah: formData.get('ketuaWadah') as string,
      ketuaWadah: formData.get('ketuaWadah') as string,
      umur_minimal: parseInt(formData.get('umurMinimal') as string) || 0,
      umurMinimal: parseInt(formData.get('umurMinimal') as string) || 0,
      umur_maksimal: parseInt(formData.get('umurMaksimal') as string) || 150,
      umurMaksimal: parseInt(formData.get('umurMaksimal') as string) || 150,
      jumlah_anggota: 0,
      jumlahAnggota: 0,
    };

    try {
      const res = await fetch('/api/wadah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newWadah)
      });
      if (res.ok) {
        setIsAdding(false);
        fetchAllData();
      } else {
        const error = await res.json();
        alert('Gagal menambah wadah: ' + (error.message || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menambah wadah: Network error');
    }
  };

  const handleExportDetail = (wadah: Wadah) => {
    const members = getWadahMembers(wadah);
    const exportData = members.map((j: any, index: number) => {
      const tgl = (j.tanggalLahir || j.tanggal_lahir || '').split('T')[0] || '-';
      const age = tgl !== '-' ? calculateAge(tgl) : '-';
      return {
        'No': index + 1,
        'Nama Jemaat': j.nama || '-',
        'Jenis Kelamin': j.gender || '-',
        'Tanggal Lahir': tgl,
        'Usia': age !== '-' ? `${age} tahun` : '-',
        'Rayon': j.rayon || '-',
        'Wadah': wadah.namaWadah,
        'No. WhatsApp / HP': j.noHp || j.no_hp || j.noTelepon || '-',
        'Alamat': j.alamat || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, wadah.namaWadah.slice(0, 31));
    XLSX.writeFile(workbook, `Data_Anggota_${wadah.namaWadah.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
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
            onClick={() => { setEditingWadah(null); setIsAdding(true); }}
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
                <th className="px-6 py-4">RENTANG UMUR</th>
                <th className="px-6 py-4">JUMLAH ANGGOTA</th>
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
                  <td colSpan={5} className="text-center py-12 text-text-muted">Tidak ada data wadah.</td>
                </tr>
              ) : (
                filteredData.map(wadah => (
                  <tr key={wadah.id} className="hover:bg-sand-darker/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{wadah.namaWadah}</td>
                    <td className="px-6 py-4">{wadah.ketuaWadah}</td>
                    <td className="px-6 py-4">{wadah.umurMinimal} - {wadah.umurMaksimal} tahun</td>
                    <td className="px-6 py-4 font-bold">{wadah.jumlahAnggota} orang</td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" onClick={() => setViewingWadah(wadah)} title="Lihat Anggota"><Eye size={16} /></button>
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => { setIsAdding(false); setEditingWadah(wadah); }} title="Edit Wadah"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(wadah.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={16} /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border-subtle shadow-xl w-full max-w-lg overflow-hidden my-auto">
            <div className="p-6 border-b border-border-subtle bg-sand-dark flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">
                {isAdding ? 'Tambah Wadah Baru' : 'Edit Data Wadah'}
              </h2>
              <button onClick={() => { setIsAdding(false); setEditingWadah(null); }} className="text-text-muted hover:text-navy p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form id="wadah-form" key={editingWadah?.id || (isAdding ? 'add' : 'none')} onSubmit={isAdding ? handleAddSave : handleEditSave} className="space-y-5">
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
                type="button"
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
        </div>
      )}

      {/* View Detail & Member List Modal */}
      {viewingWadah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-border-subtle my-auto max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
              <div>
                <h2 className="text-xl font-bold text-navy">{viewingWadah.namaWadah}</h2>
                <p className="text-xs text-text-muted font-medium">Ketua: {viewingWadah.ketuaWadah} • Rentang Usia: {viewingWadah.umurMinimal} - {viewingWadah.umurMaksimal} tahun</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleExportDetail(viewingWadah)}
                  className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <Download size={16} /> Export Detail XLS
                </button>
                <button onClick={() => setViewingWadah(null)} className="p-2 hover:bg-sand-darker rounded-full transition-colors text-text-muted hover:text-navy">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                <h3 className="font-bold text-navy">Daftar Anggota ({getWadahMembers(viewingWadah).length} orang)</h3>
              </div>

              {getWadahMembers(viewingWadah).length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">Belum ada anggota terdaftar pada wadah ini.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-navy">
                    <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Tgl Lahir</th>
                        <th className="px-4 py-3">Usia</th>
                        <th className="px-4 py-3">Rayon</th>
                        <th className="px-4 py-3">No. WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {getWadahMembers(viewingWadah).map((j: any) => {
                        const tgl = j.tanggalLahir || j.tanggal_lahir || '';
                        const age = tgl ? calculateAge(tgl) : '-';
                        return (
                          <tr key={j.id} className="hover:bg-sand-darker/30">
                            <td className="px-4 py-3 font-medium">{j.nama}</td>
                            <td className="px-4 py-3">{tgl.split('T')[0] || '-'}</td>
                            <td className="px-4 py-3">{age !== '-' ? `${age} thn` : '-'}</td>
                            <td className="px-4 py-3">{j.rayon || '-'}</td>
                            <td className="px-4 py-3">{j.noHp || j.no_hp || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
