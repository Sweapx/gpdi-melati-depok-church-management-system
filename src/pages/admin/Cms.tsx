import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';

export default function Cms() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'schedules' | 'hero' | 'warta'>('announcements');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const getEndpoint = (tab: string) => {
    switch (tab) {
      case 'announcements': return '/api/announcements';
      case 'schedules': return '/api/schedules';
      case 'hero': return '/api/hero-slides';
      case 'warta': return '/api/warta-jemaat';
      default: return '/api/announcements';
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(getEndpoint(activeTab))
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus konten ini?')) return;
    try {
      const res = await fetch(`${getEndpoint(activeTab)}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setData(data.filter(k => k.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleAddClick = () => {
    setIsAdding(true);
    setFormData({});
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload = { ...formData };
    
    // Add default values if missing
    if (activeTab === 'announcements') {
      payload = { ...payload, tanggal: new Date().toLocaleDateString(), ringkasan: payload.ringkasan || '', isi: payload.isi || '', penting: false };
    } else if (activeTab === 'schedules') {
      payload = { ...payload, isRegistrationRequired: payload.isRegistrationRequired === 'true', kuota: payload.isRegistrationRequired === 'true' ? Number(payload.kuota) : 0, terdaftar: 0 };
    } else if (activeTab === 'hero') {
      payload = { ...payload, isActive: true, orderIndex: data.length };
    } else if (activeTab === 'warta') {
      payload = { ...payload, tanggal: new Date().toISOString(), petugasList: [] };
    }

    try {
      const res = await fetch(getEndpoint(activeTab), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        setData([...data, json.data]);
        setIsAdding(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const res = await fetch(`${getEndpoint(activeTab)}/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(editingItem)
      });
      if (res.ok) {
        setData(data.map(j => j.id === editingItem.id ? editingItem : j));
        setEditingItem(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">Content Management System</h1>
        <button onClick={handleAddClick} className="bg-navy text-gold px-4 py-2 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2">
          <Plus size={16} /> Tambah Konten
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="flex border-b border-border-subtle overflow-x-auto">
          {['announcements', 'schedules', 'hero', 'warta'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === tab ? 'text-navy border-b-2 border-navy' : 'text-text-muted hover:bg-sand-dark'}`}
            >
              {tab === 'announcements' ? 'Pengumuman' : 
               tab === 'schedules' ? 'Jadwal Ibadah' : 
               tab === 'hero' ? 'Banner Slide' : 'Warta Jemaat'}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">Judul / Utama</th>
                <th className="px-6 py-4">Kategori / Tipe</th>
                <th className="px-6 py-4">Waktu / Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-text-muted">Memuat data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-text-muted">Tidak ada data.</td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-sand-darker/50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {activeTab === 'announcements' || activeTab === 'schedules' ? item.judul : 
                       activeTab === 'hero' ? item.title : item.edisi}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sand-dark text-text-muted">
                        {activeTab === 'announcements' || activeTab === 'schedules' ? item.kategori : 
                         activeTab === 'hero' ? item.ctaType : 'Warta'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'announcements' ? item.tanggal : 
                       activeTab === 'schedules' ? item.hariJam : 
                       activeTab === 'hero' ? (item.isActive ? 'Aktif' : 'Nonaktif') : new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button className="p-1.5 text-text-muted hover:text-navy hover:bg-sand-dark rounded-lg transition-colors" onClick={() => setEditingItem(item)}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border-subtle flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
              <h2 className="text-xl font-bold text-navy">Edit Konten</h2>
              <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-sand-darker rounded-full transition-colors text-text-muted hover:text-navy">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="edit-cms-form" onSubmit={handleEditSave} className="space-y-4">
                
                {(activeTab === 'announcements' || activeTab === 'schedules') && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Judul</label>
                      <input type="text" value={editingItem.judul} onChange={e => setEditingItem({...editingItem, judul: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Kategori</label>
                      <input type="text" value={editingItem.kategori} onChange={e => setEditingItem({...editingItem, kategori: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1" required />
                    </div>
                  </>
                )}

                {activeTab === 'announcements' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Ringkasan</label>
                      <textarea rows={2} value={editingItem.ringkasan || ''} onChange={e => setEditingItem({...editingItem, ringkasan: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 resize-none" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Isi Pengumuman</label>
                      <textarea rows={4} value={editingItem.isi || ''} onChange={e => setEditingItem({...editingItem, isi: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 resize-none" required />
                    </div>
                  </>
                )}

                {activeTab === 'schedules' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Hari & Jam (contoh: Minggu, 09:00 WIB)</label>
                      <input type="text" value={editingItem.hariJam || ''} onChange={e => setEditingItem({...editingItem, hariJam: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Perlu Pendaftaran?</label>
                      <select value={editingItem.isRegistrationRequired?.toString() || 'false'} onChange={e => setEditingItem({...editingItem, isRegistrationRequired: e.target.value === 'true', kuota: e.target.value === 'true' ? (editingItem.kuota || 100) : undefined})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required>
                        <option value="false">Tidak (Umum)</option>
                        <option value="true">Ya (Perlu Daftar)</option>
                      </select>
                    </div>
                    {editingItem.isRegistrationRequired && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-navy">Kuota Pendaftaran</label>
                          <input type="number" min="1" value={editingItem.kuota || ''} onChange={e => setEditingItem({...editingItem, kuota: Number(e.target.value)})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-navy">Biaya Pendaftaran</label>
                          <input type="text" placeholder="Kosongkan jika gratis" value={editingItem.registrationFee || ''} onChange={e => setEditingItem({...editingItem, registrationFee: e.target.value, needPaymentProof: !!e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" />
                        </div>
                        <div className="border border-border-subtle rounded-xl p-4 bg-sand-dark/30 space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-navy">Custom Form Fields</label>
                            <button type="button" onClick={() => setEditingItem({...editingItem, customFields: [...(editingItem.customFields || []), { id: Date.now().toString(), label: 'Field Baru', type: 'text' }]})} className="text-xs font-bold text-navy bg-white px-2 py-1 border border-border-subtle rounded-md hover:text-gold transition-colors">+ Tambah Field</button>
                          </div>
                          {(!editingItem.customFields || editingItem.customFields.length === 0) && (
                            <p className="text-xs text-text-muted">Belum ada field tambahan.</p>
                          )}
                          {editingItem.customFields?.map((field: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-border-subtle space-y-2 relative">
                              <button type="button" onClick={() => {
                                const newFields = [...editingItem.customFields];
                                newFields.splice(idx, 1);
                                setEditingItem({...editingItem, customFields: newFields});
                              }} className="absolute top-2 right-2 p-1 text-text-muted hover:text-rose-500 bg-sand-dark rounded-md"><Trash2 size={14} /></button>
                              
                              <div>
                                <label className="text-[10px] font-bold text-navy uppercase tracking-wider">Nama Field (Label)</label>
                                <input type="text" value={field.label} onChange={e => {
                                  const newFields = [...editingItem.customFields];
                                  newFields[idx].label = e.target.value;
                                  setEditingItem({...editingItem, customFields: newFields});
                                }} className="w-full border border-border-subtle rounded-md px-2 py-1 text-xs mt-1" required />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider">Tipe</label>
                                  <select value={field.type} onChange={e => {
                                    const newFields = [...editingItem.customFields];
                                    newFields[idx].type = e.target.value;
                                    setEditingItem({...editingItem, customFields: newFields});
                                  }} className="w-full border border-border-subtle rounded-md px-2 py-1 text-xs mt-1">
                                    <option value="text">Teks Bebas</option>
                                    <option value="select">Dropdown (Pilihan)</option>
                                    <option value="checkbox">Persetujuan (Checkbox)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider">Wajib Diisi?</label>
                                  <select value={field.required ? 'true' : 'false'} onChange={e => {
                                    const newFields = [...editingItem.customFields];
                                    newFields[idx].required = e.target.value === 'true';
                                    setEditingItem({...editingItem, customFields: newFields});
                                  }} className="w-full border border-border-subtle rounded-md px-2 py-1 text-xs mt-1">
                                    <option value="true">Ya</option>
                                    <option value="false">Tidak</option>
                                  </select>
                                </div>
                              </div>
                              {field.type === 'select' && (
                                <div>
                                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider">Pilihan (Pisahkan dengan koma)</label>
                                  <input type="text" value={field.options?.join(',') || ''} onChange={e => {
                                    const newFields = [...editingItem.customFields];
                                    newFields[idx].options = e.target.value.split(',').map((s: string) => s.trim());
                                    setEditingItem({...editingItem, customFields: newFields});
                                  }} placeholder="Misal: Pagi, Siang, Malam" className="w-full border border-border-subtle rounded-md px-2 py-1 text-xs mt-1" required />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === 'hero' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Judul Utama</label>
                      <input type="text" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1" required />
                    </div>
                    <div>
                      <FileUpload label="Upload Gambar" accept="image/*" previewUrl={editingItem.imageUrl} onFileSelect={(base64) => setEditingItem({...editingItem, imageUrl: base64})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Badge (Label Atas)</label>
                      <input type="text" value={editingItem.badge} onChange={e => setEditingItem({...editingItem, badge: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Call to Action Type</label>
                      <select value={editingItem.ctaType} onChange={e => setEditingItem({...editingItem, ctaType: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1">
                        <option value="event">Pendaftaran Event</option>
                        <option value="jemaat_baru">Pendaftaran Jemaat Baru</option>
                        <option value="baptisan">Pendaftaran Baptisan</option>
                        <option value="schedule">Jadwal</option>
                        <option value="prayer">Doa</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'warta' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Edisi Warta</label>
                      <input type="text" value={editingItem.edisi} onChange={e => setEditingItem({...editingItem, edisi: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Tema Minggu</label>
                      <input type="text" value={editingItem.temaMinggu} onChange={e => setEditingItem({...editingItem, temaMinggu: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Ayat Minggu</label>
                      <input type="text" value={editingItem.ayatMinggu} onChange={e => setEditingItem({...editingItem, ayatMinggu: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1" required />
                    </div>
                    <div>
                      <FileUpload label="Upload PDF Warta" accept="application/pdf" previewUrl={editingItem.pdfUrl} onFileSelect={(base64) => setEditingItem({...editingItem, pdfUrl: base64})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Pengumuman & Isi</label>
                      <textarea rows={4} value={editingItem.pengumuman} onChange={e => setEditingItem({...editingItem, pengumuman: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 resize-none" required />
                    </div>
                  </>
                )}

              </form>
            </div>
            <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
              <button onClick={() => setEditingItem(null)} className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors">Batal</button>
              <button type="submit" form="edit-cms-form" className="bg-navy text-gold px-6 py-2.5 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2">
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border-subtle flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-sand-dark">
              <h2 className="text-xl font-bold text-navy">Tambah Konten</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-sand-darker rounded-full transition-colors text-text-muted hover:text-navy">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="add-cms-form" onSubmit={handleAddSubmit} className="space-y-4">
                
                {(activeTab === 'announcements' || activeTab === 'schedules') && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Judul</label>
                      <input type="text" value={formData.judul || ''} onChange={e => setFormData({...formData, judul: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Kategori</label>
                      <input type="text" value={formData.kategori || ''} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                  </>
                )}

                {activeTab === 'schedules' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Hari & Jam (contoh: Minggu, 09:00 WIB)</label>
                      <input type="text" value={formData.hariJam || ''} onChange={e => setFormData({...formData, hariJam: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Perlu Pendaftaran?</label>
                      <select value={formData.isRegistrationRequired || 'false'} onChange={e => setFormData({...formData, isRegistrationRequired: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required>
                        <option value="false">Tidak (Umum)</option>
                        <option value="true">Ya (Perlu Daftar)</option>
                      </select>
                    </div>
                    {formData.isRegistrationRequired === 'true' && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-navy">Kuota Pendaftaran</label>
                          <input type="number" min="1" value={formData.kuota || ''} onChange={e => setFormData({...formData, kuota: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-navy">Biaya Pendaftaran</label>
                          <input type="text" placeholder="Kosongkan jika gratis" value={formData.registrationFee || ''} onChange={e => setFormData({...formData, registrationFee: e.target.value, needPaymentProof: !!e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" />
                        </div>
                        <div className="border border-border-subtle rounded-xl p-4 bg-sand-dark/30 space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-navy">Custom Form Fields</label>
                            <button type="button" onClick={() => setFormData({...formData, customFields: [...(formData.customFields || []), { id: Date.now().toString(), label: 'Field Baru', type: 'text' }]})} className="text-xs font-bold text-navy bg-white px-2 py-1 border border-border-subtle rounded-md hover:text-gold transition-colors">+ Tambah Field</button>
                          </div>
                          {(!formData.customFields || formData.customFields.length === 0) && (
                            <p className="text-xs text-text-muted">Belum ada field tambahan.</p>
                          )}
                          {formData.customFields?.map((field: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-border-subtle space-y-2 relative">
                              <button type="button" onClick={() => {
                                const newFields = [...formData.customFields];
                                newFields.splice(idx, 1);
                                setFormData({...formData, customFields: newFields});
                              }} className="absolute top-2 right-2 p-1 text-text-muted hover:text-rose-500 bg-sand-dark rounded-md"><Trash2 size={14} /></button>
                              
                              <div>
                                <label className="text-[10px] font-bold text-navy uppercase tracking-wider">Nama Field (Label)</label>
                                <input type="text" value={field.label} onChange={e => {
                                  const newFields = [...formData.customFields];
                                  newFields[idx].label = e.target.value;
                                  setFormData({...formData, customFields: newFields});
                                }} className="w-full border border-border-subtle rounded-md px-2 py-1 text-xs mt-1" required />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider">Tipe</label>
                                  <select value={field.type} onChange={e => {
                                    const newFields = [...formData.customFields];
                                    newFields[idx].type = e.target.value;
                                    setFormData({...formData, customFields: newFields});
                                  }} className="w-full border border-border-subtle rounded-md px-2 py-1 text-xs mt-1">
                                    <option value="text">Teks Bebas</option>
                                    <option value="select">Dropdown (Pilihan)</option>
                                    <option value="checkbox">Persetujuan (Checkbox)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider">Wajib Diisi?</label>
                                  <select value={field.required ? 'true' : 'false'} onChange={e => {
                                    const newFields = [...formData.customFields];
                                    newFields[idx].required = e.target.value === 'true';
                                    setFormData({...formData, customFields: newFields});
                                  }} className="w-full border border-border-subtle rounded-md px-2 py-1 text-xs mt-1">
                                    <option value="true">Ya</option>
                                    <option value="false">Tidak</option>
                                  </select>
                                </div>
                              </div>
                              {field.type === 'select' && (
                                <div>
                                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider">Pilihan (Pisahkan dengan koma)</label>
                                  <input type="text" value={field.options?.join(',') || ''} onChange={e => {
                                    const newFields = [...formData.customFields];
                                    newFields[idx].options = e.target.value.split(',').map((s: string) => s.trim());
                                    setFormData({...formData, customFields: newFields});
                                  }} placeholder="Misal: Pagi, Siang, Malam" className="w-full border border-border-subtle rounded-md px-2 py-1 text-xs mt-1" required />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === 'hero' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Judul Utama</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Deskripsi (Subtitle)</label>
                      <input type="text" value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <FileUpload label="Upload Gambar" accept="image/*" previewUrl={formData.imageUrl} onFileSelect={(base64) => setFormData({...formData, imageUrl: base64})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Badge (Label Atas)</label>
                      <input type="text" value={formData.badge || ''} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Call to Action Type</label>
                      <select value={formData.ctaType || 'event'} onChange={e => setFormData({...formData, ctaType: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none">
                        <option value="event">Pendaftaran Event</option>
                        <option value="jemaat_baru">Pendaftaran Jemaat Baru</option>
                        <option value="baptisan">Pendaftaran Baptisan</option>
                        <option value="schedule">Jadwal</option>
                        <option value="prayer">Doa</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'warta' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-navy">Edisi Warta (contoh: Juli 2026)</label>
                      <input type="text" value={formData.edisi || ''} onChange={e => setFormData({...formData, edisi: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Tema Minggu</label>
                      <input type="text" value={formData.temaMinggu || ''} onChange={e => setFormData({...formData, temaMinggu: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Ayat Minggu</label>
                      <input type="text" value={formData.ayatMinggu || ''} onChange={e => setFormData({...formData, ayatMinggu: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                    <div>
                      <FileUpload label="Upload PDF Warta" accept="application/pdf" previewUrl={formData.pdfUrl} onFileSelect={(base64) => setFormData({...formData, pdfUrl: base64})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy">Pengumuman & Isi</label>
                      <textarea rows={4} value={formData.pengumuman || ''} onChange={e => setFormData({...formData, pengumuman: e.target.value})} className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm mt-1 resize-none focus:ring-1 focus:ring-gold outline-none" required />
                    </div>
                  </>
                )}

              </form>
            </div>
            <div className="p-6 border-t border-border-subtle bg-sand-dark flex justify-end gap-3">
              <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-navy transition-colors">Batal</button>
              <button type="submit" form="add-cms-form" className="bg-navy text-gold px-6 py-2.5 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2">
                <Save size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
