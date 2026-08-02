import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Edit2, Trash2, ChevronDown, ChevronUp, X, Save } from 'lucide-react';
import { Jemaat as JemaatType } from '../../types';
import clsx from 'clsx';

export default function Jemaat() {
  const [data, setData] = useState<JemaatType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingJemaat, setEditingJemaat] = useState<JemaatType | null>(null);
  const [editingAnggota, setEditingAnggota] = useState<{ jemaatId: string, anggotaIdx: number, data: any } | null>(null);

  useEffect(() => {
    fetch('/api/jemaat')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleDeleteKeluarga = async (jemaatId: string, idx: number) => {
    if (!window.confirm('Yakin ingin menghapus anggota keluarga ini?')) return;
    const jemaat = data.find(j => j.id === jemaatId);
    if (!jemaat) return;
    
    const newKeluarga = [...(jemaat.anggotaKeluarga || [])];
    newKeluarga.splice(idx, 1);
    
    const updatedJemaat = { ...jemaat, anggotaKeluarga: newKeluarga };
    
    try {
      const res = await fetch(`/api/jemaat/${jemaatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(updatedJemaat)
      });
      if (res.ok) {
        setData(data.map(j => j.id === jemaatId ? updatedJemaat : j));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAnggotaSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnggota) return;
    
    const jemaat = data.find(j => j.id === editingAnggota.jemaatId);
    if (!jemaat) return;
    
    const newKeluarga = [...(jemaat.anggotaKeluarga || [])];
    newKeluarga[editingAnggota.anggotaIdx] = editingAnggota.data;
    const updatedJemaat = { ...jemaat, anggotaKeluarga: newKeluarga };
    
    try {
      const res = await fetch(`/api/jemaat/${jemaat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(updatedJemaat)
      });
      if (res.ok) {
        setData(data.map(j => j.id === jemaat.id ? updatedJemaat : j));
        setEditingAnggota(null);
      }
    } catch (err) {
      console.error(err);
    }
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

  const handleAdd = async () => {
    const namaLengkap = window.prompt('Nama Lengkap:');
    if (!namaLengkap) return;
    const nik = window.prompt('NIK:');
    const gender = window.prompt('Gender (Pria/Wanita):');
    
    try {
      const res = await fetch('/api/jemaat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          nama: namaLengkap,
          nik,
          gender,
          statusJemaat: 'Aktif',
          statusPernikahan: 'Belum Menikah',
          kategoriKaum: 'Umum'
        })
      });
      if (res.ok) {
        const json = await res.json();
        setData([...data, json.data]);
      }
    } catch (e) {
      console.error(e);
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

  const filteredData = data.filter(j => 
    j.nama.toLowerCase().includes(search.toLowerCase()) ||
    j.nik.includes(search)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">Manajemen Data Jemaat</h1>
        <button onClick={handleAdd} className="bg-navy text-gold px-4 py-2 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2">
          <Plus size={16} /> Tambah Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center gap-4 bg-sand-dark">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NIK..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
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
                  <React.Fragment key={jemaat.id}>
                    <tr className="hover:bg-sand-darker/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === jemaat.id ? null : jemaat.id)}>
                      <td className="px-6 py-4">
                        <button className="text-text-muted hover:text-navy transition-colors">
                          {expandedId === jemaat.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-medium">{jemaat.nama}</td>
                      <td className="px-6 py-4">{jemaat.nik}</td>
                      <td className="px-6 py-4">{jemaat.gender}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          jemaat.statusJemaat === 'Aktif' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {jemaat.statusJemaat}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 text-text-muted hover:text-navy hover:bg-sand-dark rounded-lg transition-colors" onClick={() => setEditingJemaat(jemaat)}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(jemaat.id)} className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                    {expandedId === jemaat.id && (
                      <tr className="bg-sand-dark/30 border-b border-border-subtle">
                        <td colSpan={6} className="px-14 py-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Tempat/Tanggal Lahir</p>
                              <p className="font-medium text-navy">{jemaat.tempatLahir}, {jemaat.tanggalLahir}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">No. Handphone</p>
                              <p className="font-medium text-navy">{jemaat.noHp}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Status Pernikahan</p>
                              <p className="font-medium text-navy">{jemaat.statusPernikahan}</p>
                            </div>
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Alamat Lengkap</p>
                              <p className="font-medium text-navy">{jemaat.alamat} {jemaat.kelurahan && `, Kel. ${jemaat.kelurahan}`} {jemaat.kecamatan && `, Kec. ${jemaat.kecamatan}`} {jemaat.kabupatenKota && `, ${jemaat.kabupatenKota}`} {jemaat.provinsi}</p>
                            </div>
                            
                            {jemaat.anggotaKeluarga && jemaat.anggotaKeluarga.length > 0 && (
                              <div className="col-span-2 md:col-span-3 mt-4 pt-4 border-t border-border-subtle">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Anggota Keluarga ({jemaat.anggotaKeluarga.length})</p>
                                <div className="grid gap-3">
                                  {jemaat.anggotaKeluarga.map((ak, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl border border-border-subtle flex justify-between items-center group">
                                      <div>
                                        <p className="font-bold text-navy">{ak.nama}</p>
                                        <p className="text-xs text-text-muted mt-0.5">{ak.nik} • {ak.gender}</p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="bg-sand-dark px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-navy">
                                          {ak.statusKeluarga}
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                          <button onClick={() => setEditingAnggota({ jemaatId: jemaat.id, anggotaIdx: idx, data: { ...ak } })} className="p-1.5 text-text-muted hover:text-navy hover:bg-sand-dark rounded-md transition-colors"><Edit2 size={14} /></button>
                                          <button onClick={() => handleDeleteKeluarga(jemaat.id, idx)} className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingJemaat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border-subtle flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
              <h2 className="text-xl font-bold text-navy">Edit Data Jemaat</h2>
              <button onClick={() => setEditingJemaat(null)} className="p-2 hover:bg-sand-darker rounded-full transition-colors text-text-muted hover:text-navy">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="edit-form" onSubmit={handleEditSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-navy">Nama Lengkap</label>
                  <input type="text" value={editingJemaat.nama} onChange={e => setEditingJemaat({...editingJemaat, nama: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy">NIK</label>
                  <input type="text" value={editingJemaat.nik} onChange={e => setEditingJemaat({...editingJemaat, nik: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy">No. Handphone</label>
                  <input type="text" value={editingJemaat.noHp} onChange={e => setEditingJemaat({...editingJemaat, noHp: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy">Alamat Lengkap</label>
                  <textarea value={editingJemaat.alamat} onChange={e => setEditingJemaat({...editingJemaat, alamat: e.target.value})} rows={2} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none resize-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-navy">Status Jemaat</label>
                    <select value={editingJemaat.statusJemaat} onChange={e => setEditingJemaat({...editingJemaat, statusJemaat: e.target.value as any})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none">
                      <option value="Aktif">Aktif</option>
                      <option value="Inaktif">Inaktif</option>
                      <option value="Keluar">Keluar</option>
                      <option value="Meninggal">Meninggal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy">Gender</label>
                    <select value={editingJemaat.gender} onChange={e => setEditingJemaat({...editingJemaat, gender: e.target.value as any})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none">
                      <option value="Pria">Pria</option>
                      <option value="Wanita">Wanita</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
              <button onClick={() => setEditingJemaat(null)} className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors">Batal</button>
              <button type="submit" form="edit-form" className="bg-navy text-gold px-6 py-2.5 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2">
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
      {editingAnggota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border-subtle flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
              <h2 className="text-xl font-bold text-navy">Edit Anggota Keluarga</h2>
              <button onClick={() => setEditingAnggota(null)} className="p-2 hover:bg-sand-darker rounded-full transition-colors text-text-muted hover:text-navy">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="edit-anggota-form" onSubmit={handleEditAnggotaSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-navy">Nama Lengkap</label>
                  <input type="text" value={editingAnggota.data.nama} onChange={e => setEditingAnggota({...editingAnggota, data: {...editingAnggota.data, nama: e.target.value}})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy">NIK</label>
                  <input type="text" value={editingAnggota.data.nik} onChange={e => setEditingAnggota({...editingAnggota, data: {...editingAnggota.data, nik: e.target.value}})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy">No. Handphone (Opsional)</label>
                  <input type="text" value={editingAnggota.data.noHp || ''} onChange={e => setEditingAnggota({...editingAnggota, data: {...editingAnggota.data, noHp: e.target.value}})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-navy">Status Keluarga</label>
                    <select value={editingAnggota.data.statusKeluarga} onChange={e => setEditingAnggota({...editingAnggota, data: {...editingAnggota.data, statusKeluarga: e.target.value}})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required>
                      <option value="Suami">Suami</option>
                      <option value="Istri">Istri</option>
                      <option value="Anak">Anak</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy">Gender</label>
                    <select value={editingAnggota.data.gender} onChange={e => setEditingAnggota({...editingAnggota, data: {...editingAnggota.data, gender: e.target.value}})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required>
                      <option value="Pria">Pria</option>
                      <option value="Wanita">Wanita</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
              <button onClick={() => setEditingAnggota(null)} className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors">Batal</button>
              <button type="submit" form="edit-anggota-form" className="bg-navy text-gold px-6 py-2.5 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2">
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
