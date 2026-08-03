import { Outlet, Link } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
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
            <span className="flex items-center gap-1"><Phone size={14} className="text-gold" /> (021) 7521216</span>
          </div>
          <span className="flex items-center gap-1"><MapPin size={14} className="text-gold" /> Jl. Melati No. 8, Depok</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-border-subtle sticky top-0 z-40 h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/gpdi-logo.png" alt="GPdI Melati Depok Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="font-bold text-lg text-navy leading-none tracking-tight">GPdI MELATI DEPOK</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-light font-semibold mt-1">Sistem Manajemen Gereja Digital</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-text-muted hover:text-navy">Beranda</Link>
            <Link to="/jadwal-event" className="text-text-muted hover:text-navy">Jadwal & Event</Link>
            <Link to="/pendaftaran" className="text-text-muted hover:text-navy">Pendaftaran</Link>
            <Link to="/layanan" className="text-text-muted hover:text-navy">Layanan</Link>
            <Link to="/warta" className="text-text-muted hover:text-navy">Warta Digital</Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 font-medium text-slate-600">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Beranda</Link>
            <Link to="/jadwal-event" onClick={() => setMobileMenuOpen(false)}>Jadwal & Event</Link>
            <Link to="/pendaftaran" onClick={() => setMobileMenuOpen(false)}>Pendaftaran</Link>
            <Link to="/layanan" onClick={() => setMobileMenuOpen(false)}>Layanan</Link>
            <Link to="/warta" onClick={() => setMobileMenuOpen(false)}>Warta Digital</Link>
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
              <li>Jl. Melati No. 8, Depok</li>
              <li>Telp: (021) 7521216</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Layanan Digital</h4>
            <ul className="text-sm space-y-2">
              <li><Link to="/" className="hover:text-gold text-text-light">Beranda</Link></li>
              <li><Link to="/jadwal-event" className="hover:text-gold text-text-light">Jadwal & Event</Link></li>
              <li><Link to="/pendaftaran" className="hover:text-gold text-text-light">Pendaftaran</Link></li>
              <li><Link to="/layanan" className="hover:text-gold text-text-light">Layanan</Link></li>
              <li><Link to="/warta" className="hover:text-gold text-text-light">Warta Digital</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Social Media</h4>
            <ul className="text-sm space-y-2">
              <li><a href="https://www.facebook.com/groups/131852930377/about" target="_blank" rel="noopener noreferrer" className="hover:text-gold text-text-light flex items-center gap-2"><Facebook size={16} /> Facebook</a></li>
              <li><a href="https://www.instagram.com/gpdimelatidepok/" target="_blank" rel="noopener noreferrer" className="hover:text-gold text-text-light flex items-center gap-2"><Instagram size={16} /> Instagram</a></li>
              <li><a href="https://www.youtube.com/c/gpdimelatidepok" target="_blank" rel="noopener noreferrer" className="hover:text-gold text-text-light flex items-center gap-2"><Youtube size={16} /> YouTube</a></li>
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
