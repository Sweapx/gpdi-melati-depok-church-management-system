import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ChevronDown, Calendar, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { AnnouncementItem } from '../../types/index.ts';

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnnouncements(data.data);
      });
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-navy text-gold rounded-full flex items-center justify-center">
          <Bell size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-serif text-navy">Pengumuman Jemaat</h2>
          <p className="text-text-muted text-sm mt-1">Informasi terbaru seputar kegiatan gereja</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {announcements.map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={item.id} 
            className={clsx(
              "bg-white rounded-2xl border transition-all overflow-hidden",
              item.penting ? "border-gold/50 shadow-sm shadow-gold/10" : "border-border-subtle shadow-sm",
              expandedId === item.id ? "ring-1 ring-gold" : ""
            )}
          >
            <button 
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="w-full p-5 flex items-start gap-4 text-left focus:outline-none"
            >
              {item.penting && (
                <div className="flex-shrink-0 mt-1 text-gold animate-pulse">
                  <AlertCircle size={20} />
                </div>
              )}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", item.penting ? "bg-gold/20 text-navy" : "bg-sand-dark text-navy")}>
                    {item.kategori}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar size={12} /> {item.tanggal}
                  </span>
                </div>
                <h3 className="font-bold text-navy text-lg">{item.judul}</h3>
                <p className="text-sm text-text-muted mt-1 line-clamp-1">{item.ringkasan}</p>
              </div>
              <ChevronDown 
                size={20} 
                className={clsx("text-text-muted transition-transform mt-2", expandedId === item.id ? "rotate-180" : "")} 
              />
            </button>

            <AnimatePresence>
              {expandedId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-5 pt-2"
                >
                  <div className="w-full h-[1px] bg-border-subtle mb-4" />
                  {item.gambarUrl && (
                    <img src={item.gambarUrl} alt={item.judul} className="w-full max-w-sm rounded-xl mb-4 object-cover border border-border-subtle" />
                  )}
                  <div className="prose prose-sm text-text-muted max-w-none whitespace-pre-line leading-relaxed">
                    {item.isi}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
