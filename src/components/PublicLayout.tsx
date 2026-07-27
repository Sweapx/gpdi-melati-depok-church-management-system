import { Outlet, Link } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import ChatbotWidget from './ChatbotWidget.tsx';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-sand text-navy">
      {/* Top Bar */}
      <div className="bg-navy text-sand text-sm py-2 border-b border-navy-light">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={14} className="text-gold" /> 0812-9900-1122</span>
            <span className="flex items-center gap-1"><Mail size={14} className="text-gold" /> info@gpdimelatidepok.org</span>
          </div>
          <span className="flex items-center gap-1"><MapPin size={14} className="text-gold" /> Jl. Melati Raya No. 1, Depok</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-border-subtle sticky top-0 z-40 h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/gpdi-logo.png" alt="GPdI Melati Depok Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-bold text-lg text-navy leading-none tracking-tight">GPdI MELATI DEPOK</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-light font-semibold mt-1">Sistem Manajemen Gereja Digital</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/warta" className="text-text-muted hover:text-navy">Warta Jemaat</Link>
            <a href="/#jadwal" className="text-text-muted hover:text-navy">Jadwal</a>
            <a href="/#pengumuman" className="text-text-muted hover:text-navy">Pengumuman</a>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 font-medium text-slate-600">
            <Link to="/warta" onClick={() => setMobileMenuOpen(false)}>Warta Jemaat</Link>
            <a href="/#jadwal" onClick={() => setMobileMenuOpen(false)}>Jadwal</a>
            <a href="/#pengumuman" onClick={() => setMobileMenuOpen(false)}>Pengumuman</a>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-navy text-sand-dark py-12 mt-12 border-t border-navy-light">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/gpdi-logo.png" alt="GPdI Melati Depok Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-bold text-lg text-white leading-none tracking-tight">GPdI MELATI DEPOK</h1>
              </div>
            </div>
            <p className="text-sm mb-4 leading-relaxed text-text-light">Gereja yang memuridkan dan diutus untuk menjadi berkat bagi kota dan bangsa.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Kontak & Lokasi</h4>
            <ul className="text-sm space-y-2 text-text-light">
              <li>Jl. Melati Raya No. 1, Pancoran Mas, Depok</li>
              <li>Telp: 0812-9900-1122</li>
              <li>Email: info@gpdimelatidepok.org</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Layanan Digital</h4>
            <ul className="text-sm space-y-2">
              <li><Link to="/" className="hover:text-gold text-text-light">Pendaftaran Jemaat Baru</Link></li>
              <li><Link to="/" className="hover:text-gold text-text-light">Permohonan Doa</Link></li>
              <li><Link to="/warta" className="hover:text-gold text-text-light">Warta Digital</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Admin</h4>
            <Link to="/admin/login" className="text-sm text-gold hover:text-white underline">Login Pengurus</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-navy-light text-sm text-center text-text-muted">
          &copy; {new Date().getFullYear()} GPdI Melati Depok. Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>

      {/* Chatbot AI */}
      <ChatbotWidget />
    </div>
  );
}
