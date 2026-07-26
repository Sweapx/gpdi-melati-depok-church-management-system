import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { KnowledgeBaseQA } from '../../types';

export default function KnowledgeBase() {
  const [data, setData] = useState<KnowledgeBaseQA[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/knowledge-base')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus Q&A ini?')) return;
    try {
      const res = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setData(data.filter(k => k.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async () => {
    const category = window.prompt('Kategori (contoh: Jadwal, Pendaftaran):');
    if (!category) return;
    const intent = window.prompt('Intent (contoh: ask_jadwal):');
    const question = window.prompt('Contoh Pertanyaan (pisahkan dengan koma jika lebih dari satu):');
    const botResponse = window.prompt('Respons Bot Chat:');
    
    if (category && question && botResponse) {
      const patterns = question.split(',').map(s => s.trim());
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ category, intent: intent || 'general', botResponse, patterns, isActive: true, lastUpdated: new Date().toISOString() })
      });
      if (res.ok) {
        const json = await res.json();
        setData([...data, json.data]);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">AI Knowledge Base</h1>
        <button onClick={handleAdd} className="bg-navy text-gold px-4 py-2 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2">
          <Plus size={16} /> Tambah Q&A
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">Topik</th>
                <th className="px-6 py-4">Pertanyaan</th>
                <th className="px-6 py-4">Jawaban Singkat</th>
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
                  <td colSpan={4} className="text-center py-12 text-text-muted">Belum ada data knowledge base.</td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-sand-darker/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sand-dark text-text-muted">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.patterns ? item.patterns[0] : '-'}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{item.botResponse}</td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button className="p-1.5 text-text-muted hover:text-navy hover:bg-sand-dark rounded-lg transition-colors" onClick={() => alert('Fitur edit sedang disiapkan.')}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
