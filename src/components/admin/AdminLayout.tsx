import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Settings, MessageSquare, Heart, LogOut, ArrowLeft, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/jemaat', label: 'Data Jemaat', icon: Users, hasSubmenu: true },
  { path: '/admin/approvals', label: 'Approvals', icon: CheckSquare, hasSubmenu: true },
  { path: '/admin/cms', label: 'CMS', icon: Settings },
  { path: '/admin/kb', label: 'AI Knowledge', icon: MessageSquare },
  { path: '/admin/prayers', label: 'Prayers', icon: Heart },
];

const jemaatSubmenu = [
  { path: '/admin/jemaat', label: 'Jemaat Aktif' },
  { path: '/admin/wadah', label: 'Wadah' },
  { path: '/admin/rayon', label: 'Rayon' },
  { path: '/admin/jemaat-keluar', label: 'Jemaat Keluar & Meninggal' },
  { path: '/admin/ulang-tahun', label: 'Ulang Tahun' },
];

const approvalsSubmenu = [
  { path: '/admin/approvals', label: 'Pendaftaran Jemaat Baru' },
  { path: '/admin/approvals/event', label: 'Pendaftaran Event' },
  { path: '/admin/approvals/baptisan', label: 'Pendaftaran Baptisan' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [jemaatDropdownOpen, setJemaatDropdownOpen] = useState(false);
  const [approvalsDropdownOpen, setApprovalsDropdownOpen] = useState(false);

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

  const handlePublicWeb = () => {
    window.open('/', '_blank');
  };

  // Check if current path is in jemaat submenu
  const isJemaatSubmenuActive = jemaatSubmenu.some(item => location.pathname === item.path);
  // Check if current path is in approvals submenu
  const isApprovalsSubmenuActive = approvalsSubmenu.some(item => location.pathname === item.path);

  return (
    <div className="flex h-screen bg-sand text-navy font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        "bg-navy text-sand flex flex-col flex-shrink-0 border-r border-navy-light transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div>
              <span className="font-bold text-lg tracking-wide text-white">Admin Portal</span>
              <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">GPdI Melati Depok</p>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-sand-dark hover:text-white transition-colors"
          >
            {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.path}>
              {item.hasSubmenu ? (
                <>
                  {item.path === '/admin/jemaat' ? (
                    <>
                      <button
                        onClick={() => setJemaatDropdownOpen(!jemaatDropdownOpen)}
                        className={clsx(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm tracking-wide",
                          isJemaatSubmenuActive || jemaatDropdownOpen
                            ? "bg-gold text-navy shadow-md shadow-gold/20" 
                            : "hover:bg-navy-light text-sand-dark hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={18} />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          jemaatDropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                        )}
                      </button>
                      
                      {jemaatDropdownOpen && !isSidebarCollapsed && (
                        <div className="ml-8 mt-1 space-y-1">
                          {jemaatSubmenu.map((subItem) => (
                            <NavLink
                              key={subItem.path}
                              to={subItem.path}
                              className={({ isActive }) => clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-bold tracking-wide",
                                isActive 
                                  ? "bg-navy-light text-white" 
                                  : "text-sand-dark hover:bg-navy-light hover:text-white"
                              )}
                            >
                              {subItem.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : item.path === '/admin/approvals' ? (
                    <>
                      <button
                        onClick={() => setApprovalsDropdownOpen(!approvalsDropdownOpen)}
                        className={clsx(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm tracking-wide",
                          isApprovalsSubmenuActive || approvalsDropdownOpen
                            ? "bg-gold text-navy shadow-md shadow-gold/20" 
                            : "hover:bg-navy-light text-sand-dark hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={18} />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          approvalsDropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                        )}
                      </button>
                      
                      {approvalsDropdownOpen && !isSidebarCollapsed && (
                        <div className="ml-8 mt-1 space-y-1">
                          {approvalsSubmenu.map((subItem) => (
                            <NavLink
                              key={subItem.path}
                              to={subItem.path}
                              className={({ isActive }) => clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-bold tracking-wide",
                                isActive 
                                  ? "bg-navy-light text-white" 
                                  : "text-sand-dark hover:bg-navy-light hover:text-white"
                              )}
                            >
                              {subItem.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : null}
                </>
              ) : (
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
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {item.path === '/admin/approvals' && pendingCount > 0 && !isSidebarCollapsed && (
                    <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {pendingCount}
                    </span>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-light space-y-2">
          <button 
            onClick={handlePublicWeb}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-light hover:bg-navy-light hover:text-white transition-all tracking-wide",
              isSidebarCollapsed && "justify-center px-4"
            )}
            title="Public Web"
          >
            <ArrowLeft size={18} />
            {!isSidebarCollapsed && <span>Public Web</span>}
          </button>
          <button 
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-navy-light hover:text-rose-300 transition-all tracking-wide",
              isSidebarCollapsed && "justify-center px-4"
            )}
            title="Logout"
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Logout</span>}
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
