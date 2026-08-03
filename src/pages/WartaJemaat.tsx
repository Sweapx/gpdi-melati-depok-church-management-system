import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WartaItem } from '../types';

export default function WartaJemaat() {
  const [warta, setWarta] = useState<WartaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/warta-jemaat')
      .then(res => res.json())
      .then(res => {
        if (res.success) setWarta(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredWarta = warta.filter(w => 
    w.edisi.toLowerCase().includes(search.toLowerCase()) || 
    w.temaMinggu.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-sand pb-20">
      <div className="bg-navy pt-32 pb-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Warta Jemaat</h1>
        <p className="text-sand-dark/80 max-w-xl mx-auto">
          Informasi seputar pelayanan, kegiatan, dan jadwal petugas ibadah mingguan GPdI Melati Depok.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-border-subtle flex items-center gap-3 mb-12 max-w-2xl mx-auto">
          <Search className="text-text-muted ml-2" size={20} />
          <input
            type="text"
            placeholder="Cari edisi atau tema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-navy focus:ring-0"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredWarta.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-border-subtle">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-navy mb-2">Belum ada warta</h3>
            <p className="text-text-muted">Warta jemaat akan muncul di sini setelah diterbitkan.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredWarta.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border-subtle hover:shadow-md transition-shadow group"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div className="flex-grow space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-gold/20 text-navy px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-gold/40">
                        {item.edisi}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-text-muted">
                        <Calendar size={16} />
                        {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-navy mb-1">{item.temaMinggu}</h2>
                      <p className="text-gold font-serif italic text-lg">{item.ayatMinggu}</p>
                    </div>
                    <p className={`text-text-muted leading-relaxed ${expandedId === item.id ? '' : 'line-clamp-2'}`}>
                      {item.pengumuman}
                    </p>
                  </div>
                  <div className="w-full md:w-auto flex-shrink-0 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
                    {item.pdfUrl ? (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-navy text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide uppercase hover:bg-navy-light transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={18} /> Unduh PDF
                      </a>
                    ) : (
                      <button
                        disabled
                        className="bg-sand-dark text-text-muted px-6 py-3 rounded-full font-bold text-sm tracking-wide uppercase cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        PDF Belum Tersedia
                      </button>
                    )}
                    <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="text-navy text-sm font-bold hover:text-gold transition-colors flex items-center justify-center gap-1">
                      {expandedId === item.id ? (
                        <>Tutup <ChevronUp size={16}/></>
                      ) : (
                        <>Baca Selengkapnya <ChevronDown size={16}/></>
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border-subtle bg-sand-dark/30"
                    >
                      <div className="p-6 md:p-8">
                        {item.pdfUrl && (
                          <div className="w-full h-[600px] border border-border-subtle rounded-xl overflow-hidden bg-white">
                            <iframe src={item.pdfUrl} className="w-full h-full" title="Warta PDF" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
