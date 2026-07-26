import { useState, useEffect } from 'react';
import { Users, Cake, FileText, CheckSquare, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAktif: 0,
    ultahBulanIni: 0,
    totalPria: 0,
    totalWanita: 0,
    pendingVerifikasi: 0,
    pendaftarEform: 0,
    permohonanDoa: 0
  });

  useEffect(() => {
    // In a real app we would have a specific endpoint /api/stats
    // For now we fetch jemaat and registrations and compute
    Promise.all([
      fetch('/api/jemaat').then(res => res.json()),
      fetch('/api/registrations').then(res => res.json()),
      fetch('/api/prayers').then(res => res.json())
    ]).then(([jemaatRes, regRes, prayerRes]) => {
      const jemaat = jemaatRes.data || [];
      const regs = regRes.data || [];
      const prayers = prayerRes.data || [];
      
      const aktif = jemaat.filter((j: any) => j.statusJemaat === 'Aktif');
      
      setStats({
        totalAktif: aktif.length,
        ultahBulanIni: 0, // Mock, needs date parsing
        totalPria: aktif.filter((j: any) => j.gender === 'Pria').length,
        totalWanita: aktif.filter((j: any) => j.gender === 'Wanita').length,
        pendingVerifikasi: regs.filter((r: any) => r.status === 'Pending').length,
        pendaftarEform: regs.length,
        permohonanDoa: prayers.length
      });
    });
  }, []);

  const metricCards = [
    { title: 'Total Jemaat Aktif', value: stats.totalAktif, icon: Users, color: 'text-navy', bg: 'bg-sand-dark' },
    { title: 'Ultah Bulan Ini', value: stats.ultahBulanIni, icon: Cake, color: 'text-gold', bg: 'bg-gold/10' },
    { title: 'Total Pria', value: stats.totalPria, icon: Users, color: 'text-navy', bg: 'bg-sand-dark' },
    { title: 'Total Wanita', value: stats.totalWanita, icon: Users, color: 'text-navy', bg: 'bg-sand-dark' },
    { title: 'Pending Verifikasi', value: stats.pendingVerifikasi, icon: CheckSquare, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Total Pendaftar E-Form', value: stats.pendaftarEform, icon: FileText, color: 'text-navy', bg: 'bg-sand-dark' },
    { title: 'Permohonan Doa', value: stats.permohonanDoa, icon: MessageSquare, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Dashboard Statistik</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, idx) => (
          <motion.div 
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-4 hover:shadow-md hover:border-gold transition-all"
          >
            <div className={clsx("w-14 h-14 rounded-xl flex items-center justify-center", card.bg, card.color)}>
              <card.icon size={28} />
            </div>
            <div>
              <p className="text-sm text-text-muted font-bold mb-1 uppercase tracking-wider text-[10px]">{card.title}</p>
              <h3 className="text-3xl font-bold text-navy">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-6">
        <h2 className="text-lg font-bold text-navy mb-4 border-b border-border-subtle pb-4">Jemaat Berulang Tahun (Minggu Ini)</h2>
        <div className="text-center py-12 text-text-muted">
          Belum ada data ulang tahun minggu ini.
        </div>
      </div>
    </div>
  );
}
