import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { KnowledgeBaseQA } from '../../types';

export default function KnowledgeBase() {
  const [data, setData] = useState<KnowledgeBaseQA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    patterns: '',
    botResponse: ''
  });

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.category && formData.patterns && formData.botResponse) {
      const patterns = formData.patterns.split(',').map(s => s.trim());
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ 
          category: formData.category, 
          intent: 'general', 
          botResponse: formData.botResponse, 
          patterns, 
          isActive: true, 
          lastUpdated: new Date().toISOString() 
        })
      });
      if (res.ok) {
        const json = await res.json();
        setData([...data, json.data]);
        setFormData({ category: '', patterns: '', botResponse: '' });
        setShowAddForm(false);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">AI Knowledge Base</h1>
          <p className="text-sm text-text-muted mt-1">Kelola pertanyaan dan jawaban untuk chatbot AI</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-navy text-gold px-4 py-2 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center gap-2">
          {showAddForm ? <X size={16} /> : <Plus size={16} />} {showAddForm ? 'Batal' : 'Tambah Q&A'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-navy mb-4">Tambah Pertanyaan & Jawaban Baru</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">
                Kategori / Topik
                <span className="text-text-muted font-normal normal-case ml-2">Untuk pengelompokan pertanyaan (contoh: Jadwal, Pendaftaran, Kontak)</span>
              </label>
              <input 
                type="text" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                placeholder="Contoh: Jadwal Ibadah"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">
                Pertanyaan (Patterns)
                <span className="text-text-muted font-normal normal-case ml-2">Pisahkan dengan koma untuk variasi pertanyaan (contoh: halo, hai, selamat pagi)</span>
              </label>
              <input 
                type="text" 
                value={formData.patterns}
                onChange={(e) => setFormData({...formData, patterns: e.target.value})}
                className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                placeholder="Contoh: halo, hai, selamat pagi, apa kabar"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy uppercase tracking-wider mb-2 block">
                Jawaban Bot
                <span className="text-text-muted font-normal normal-case ml-2">Respon yang akan diberikan chatbot saat pertanyaan cocok</span>
              </label>
              <textarea 
                value={formData.botResponse}
                onChange={(e) => setFormData({...formData, botResponse: e.target.value})}
                className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-gold outline-none h-24 resize-none"
                placeholder="Contoh: Halo! Selamat datang di GPdI Melati Depok. Ada yang bisa saya bantu?"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-navy text-gold px-6 py-2 rounded-full font-bold text-sm hover:bg-navy-light transition-colors">
                Simpan
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-sand-dark text-navy px-6 py-2 rounded-full font-bold text-sm hover:bg-sand-darker transition-colors">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">Topik</th>
                <th className="px-6 py-4">Pertanyaan</th>
                <th className="px-6 py-4">Jawaban</th>
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
                  <td colSpan={4} className="text-center py-12 text-text-muted">
                    Belum ada data knowledge base. Klik "Tambah Q&A" untuk menambahkan pertanyaan dan jawaban untuk chatbot.
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-sand-darker/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sand-dark text-text-muted">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.patterns ? item.patterns.join(', ') : '-'}</td>
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
