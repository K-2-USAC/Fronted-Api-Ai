import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <header className="sticky top-0 z-50 glass border-b-0 border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tighter">
            Vox<span className="text-accent">2k</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#features"
              className="text-white/70 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-white/70 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-white/70 hover:text-white transition-colors"
            >
              About
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Log in
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-grow flex flex-col"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="border-t border-white/10 py-12 text-center text-sm text-white/50">
        <p>
          © {new Date().getFullYear()} Vox2k Intelligence. Todos los derechos
          reservados por Grupo 2k.
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;
