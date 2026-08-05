import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, Users, ChevronRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ScheduleItem } from '../types/index.ts';

export default function JadwalEvent() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jadwal' | 'event'>('jadwal');

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

  const filteredSchedules = schedules.filter(s => {
    const kat = s.kategori || '';
    if (activeTab === 'jadwal') {
      return kat.toLowerCase().includes('ibadah') || kat === 'Sekolah Minggu' || kat === 'Baptisan' || kat === '';
    } else {
      return kat === 'Event' || kat === 'Pelatihan' || (!kat.toLowerCase().includes('ibadah') && kat !== 'Sekolah Minggu' && kat !== 'Baptisan');
    }
  });

  return (
    <div className="bg-sand pb-20">
      {/* Header Section */}
      <div className="bg-navy pt-32 pb-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Jadwal & Event</h1>
        <p className="text-sand-dark/80 max-w-xl mx-auto">
          Informasi lengkap jadwal ibadah mingguan dan kegiatan spesial gereja GPdI Melati Depok.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-border-subtle flex gap-2 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={clsx(
              "flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all",
              activeTab === 'jadwal' ? "bg-navy text-white" : "text-text-muted hover:bg-sand-dark"
            )}
          >
            Jadwal Ibadah
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={clsx(
              "flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all",
              activeTab === 'event' ? "bg-navy text-white" : "text-text-muted hover:bg-sand-dark"
            )}
          >
            Event & Kegiatan
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-border-subtle">
            <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-navy mb-2">Tidak ada {activeTab === 'jadwal' ? 'jadwal' : 'event'}</h3>
            <p className="text-text-muted">
              {activeTab === 'jadwal' ? 'Jadwal ibadah akan muncul di sini.' : 'Event spesial akan muncul di sini.'}
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredSchedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-border-subtle shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-gold transition-all p-6 flex flex-col h-full relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="mb-4 flex justify-between items-start">
                    <span className="px-3 py-1 bg-sand-dark text-navy text-[10px] font-bold rounded-full uppercase tracking-widest border border-border-subtle">
                      {schedule.kategori?.replace('_', ' ') || schedule.kategori || 'Umum'}
                    </span>
                    {schedule.isRegistrationRequired && (
                      <span className="flex items-center gap-1 text-xs font-bold text-navy bg-gold/20 px-2 py-1 rounded-md">
                        <Users size={12} /> Pendaftaran Dibuka
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-navy mb-4">{schedule.judul}</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-navy">
                      <Calendar size={16} className="text-gold" />
                      <span className="font-medium">{schedule.hariJam}</span>
                    </div>
                    {schedule.lokasi && (
                      <div className="flex items-center gap-2 text-sm text-navy">
                        <MapPin size={16} className="text-gold" />
                        <span className="font-medium">{schedule.lokasi}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-text-muted text-sm mb-6 flex-grow leading-relaxed line-clamp-2">{schedule.deskripsi}</p>

                  {schedule.isRegistrationRequired ? (
                    <div className="mt-auto pt-4 border-t border-border-subtle">
                      {schedule.kuota && (
                        <div className="flex justify-between text-xs mb-3">
                          <span className="text-text-muted">Kuota Terisi</span>
                          <span className="font-bold text-navy">{schedule.terdaftar || 0} / {schedule.kuota}</span>
                        </div>
                      )}
                      <Link
                        to="/pendaftaran?tab=event"
                        className="w-full py-2.5 bg-navy text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-navy-light transition-colors flex items-center justify-center gap-2"
                      >
                        Daftar Sekarang <ChevronRight size={16} />
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 border-t border-border-subtle">
                      <span className="text-xs text-text-muted italic">Terbuka untuk umum</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
