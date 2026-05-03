import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProjects } from '../hooks/useProjects';
import { Plus, Activity, Cpu, Code2, Loader2, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const user = useAuthStore(state => state.user);
  const { getProjects, isLoading } = useProjects();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
  }, []);

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
        <p className="text-white/50">{isEn ? "Loading dashboard..." : "Cargando tablero..."}</p>
      </div>
    );
  }

  const stats = [
    { label: isEn ? 'Active Projects' : 'Proyectos Activos', value: (projects?.length || 0).toString(), icon: Activity },
    { label: isEn ? 'API Calls' : 'Llamadas API', value: '24.5k', icon: Cpu },
    { label: isEn ? 'Lines Generated' : 'Líneas Generadas', value: '142k', icon: Code2 },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12 px-2 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-center md:text-left">
            {isEn ? `Welcome back, ${user?.name?.split(' ')[0]}` : `Bienvenido, ${user?.name?.split(' ')[0]}`}
          </h1>
          <p className="text-white/50 text-sm md:text-base text-center md:text-left">
            {isEn ? "Overview of your workspace." : "Resumen de tu espacio."}
          </p>
        </div>
        <Link to="/projects/create" className="btn-primary flex items-center justify-center gap-2 py-3 text-sm">
          <Plus size={18} /> {isEn ? "New Project" : "Nuevo Proyecto"}
        </Link>
      </header>

      {/* Prototype Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] p-px"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 blur-xl opacity-50 animate-pulse" />
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/10 via-transparent to-transparent relative z-10 overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/20 blur-[80px] rounded-full" />

          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 relative z-10 text-center md:text-left">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent/20 flex items-center justify-center text-accent border border-accent/20 backdrop-blur-md">
                <Phone size={32} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-dark" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row items-center gap-2 mb-3">
                <h3 className="text-xl font-bold">
                  {isEn ? "Shared Number" : "Número Compartido"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                  Live
                </span>
              </div>
              <p className="text-xs md:text-sm text-white/70 mb-4 max-w-xl leading-relaxed">
                {isEn
                  ? "All projects share one number. Calls to "
                  : "Todos comparten un número. Las llamadas a "}
                <span className="text-white font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded ml-1 text-[11px] md:text-sm">+1 (978) 344-6298</span>
                {isEn ? " use the " : " usan el "}
                <span className="text-emerald-400 font-bold uppercase text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{isEn ? "Active" : "Activo"}</span>
                {isEn ? " config." : " proyecto."}
              </p>
            </div>

            <Link
              to="/projects"
              className="w-full md:w-auto btn-secondary text-xs md:text-sm px-6 py-3 h-fit whitespace-nowrap"
            >
              {isEn ? "Manage Projects" : "Gestionar Proyectos"}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`glass p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-5 relative overflow-hidden group border border-white/5 ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}
          >
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-accent/20 group-hover:text-accent transition-all duration-300 relative z-10">
              <stat.icon size={20} md:size={26} strokeWidth={1.5} />
            </div>
            <div className="relative z-10 text-center md:text-left">
              <p className="text-white/40 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5 group-hover:text-white/60 transition-colors">{stat.label}</p>
              <p className="text-xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <Activity size={18} />
            </div>
            {isEn ? "Recent Activity" : "Actividad"}
          </h2>
          {projects.length > 0 && (
            <Link to="/projects" className="text-xs md:text-sm font-medium text-accent hover:text-white transition-colors">
              {isEn ? "View All" : "Ver Todos"}
            </Link>
          )}
        </div>

        <div className="relative z-10">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/50 text-sm mb-6">
                {isEn ? "Create your first project to start." : "Crea tu primer proyecto para empezar."}
              </p>
              <Link to="/projects/create" className="btn-secondary py-2 text-sm inline-flex items-center gap-2">
                <Plus size={16} /> {isEn ? "Create Project" : "Crear Proyecto"}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((project, i) => (
                <motion.div
                  key={project.uid || project._id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to={`/projects/${project.uid || project._id}`}
                    className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-dark border border-white/10 flex items-center justify-center font-bold text-base text-white group-hover:text-accent group-hover:border-accent/30 transition-all">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm md:text-lg mb-0.5 truncate group-hover:text-accent transition-colors">{project.name}</p>
                        <span className="text-[10px] md:text-xs font-medium text-white/30 px-2 py-0.5 rounded bg-white/5">
                          {project.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {project.isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] hidden sm:block" />
                      )}
                      <ArrowRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
