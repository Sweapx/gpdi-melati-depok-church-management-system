import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2, Filter } from 'lucide-react';
import { RegistrationItem } from '../../types';
import clsx from 'clsx';

export default function ApprovalsEvent() {
  const [data, setData] = useState<RegistrationItem[]>([]);
  const [schedulesList, setSchedulesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterJenisKegiatan, setFilterJenisKegiatan] = useState<string>('Semua Jenis Kegiatan');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/registrations').then(res => res.json()),
      fetch('/api/schedules').then(res => res.json())
    ]).then(([regRes, schedRes]) => {
      if (regRes.success) setData(regRes.data || []);
      if (schedRes.success && schedRes.data) {
        const events = schedRes.data.filter((s: any) => {
          const kat = (s.kategori || '').toLowerCase();
          return kat !== 'ibadah raya' && kat !== 'ibadah';
        });
        setSchedulesList(events);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  // Build unique Jenis Kegiatan categories from admin schedules and registrations
  const eventCategories = Array.from(new Set([
    ...schedulesList.map(s => s.judul || s.kategori).filter(Boolean),
    ...data
      .filter(item => item.type === 'event')
      .map(item => item.jenisKegiatan || (item as any).jenis_kegiatan || (item as any).kategori)
      .filter(Boolean)
  ]));

  const filteredData = data.filter(item => {
    if (item.type !== 'event') return false;
    const jk = item.jenisKegiatan || (item as any).jenis_kegiatan || (item as any).kategori || '';
    if (filterJenisKegiatan !== 'Semua Jenis Kegiatan' && jk !== filterJenisKegiatan) {
      return false;
    }
    return true;
  });

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/registrations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: action === 'approve' ? 'Disetujui' : 'Ditolak' })
      });
      if (res.ok) {
        setData(data.map(item => item.id === id ? { ...item, status: action === 'approve' ? 'Disetujui' : 'Ditolak' } : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus data pendaftaran ini?')) return;
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setData(data.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">Pendaftaran Event</h1>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 border-b border-border-subtle pb-3 text-navy font-bold text-lg">
          <Filter size={20} className="text-gold" />
          <span>Filter Pendaftaran Event</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-navy uppercase tracking-wider">Kategori / Jenis Kegiatan:</label>
            <select
              value={filterJenisKegiatan}
              onChange={e => setFilterJenisKegiatan(e.target.value)}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-gold outline-none bg-sand-dark/30 text-navy font-medium"
            >
              <option value="Semua Jenis Kegiatan">Semua Jenis Kegiatan</option>
              {eventCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {filterJenisKegiatan !== 'Semua Jenis Kegiatan' && (
            <button
              onClick={() => setFilterJenisKegiatan('Semua Jenis Kegiatan')}
              className="py-2.5 px-4 rounded-xl text-xs font-bold bg-sand-dark text-navy border border-border-subtle hover:bg-sand-darker transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Jenis Kegiatan</th>
                <th className="px-6 py-4">No WA</th>
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
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    {filterJenisKegiatan !== 'Semua Jenis Kegiatan' 
                      ? `Tidak ada pendaftaran event untuk jenis kegiatan "${filterJenisKegiatan}".`
                      : 'Tidak ada pendaftaran event.'}
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-sand-darker/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <td className="px-6 py-4">
                        <button className="text-text-muted hover:text-navy transition-colors">
                          {expandedId === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.namaPendaftar || (item as any).nama_pendaftar || (item as any).nama || 'Pendaftar Event'}</td>
                      <td className="px-6 py-4">{item.jenisKegiatan || (item as any).jenis_kegiatan || (item as any).kategori || '-'}</td>
                      <td className="px-6 py-4">{item.noHp || (item as any).no_hp || (item as any).no_whatsapp || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          item.status === 'Disetujui' ? "bg-emerald-100 text-emerald-700" : 
                          item.status === 'Ditolak' ? "bg-rose-100 text-rose-700" : 
                          "bg-amber-100 text-amber-700"
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2" onClick={e => e.stopPropagation()}>
                        {item.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => handleAction(item.id, 'approve')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Setujui"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleAction(item.id, 'reject')}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Tolak"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {expandedId === item.id && (
                      <tr className="bg-sand-dark/30 border-b border-border-subtle">
                        <td colSpan={6} className="px-14 py-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Jenis Kegiatan</p>
                              <p className="font-medium text-navy">{item.jenisKegiatan || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Nama Lengkap</p>
                              <p className="font-medium text-navy">{item.namaPendaftar || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">No WhatsApp</p>
                              <p className="font-medium text-navy">{item.noHp || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Tanggal Daftar</p>
                              <p className="font-medium text-navy">{new Date(item.tanggalDaftar).toLocaleDateString('id-ID')}</p>
                            </div>
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
    </div>
  );
}
