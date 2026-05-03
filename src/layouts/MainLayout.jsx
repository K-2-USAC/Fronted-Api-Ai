import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { Globe, Menu, X } from "lucide-react";

const MainLayout = () => {
  const { lang, toggleLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isEn = lang === 'en';

  const navLinks = [
    { href: "#features", label: isEn ? "Features" : "Funcionalidades" },
    { href: "#pricing", label: isEn ? "Pricing" : "Precios" },
    { href: "#about", label: isEn ? "About" : "Nosotros" },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link to="/" onClick={closeMenu} className="text-2xl font-bold tracking-tighter">
            Vox<span className="text-accent">2k</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-white/50 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-md border border-white/10"
              title={isEn ? "Switch to Spanish" : "Cambiar a Inglés"}
            >
              <Globe size={14} />
              {isEn ? 'EN' : 'ES'}
            </button>
            
            <div className="hidden sm:flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                {isEn ? "Log in" : "Iniciar Sesión"}
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                {isEn ? "Get Started" : "Empezar"}
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass border-b border-white/10 overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="text-lg font-medium text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="h-px bg-white/10 my-2" />
                <div className="flex flex-col gap-4 sm:hidden">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="text-lg font-medium hover:text-accent transition-colors"
                  >
                    {isEn ? "Log in" : "Iniciar Sesión"}
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={closeMenu}
                    className="btn-primary text-center py-4"
                  >
                    {isEn ? "Get Started" : "Empezar"}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow flex flex-col relative z-10 px-4 md:px-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-grow flex flex-col"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="border-t border-white/10 py-12 px-6 text-center text-sm text-white/50">
        <p>
          {isEn 
            ? `© ${new Date().getFullYear()} Vox2k Intelligence. All rights reserved by Grupo 2k.`
            : `© ${new Date().getFullYear()} Vox2k Intelligence. Todos los derechos reservados por Grupo 2k.`}
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;
