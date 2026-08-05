import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, ArrowUpDown, Filter } from 'lucide-react';
import { Jemaat as JemaatType } from '../../types';
import clsx from 'clsx';

interface WadahItem {
  id: string;
  namaWadah: string;
  umurMinimal: number;
  umurMaksimal: number;
  [key: string]: any;
}

interface BirthdayRow {
  id: string;
  nama: string;
  tanggalLahirRaw: string;
  birthdayFormatted: string;
  turningAge: number;
  wadahDisplay: string;
  birthdayThisYear: Date;
}

export default function UlangTahun() {
  const [jemaatList, setJemaatList] = useState<JemaatType[]>([]);
  const [wadahList, setWadahList] = useState<WadahItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortNearest, setSortNearest] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/jemaat').then(res => res.json()),
      fetch('/api/wadah').then(res => res.json())
    ]).then(([jemaatRes, wadahRes]) => {
      if (jemaatRes.success) setJemaatList(jemaatRes.data || []);
      if (wadahRes.success) {
        const convertedWadah = (wadahRes.data || []).map((w: any) => ({
          id: w.id,
          namaWadah: w.nama_wadah || w.namaWadah,
          umurMinimal: Number(w.umur_minimal !== undefined ? w.umur_minimal : w.umurMinimal) || 0,
          umurMaksimal: Number(w.umur_maksimal !== undefined ? w.umur_maksimal : w.umurMaksimal) || 150,
        }));
        setWadahList(convertedWadah);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const calculateAgeThisYear = (birthDateStr: string): { turningAge: number; birthdayThisYear: Date; formatted: string } | null => {
    if (!birthDateStr) return null;
    const cleanStr = birthDateStr.toString().split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return null;

    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);

    const today = new Date();
    const currentYear = today.getFullYear();

    const birthdayThisYear = new Date(currentYear, birthMonth, birthDay);
    const turningAge = currentYear - birthYear;

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const formatted = `${birthDay} ${monthNames[birthMonth]}`;
    return { turningAge, birthdayThisYear, formatted };
  };

  const getDisplayWadah = (jemaat: JemaatType): string => {
    if (jemaat.wadah && jemaat.wadah !== 'Otomatis' && jemaat.wadah.trim() !== '') {
      const trimmedJ = jemaat.wadah.trim().toLowerCase();
      const existingInList = wadahList.find(w => w.namaWadah.trim().toLowerCase() === trimmedJ);
      if (existingInList) return existingInList.namaWadah;
    }

    if (jemaat.tanggalLahir) {
      const cleanStr = jemaat.tanggalLahir.toString().split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const birthYear = parseInt(parts[0], 10);
        const age = new Date().getFullYear() - birthYear;
        const matchingWadah = wadahList.find(w => {
          const wName = w.namaWadah.toLowerCase();
          if (age < w.umurMinimal || age > w.umurMaksimal) return false;
          const isPriaWadah = wName.includes('pria') || wName.includes('bapak');
          const isWanitaWadah = wName.includes('wanita') || wName.includes('ibu');
          if (isPriaWadah && jemaat.gender && jemaat.gender !== 'Pria') return false;
          if (isWanitaWadah && jemaat.gender && jemaat.gender !== 'Wanita') return false;
          return true;
        });
        if (matchingWadah) return matchingWadah.namaWadah;
      }
    }

    return jemaat.wadah && jemaat.wadah !== 'Otomatis' ? jemaat.wadah : '-';
  };

  // Build rows
  const birthdayRows: BirthdayRow[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  jemaatList.forEach(j => {
    const isAktif = !j.statusJemaat || j.statusJemaat === 'Aktif' || (j as any).status_jemaat === 'Aktif';
    if (!isAktif || !j.tanggalLahir) return;

    const bInfo = calculateAgeThisYear(j.tanggalLahir);
    if (!bInfo) return;

    birthdayRows.push({
      id: j.id,
      nama: j.nama,
      tanggalLahirRaw: j.tanggalLahir,
      birthdayFormatted: bInfo.formatted,
      turningAge: bInfo.turningAge,
      wadahDisplay: getDisplayWadah(j),
      birthdayThisYear: bInfo.birthdayThisYear
    });
  });

  // Filter rows
  const filteredRows = birthdayRows.filter(row => {
    // Search filter
    if (search && !row.nama.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Date range filter (Dari Tanggal s/d Sampai Tanggal)
    if (startDate) {
      const sParts = startDate.split('-');
      if (sParts.length === 3) {
        const startTarget = new Date(today.getFullYear(), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));
        startTarget.setHours(0, 0, 0, 0);
        if (row.birthdayThisYear < startTarget) return false;
      }
    }

    if (endDate) {
      const eParts = endDate.split('-');
      if (eParts.length === 3) {
        const endTarget = new Date(today.getFullYear(), parseInt(eParts[1], 10) - 1, parseInt(eParts[2], 10));
        endTarget.setHours(23, 59, 59, 999);
        if (row.birthdayThisYear > endTarget) return false;
      }
    }

    return true;
  });

  // Sort rows (nearest birthday first or chronological order)
  filteredRows.sort((a, b) => {
    if (sortNearest) {
      const diffA = a.birthdayThisYear.getTime() - today.getTime();
      const diffB = b.birthdayThisYear.getTime() - today.getTime();
      const distA = diffA < 0 ? diffA + 365 * 86400000 : diffA;
      const distB = diffB < 0 ? diffB + 365 * 86400000 : diffB;
      return distA - distB;
    } else {
      return a.birthdayThisYear.getTime() - b.birthdayThisYear.getTime();
    }
  });

  const handleExportXLS = () => {
    const headers = ['Nama Jemaat', 'Tanggal Ulang Tahun', 'Usia (Tahun Ini)', 'Wadah'];
    const csvRows = filteredRows.map(row => [
      `"${row.nama.replace(/"/g, '""')}"`,
      `"${row.birthdayFormatted}"`,
      `"${row.turningAge} Tahun"`,
      `"${row.wadahDisplay.replace(/"/g, '""')}"`
    ]);

    const csvString = '\uFEFF' + [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Ulang_Tahun_Jemaat_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Manajemen Ulang Tahun Jemaat</h1>

      {/* Filter Laporan Card */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 border-b border-border-subtle pb-3 text-navy font-bold text-lg">
          <Filter size={20} className="text-gold" />
          <span>Filter Laporan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy uppercase tracking-wider">Cari Nama</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Cari nama jemaat..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-subtle focus:ring-1 focus:ring-gold outline-none text-sm bg-sand-dark/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy uppercase tracking-wider">Dari Tanggal:</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-border-subtle rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-gold outline-none bg-sand-dark/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy uppercase tracking-wider">Sampai Tanggal:</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-border-subtle rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-gold outline-none bg-sand-dark/30"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSortNearest(!sortNearest)}
              className={clsx(
                "flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-colors flex items-center justify-center gap-1.5",
                sortNearest
                  ? "bg-navy text-gold border-navy"
                  : "bg-white text-navy border-border-subtle hover:bg-sand-dark"
              )}
              title="Urutkan tanggal terdekat dengan hari ini"
            >
              <ArrowUpDown size={14} />
              <span>Urutkan Tanggal (Terdekat)</span>
            </button>

            <button
              type="button"
              onClick={handleExportXLS}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download size={14} /> Export XLS
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy">
            <thead className="bg-sand-dark text-text-muted text-xs uppercase font-bold tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">Nama Jemaat</th>
                <th className="px-6 py-4">Tanggal Ulang Tahun</th>
                <th className="px-6 py-4">Usia (Tahun Ini)</th>
                <th className="px-6 py-4">Wadah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-text-muted">Memuat data ulang tahun...</td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-text-muted">Tidak ada data ulang tahun jemaat yang sesuai.</td>
                </tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.id} className="hover:bg-sand-darker/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-navy">{row.nama}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Calendar size={15} className="text-gold" />
                      <span className="font-medium">{row.birthdayFormatted}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gold/20 text-navy font-bold rounded-lg text-xs">
                        {row.turningAge} Tahun
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{row.wadahDisplay}</td>
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
