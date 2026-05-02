import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Folder, User, LogOut, Menu, X, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Projects', path: '/projects', icon: Folder },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-dark">
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className={`fixed md:relative z-50 h-screen glass border-r border-white/10 flex flex-col transition-all duration-300 ${!isSidebarOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0 justify-between">
          {(isSidebarOpen || window.innerWidth < 768) && (
            <Link to="/dashboard" className="text-xl font-bold tracking-tighter truncate">
              Vox<span className="text-accent">2K</span>
            </Link>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block text-white/50 hover:text-white">
            <Menu size={20} />
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/dashboard' || location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-accent/20 text-accent font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title={item.name}
              >
                <item.icon size={20} className="shrink-0" />
                <span className={`whitespace-nowrap transition-opacity duration-300 ${!isSidebarOpen ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <Link
            to="/projects/create"
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mb-4 group"
            title="Create Project"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span className={`whitespace-nowrap ${!isSidebarOpen ? 'md:hidden' : ''}`}>New Project</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${!isSidebarOpen ? 'md:hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="md:hidden h-20 glass border-b border-white/10 flex items-center px-6 sticky top-0 z-30 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white/50 hover:text-white">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-lg">Vox2K</span>
        </div>

        <div className="flex-1 p-6 md:p-10 relative z-10 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            key={location.pathname}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
