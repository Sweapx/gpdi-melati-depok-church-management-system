import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { RegistrationItem } from '../../types';
import clsx from 'clsx';

export default function Approvals() {
  const [data, setData] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/registrations')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredData = data.filter(item => item.type === 'jemaat_baru');

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
        <h1 className="text-2xl font-bold text-navy">Pendaftaran Jemaat Baru</h1>
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">No WA</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-muted">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-muted">Tidak ada pendaftaran jemaat baru.</td>
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
                      <td className="px-6 py-4 font-medium">{item.namaPendaftar || (item as any).nama_pendaftar || (item as any).nama || 'Pendaftar Baru'}</td>
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
                        <td colSpan={5} className="px-14 py-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Jenis Kelamin</p>
                              <p className="font-medium text-navy">{item.gender || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Tempat Lahir</p>
                              <p className="font-medium text-navy">{item.tempatLahir || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Tanggal Lahir</p>
                              <p className="font-medium text-navy">{item.tanggalLahir || '-'}</p>
                            </div>
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Alamat Lengkap</p>
                              <p className="font-medium text-navy">{item.alamat || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Rayon</p>
                              <p className="font-medium text-navy">{item.rayon || '-'}</p>
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
