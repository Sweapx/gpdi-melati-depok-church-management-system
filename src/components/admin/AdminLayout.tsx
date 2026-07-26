import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Settings, MessageSquare, Heart, LogOut, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/jemaat', label: 'Data Jemaat', icon: Users },
  { path: '/admin/approvals', label: 'Approvals', icon: CheckSquare },
  { path: '/admin/cms', label: 'CMS', icon: Settings },
  { path: '/admin/kb', label: 'AI Knowledge', icon: MessageSquare },
  { path: '/admin/prayers', label: 'Prayers', icon: Heart },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch('/api/registrations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPendingCount(data.data.filter((r: any) => r.status === 'Pending').length);
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-sand text-navy font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-sand flex flex-col flex-shrink-0 border-r border-navy-light">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2 text-white">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm text-navy">G</div>
            <span className="font-bold text-lg tracking-wide">Admin Portal</span>
          </div>
          <p className="text-[10px] text-text-light font-bold uppercase tracking-widest ml-11">GPdI Melati Depok</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => clsx(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm tracking-wide",
                isActive 
                  ? "bg-gold text-navy shadow-md shadow-gold/20" 
                  : "hover:bg-navy-light text-sand-dark hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
              {item.path === '/admin/approvals' && pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-light space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-light hover:bg-navy-light hover:text-white transition-all tracking-wide"
          >
            <ArrowLeft size={18} />
            Public Web
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-navy-light hover:text-rose-300 transition-all tracking-wide"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-sand-dark relative">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
