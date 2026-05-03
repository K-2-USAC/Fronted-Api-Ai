import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProjects } from '../hooks/useProjects';
import { Plus, Activity, Cpu, Code2, Loader2 } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass p-6 rounded-2xl flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-white/50 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass p-8 rounded-2xl mt-4">
        <h2 className="text-xl font-semibold mb-6">{isEn ? "Recent Activity" : "Actividad Reciente"}</h2>
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
          <div className="space-y-4">
            {projects.slice(0, 3).map((project, i) => (
              <Link 
                key={project.uid || project._id || i} 
                to={`/projects/${project.uid || project._id}`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-white/50">{project.type}</p>
                  </div>
                </div>
                <div className="text-sm text-white/40">{isEn ? "Just now" : "Ahora mismo"}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
