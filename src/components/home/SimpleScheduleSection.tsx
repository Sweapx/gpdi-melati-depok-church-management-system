import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ArrowRight, MapPin, X, Users, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScheduleItem } from '../../types/index.ts';

function formatTanggalDisplay(tanggal?: string, hariJam?: string, waktu?: string) {
  let dateText = '';
  if (tanggal && tanggal.trim() !== '' && tanggal !== '-') {
    const cleanStr = tanggal.toString().split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        dateText = d.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }
    if (!dateText) {
      const d = new Date(tanggal);
      if (!isNaN(d.getTime())) {
        dateText = d.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }
  }

  const extraTime = waktu || hariJam || '';
  if (dateText && extraTime) {
    if (extraTime.includes(':') || extraTime.includes('WIB')) {
      const timeOnly = extraTime.replace(/^[A-Za-z\s]+,\s*/, '');
      return `${dateText} (${timeOnly})`;
    }
    return `${dateText} • ${extraTime}`;
  }
  return dateText || extraTime || '-';
}

export default function SimpleScheduleSection() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const navigate = useNavigate();

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

  const handleOpenDetail = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
  };

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
          {schedules.map((schedule, idx) => {
            const isEvent = (schedule.kategori || '').toLowerCase().includes('event') || (schedule.kategori || '').toLowerCase().includes('pelatihan');
            const targetTab = isEvent ? 'event' : 'jadwal';
            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-border-subtle shadow-sm hover:shadow-md hover:border-gold transition-all p-6 flex flex-col h-full relative overflow-hidden group cursor-pointer"
                onClick={() => handleOpenDetail(schedule)}
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
                    <Calendar size={16} className="text-gold" />
                    <span>{formatTanggalDisplay(schedule.tanggal, schedule.hariJam, schedule.waktu)}</span>
                  </div>
                  {schedule.waktu && (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <Clock size={16} className="text-gold" />
                      <span>{schedule.waktu}</span>
                    </div>
                  )}
                  {schedule.lokasi && (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <MapPin size={16} className="text-gold" />
                      <span>{schedule.lokasi}</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jadwal-event?tab=${targetTab}&id=${schedule.id}`);
                  }}
                  className="mt-auto pt-4 border-t border-border-subtle text-navy text-sm font-bold hover:text-gold transition-colors flex items-center justify-between w-full text-left"
                >
                  <span>Detail Jadwal</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-gold" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-border-subtle relative overflow-hidden"
            >
              <button 
                onClick={() => setSelectedSchedule(null)}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-navy rounded-full hover:bg-sand-dark transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-4">
                <span className="px-3 py-1 bg-gold/20 text-navy text-[10px] font-bold rounded-full uppercase tracking-widest border border-gold/30">
                  {selectedSchedule.kategori?.replace('_', ' ') || selectedSchedule.kategori || 'Jadwal'}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-navy mb-4">{selectedSchedule.judul}</h3>

              <div className="space-y-3 mb-6 bg-sand-dark/30 p-4 rounded-2xl border border-border-subtle">
                <div className="flex items-center gap-3 text-sm text-navy font-medium">
                  <Calendar size={18} className="text-gold" />
                  <span>{selectedSchedule.hariJam || selectedSchedule.tanggal}</span>
                </div>
                {selectedSchedule.waktu && (
                  <div className="flex items-center gap-3 text-sm text-navy font-medium">
                    <Clock size={18} className="text-gold" />
                    <span>{selectedSchedule.waktu}</span>
                  </div>
                )}
                {selectedSchedule.lokasi && (
                  <div className="flex items-center gap-3 text-sm text-navy font-medium">
                    <MapPin size={18} className="text-gold" />
                    <span>{selectedSchedule.lokasi}</span>
                  </div>
                )}
              </div>

              {selectedSchedule.deskripsi && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Keterangan</h4>
                  <p className="text-sm text-navy leading-relaxed">{selectedSchedule.deskripsi}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-subtle">
                {(selectedSchedule.isRegistrationRequired || (selectedSchedule as any).is_registration_required) && (
                  <Link
                    to="/pendaftaran?tab=event"
                    className="flex-1 bg-gold text-navy text-center py-3 rounded-full font-bold text-sm hover:bg-gold-light transition-colors flex items-center justify-center gap-2 shadow-md shadow-gold/20"
                  >
                    <Users size={16} /> Daftar Event
                  </Link>
                )}
                <Link
                  to={`/jadwal-event?tab=${(selectedSchedule.kategori || '').toLowerCase().includes('event') ? 'event' : 'jadwal'}&id=${selectedSchedule.id}`}
                  className="flex-1 bg-navy text-white text-center py-3 rounded-full font-bold text-sm hover:bg-navy-light transition-colors flex items-center justify-center gap-2"
                >
                  Buka Halaman Jadwal <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
