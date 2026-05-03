import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Folder, User, LogOut, Menu, X, Plus, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';

const DashboardLayout = () => {
  const { lang, toggleLanguage } = useLanguage();
  const isEn = lang === 'en';
  // Start with sidebar closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Projects', path: '/projects', icon: Folder },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 h-screen glass border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen 
            ? 'w-[280px] md:w-[240px] translate-x-0' 
            : 'w-[280px] md:w-[80px] -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0 justify-between overflow-hidden">
          <Link to="/dashboard" onClick={closeSidebarOnMobile} className="text-xl font-bold tracking-tighter shrink-0">
            Vox<span className="text-accent">2k</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block text-white/50 hover:text-white shrink-0 ml-auto">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white shrink-0">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/dashboard' || location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebarOnMobile}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-accent/20 text-accent font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title={item.name}
              >
                <item.icon size={20} className="shrink-0" />
                <span className={`whitespace-nowrap transition-opacity duration-300 ${!isSidebarOpen ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
                  {isEn 
                    ? item.name 
                    : (item.name === 'Projects' ? 'Proyectos' : item.name === 'Profile' ? 'Perfil' : item.name)}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <Link
            to="/projects/create"
            onClick={closeSidebarOnMobile}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mb-4 group"
            title={isEn ? "Create Project" : "Crear Proyecto"}
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform shrink-0" />
            <span className={`whitespace-nowrap ${!isSidebarOpen ? 'md:hidden' : ''}`}>
              {isEn ? "New Project" : "Nuevo Proyecto"}
            </span>
          </Link>

          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors mb-2"
            title={isEn ? "Switch to Spanish" : "Cambiar a Inglés"}
          >
            <div className="flex items-center gap-4">
              <Globe size={20} className="shrink-0" />
              <span className={`whitespace-nowrap ${!isSidebarOpen ? 'md:hidden' : ''}`}>{isEn ? 'English' : 'Español'}</span>
            </div>
            <span className={`text-xs font-bold bg-white/10 px-2 py-0.5 rounded ${!isSidebarOpen ? 'md:hidden' : ''}`}>{isEn ? 'EN' : 'ES'}</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
            title={isEn ? "Logout" : "Cerrar Sesión"}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${!isSidebarOpen ? 'md:hidden' : ''}`}>
              {isEn ? "Logout" : "Cerrar Sesión"}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative custom-scrollbar">
        {/* Mobile Header */}
        <header className="md:hidden h-20 glass border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg tracking-tighter">Vox<span className="text-accent">2k</span></span>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
            <User size={20} />
          </Link>
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-10 relative z-10 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
