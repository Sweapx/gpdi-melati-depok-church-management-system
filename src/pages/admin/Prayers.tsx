import { useState, useEffect } from 'react';
import { Heart, Search, CheckCircle, Trash2 } from 'lucide-react';
import { PrayerRequest } from '../../types';
import clsx from 'clsx';

export default function Prayers() {
  const [data, setData] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prayers')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleMendoakan = async (id: string) => {
    try {
      const res = await fetch(`/api/prayers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'Didoakan' })
      });
      if (res.ok) {
        setData(data.map(item => item.id === id ? { ...item, status: 'Didoakan' } : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus permohonan doa ini?')) return;
    try {
      const res = await fetch(`/api/prayers/${id}`, {
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

  const formatDisplayDate = (dateVal?: string) => {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch (e) {}
    return '-';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">Permohonan Doa</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-text-muted">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="col-span-full text-center py-12 text-text-muted">Tidak ada permohonan doa.</div>
        ) : (
          data.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-border-subtle shadow-sm p-6 flex flex-col h-full hover:shadow-md hover:border-gold transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-navy">{item.nama}</h3>
                  <p className="text-xs text-text-muted mt-1">{formatDisplayDate(item.tanggal || (item as any).createdAt)}</p>
                </div>
                <span className={clsx(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  item.privasi === 'Rahasia Tim Doa' ? "bg-sand-dark text-text-muted" : "bg-gold/20 text-navy"
                )}>
                  {item.privasi === 'Rahasia Tim Doa' ? 'Anonim' : 'Publik'}
                </span>
              </div>
              <p className="text-sm text-text-muted mb-6 flex-grow leading-relaxed">
                "{item.isiDoa}"
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                <span className="text-xs font-bold text-navy flex items-center gap-1">
                  <Heart size={14} className={item.status === 'Didoakan' ? "text-rose-500 fill-rose-500" : "text-text-muted"} /> 
                  {item.status}
                </span>
                <div className="flex gap-2">
                  {(item.status as string) === 'Didoakan' ? (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleMendoakan(item.id)}
                      disabled={(item.status as string) === 'Didoakan'}
                      className="px-4 py-2 bg-sand-dark hover:bg-gold/20 text-navy rounded-full text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Doakan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
