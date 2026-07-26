import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { ScheduleItem } from '../../types/index.ts';
import MultiStepRegistrationModal from './MultiStepRegistrationModal';

const categories = [
  { id: 'semua', label: 'Semua Jadwal' },
  { id: 'ibadah_raya', label: 'Ibadah Raya' },
  { id: 'sekolah_minggu', label: 'Sekolah Minggu' },
  { id: 'youth', label: 'Youth Impact' },
  { id: 'event_special', label: 'Event Spesial' },
];

export default function InteractiveSchedule() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('semua');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    fetch('/api/schedules')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSchedules(data.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = schedules.filter(s => activeCategory === 'semua' || s.kategori === activeCategory);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-serif text-navy mb-2">Jadwal Ibadah</h2>
          <p className="text-text-muted max-w-lg">Temukan jadwal ibadah mingguan dan kegiatan gereja terdekat. Kami menantikan kehadiran Anda.</p>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-colors border",
                activeCategory === c.id 
                  ? "bg-navy text-white border-navy" 
                  : "bg-white text-text-muted border-border-subtle hover:bg-sand-dark"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-600">Tidak ada jadwal</h3>
          <p className="text-slate-400 text-sm">Belum ada jadwal untuk kategori ini.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(schedule => (
              <motion.div
                key={schedule.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-border-subtle shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-gold transition-all p-6 flex flex-col h-full relative overflow-hidden group"
              >
                {/* Decorative side accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="mb-4 flex justify-between items-start">
                  <span className="px-3 py-1 bg-sand-dark text-navy text-[10px] font-bold rounded-full uppercase tracking-widest border border-border-subtle">
                    {schedule.kategori.replace('_', ' ')}
                  </span>
                  {schedule.isRegistrationRequired && (
                    <span className="flex items-center gap-1 text-xs font-bold text-navy bg-gold/20 px-2 py-1 rounded-md">
                      <Users size={12} /> Pendaftaran Dibuka
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-navy mb-2">{schedule.judul}</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Clock size={16} className="text-gold" />
                    <span>{schedule.hariJam}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <User size={16} className="text-gold" />
                    <span>Pdt. {schedule.pembicara}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <MapPin size={16} className="text-gold" />
                    <span>{schedule.lokasi}</span>
                  </div>
                </div>

                <p className="text-text-muted text-sm mb-6 flex-grow leading-relaxed">{schedule.deskripsi}</p>

                {schedule.isRegistrationRequired && (
                  <div className="mt-auto pt-4 border-t border-border-subtle">
                    {schedule.kuota && (
                      <div className="flex justify-between text-xs mb-3">
                        <span className="text-text-muted">Kuota Terisi</span>
                        <span className="font-bold text-navy">{schedule.terdaftar || 0} / {schedule.kuota}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => setSelectedEvent(schedule)}
                      className="w-full py-2.5 bg-navy text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-navy-light transition-colors flex items-center justify-center gap-2"
                    >
                      Daftar Acara <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {selectedEvent && (
        <MultiStepRegistrationModal
          type="event"
          eventConfig={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

const User = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
