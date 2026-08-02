import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScheduleItem } from '../../types/index.ts';

export default function SimpleScheduleSection() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedules')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSchedules(data.data.slice(0, 3)); // Show only first 3 schedules
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif text-navy mb-2">Jadwal Ibadah</h2>
          <p className="text-text-muted max-w-lg">Temukan jadwal ibadah mingguan dan kegiatan gereja terdekat.</p>
        </div>
        <Link 
          to="/jadwal-event" 
          className="hidden md:flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-bold hover:bg-navy-light transition-colors text-sm"
        >
          Lihat Semua Jadwal <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-600">Tidak ada jadwal</h3>
          <p className="text-slate-400 text-sm">Belum ada jadwal untuk saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schedules.map((schedule, idx) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl border border-border-subtle shadow-sm hover:shadow-md hover:border-gold transition-all p-6 flex flex-col h-full relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="mb-4 flex justify-between items-start">
                <span className="px-3 py-1 bg-sand-dark text-navy text-[10px] font-bold rounded-full uppercase tracking-widest border border-border-subtle">
                  {schedule.kategori?.replace('_', ' ') || schedule.kategori || 'Umum'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-navy mb-2">{schedule.judul}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Clock size={16} className="text-gold" />
                  <span>{schedule.hariJam}</span>
                </div>
              </div>

              <p className="text-text-muted text-sm mb-4 flex-grow leading-relaxed line-clamp-2">{schedule.deskripsi}</p>

              <Link 
                to="/jadwal-event"
                className="mt-auto pt-4 border-t border-border-subtle text-navy text-sm font-bold hover:text-gold transition-colors flex items-center gap-2"
              >
                Detail Jadwal <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center md:hidden">
        <Link 
          to="/jadwal-event" 
          className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-bold hover:bg-navy-light transition-colors text-sm"
        >
          Lihat Semua Jadwal <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
