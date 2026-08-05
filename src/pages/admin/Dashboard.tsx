import { useState, useEffect } from 'react';
import { Users, Cake, FileText, CheckSquare, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';

interface BirthdayJemaat {
  id: string;
  nama: string;
  tanggalLahir: string;
  wadah: string;
  rayon: string;
  turningAge: number;
  birthdayThisYear: Date;
}

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

  const [ultahMingguIni, setUltahMingguIni] = useState<BirthdayJemaat[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/jemaat').then(res => res.json()),
      fetch('/api/registrations').then(res => res.json()),
      fetch('/api/prayers').then(res => res.json())
    ]).then(([jemaatRes, regRes, prayerRes]) => {
      const jemaat = jemaatRes.data || [];
      const regs = regRes.data || [];
      const prayers = prayerRes.data || [];
      
      const aktif = jemaat.filter((j: any) => {
        const s = j.statusJemaat || j.status_jemaat;
        return !s || s === 'Aktif';
      });

      const today = new Date();
      const currentMonth = today.getMonth();

      // Start of current week (Monday)
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon...
      const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(today.getDate() + distanceToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      // End of current week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      let countUltahBulanIni = 0;
      const listUltahMingguIni: BirthdayJemaat[] = [];

      aktif.forEach((j: any) => {
        const rawDate = j.tanggalLahir || j.tanggal_lahir;
        if (!rawDate) return;

        const cleanStr = rawDate.toString().split('T')[0];
        const parts = cleanStr.split('-');
        if (parts.length !== 3) return;

        const birthYear = parseInt(parts[0], 10);
        const birthMonth = parseInt(parts[1], 10) - 1;
        const birthDay = parseInt(parts[2], 10);

        if (birthMonth === currentMonth) {
          countUltahBulanIni++;
        }

        const bdayThisYear = new Date(today.getFullYear(), birthMonth, birthDay);

        if (bdayThisYear >= startOfWeek && bdayThisYear <= endOfWeek) {
          const turningAge = today.getFullYear() - birthYear;
          listUltahMingguIni.push({
            id: j.id,
            nama: j.nama,
            tanggalLahir: cleanStr,
            wadah: j.wadah || '-',
            rayon: j.rayon || '-',
            turningAge,
            birthdayThisYear: bdayThisYear
          });
        }
      });

      listUltahMingguIni.sort((a, b) => a.birthdayThisYear.getTime() - b.birthdayThisYear.getTime());

      setStats({
        totalAktif: aktif.length,
        ultahBulanIni: countUltahBulanIni,
        totalPria: aktif.filter((j: any) => j.gender === 'Pria').length,
        totalWanita: aktif.filter((j: any) => j.gender === 'Wanita').length,
        pendingVerifikasi: regs.filter((r: any) => r.status === 'Pending').length,
        pendaftarEform: regs.length,
        permohonanDoa: prayers.length
      });

      setUltahMingguIni(listUltahMingguIni);
    });
  }, []);

  const formatDisplayDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

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
        <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-4">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <Cake size={20} className="text-gold" />
            Jemaat Berulang Tahun (Minggu Ini)
          </h2>
          <span className="text-xs bg-gold/20 text-navy font-bold px-3 py-1 rounded-full border border-gold/30">
            {ultahMingguIni.length} Jemaat
          </span>
        </div>

        {ultahMingguIni.length === 0 ? (
          <div className="text-center py-12 text-text-muted flex flex-col items-center">
            <Calendar className="text-slate-300 mb-2" size={40} />
            <p className="text-sm">Tidak ada jemaat yang berulang tahun pada minggu ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy">
              <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Jemaat</th>
                  <th className="px-4 py-3">Tanggal Lahir</th>
                  <th className="px-4 py-3">Usia Tahun Ini</th>
                  <th className="px-4 py-3">Wadah</th>
                  <th className="px-4 py-3">Rayon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {ultahMingguIni.map((j) => (
                  <tr key={j.id} className="hover:bg-sand-darker/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-navy">{j.nama}</td>
                    <td className="px-4 py-3 text-text-muted">{formatDisplayDate(j.tanggalLahir)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-gold/20 text-navy rounded-lg font-bold text-xs">
                        {j.turningAge} tahun
                      </span>
                    </td>
                    <td className="px-4 py-3">{j.wadah}</td>
                    <td className="px-4 py-3">{j.rayon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
