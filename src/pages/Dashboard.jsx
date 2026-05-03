import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProjects } from '../hooks/useProjects';
import { Plus, Activity, Cpu, Code2, Loader2, Phone } from 'lucide-react';
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            {isEn ? `Welcome back, ${user?.name?.split(' ')[0]}` : `Bienvenido de nuevo, ${user?.name?.split(' ')[0]}`}
          </h1>
          <p className="text-white/50">
            {isEn ? "Here's an overview of your workspace." : "Aquí tienes un resumen de tu espacio de trabajo."}
          </p>
        </div>
        <Link to="/projects/create" className="btn-primary flex items-center justify-center gap-2">
          <Plus size={18} /> {isEn ? "New Project" : "Nuevo Proyecto"}
        </Link>
      </header>

      {/* Prototype Status Card - Premium Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 blur-xl opacity-50 animate-pulse" />
        <div className="glass p-6 md:p-8 rounded-[22px] border border-accent/20 bg-gradient-to-br from-accent/10 via-transparent to-transparent relative z-10 overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/20 blur-[80px] rounded-full group-hover:bg-accent/30 transition-colors duration-700" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 relative z-10">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-accent/40 to-accent/10 flex items-center justify-center text-accent shadow-lg shadow-accent/20 border border-accent/20 backdrop-blur-md">
                <Phone size={32} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-dark flex items-center justify-center animate-bounce">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                  {isEn ? "Prototype Active Number" : "Número Activo del Prototipo"}
                </h3>
                <span className="w-fit px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  System Live
                </span>
              </div>
              <p className="text-sm md:text-base text-white/70 mb-2 max-w-2xl leading-relaxed">
                {isEn
                  ? "You can create multiple projects, but all calls currently route to "
                  : "Puedes crear múltiples proyectos, pero todas las llamadas se dirigen actualmente a "}
                <span className="text-white font-mono font-bold bg-white/10 px-2 py-0.5 rounded-md ml-1">+1 (978) 344-6298</span>
              </p>
              <p className="text-xs text-white/40 italic">
                {isEn
                  ? "The AI uses the logic of whichever project you set as 'Active' in your projects list."
                  : "La IA utiliza la lógica de cualquier proyecto que marques como 'Activo' en tu lista de proyectos."}
              </p>
            </div>

            <Link
              to="/projects"
              className="w-full md:w-auto btn-secondary text-sm px-6 py-3 md:py-4 h-fit whitespace-nowrap group/btn relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isEn ? "Manage Projects" : "Gestionar Proyectos"}
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >→</motion.span>
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass p-6 rounded-3xl flex items-center gap-5 relative overflow-hidden group border border-white/5 hover:border-accent/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/70 group-hover:bg-accent/20 group-hover:text-accent transition-colors duration-300 relative z-10">
              <stat.icon size={26} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1 group-hover:text-white/60 transition-colors">{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors duration-500 pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Recent Activity - Premium List */}
      <div className="glass p-8 rounded-3xl mt-2 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <Activity size={18} />
            </div>
            {isEn ? "Recent Activity" : "Actividad Reciente"}
          </h2>
          {projects.length > 0 && (
            <Link to="/projects" className="text-sm font-medium text-accent hover:text-white transition-colors">
              {isEn ? "View All" : "Ver Todos"}
            </Link>
          )}
        </div>

        <div className="relative z-10">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/30">
                <Activity size={32} />
              </div>
              <h3 className="text-lg font-medium mb-2">{isEn ? "No activity yet" : "Sin actividad aún"}</h3>
              <p className="text-white/50 mb-6 max-w-sm mx-auto">
                {isEn ? "Create your first project to start seeing activity in your dashboard." : "Crea tu primer proyecto para empezar a ver actividad en tu tablero."}
              </p>
              <Link to="/projects/create" className="btn-secondary inline-flex items-center gap-2">
                <Plus size={18} /> {isEn ? "Create Project" : "Crear Proyecto"}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((project, i) => (
                <motion.div
                  key={project.uid || project._id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to={`/projects/${project.uid || project._id}`}
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dark to-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-white group-hover:scale-110 group-hover:border-accent/30 group-hover:text-accent transition-all duration-300 shadow-inner">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-lg mb-0.5 group-hover:text-accent transition-colors">{project.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white/40 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                            {project.type}
                          </span>
                          {project.isActive && (
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-white/30 font-medium bg-dark/50 px-3 py-1.5 rounded-full border border-white/5 group-hover:border-white/10 transition-colors">
                        {isEn ? "Just now" : "Ahora mismo"}
                      </div>
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
