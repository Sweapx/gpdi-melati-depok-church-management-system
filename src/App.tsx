import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout.tsx';
import Home from './pages/Home.tsx';
import WartaJemaat from './pages/WartaJemaat.tsx';
import JadwalEvent from './pages/JadwalEvent.tsx';
import Pendaftaran from './pages/Pendaftaran.tsx';
import Layanan from './pages/Layanan.tsx';
import Login from './pages/admin/Login.tsx';
import AdminLayout from './components/admin/AdminLayout.tsx';
import Dashboard from './pages/admin/Dashboard.tsx';
import Jemaat from './pages/admin/Jemaat.tsx';
import Wadah from './pages/admin/Wadah.tsx';
import Rayon from './pages/admin/Rayon.tsx';
import JemaatKeluarMeninggal from './pages/admin/JemaatKeluarMeninggal.tsx';
import UlangTahun from './pages/admin/UlangTahun.tsx';
import Approvals from './pages/admin/Approvals.tsx';
import Cms from './pages/admin/Cms.tsx';
import KnowledgeBase from './pages/admin/KnowledgeBase.tsx';
import Prayers from './pages/admin/Prayers.tsx';

// Simple protected route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jadwal-event" element={<JadwalEvent />} />
          <Route path="/pendaftaran" element={<Pendaftaran />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/warta" element={<WartaJemaat />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="jemaat" element={<Jemaat />} />
          <Route path="wadah" element={<Wadah />} />
          <Route path="rayon" element={<Rayon />} />
          <Route path="jemaat-keluar" element={<JemaatKeluarMeninggal />} />
          <Route path="ulang-tahun" element={<UlangTahun />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="cms" element={<Cms />} />
          <Route path="kb" element={<KnowledgeBase />} />
          <Route path="prayers" element={<Prayers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
