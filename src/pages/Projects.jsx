import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../hooks/useProjects';
import { useAuthStore } from '../store/authStore';
import { 
  Plus, 
  ExternalLink, 
  MoreVertical, 
  Layout, 
  Box, 
  Loader2, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Projects = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === 'admin';
  const { getProjects, updateProject, deleteProject, activateProject, isLoading, error } = useProjects();
  
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); // stores project ID
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProjects = useCallback(async (search = '') => {
    try {
      const data = await getProjects(search);
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  }, [getProjects]);

  // Handle both initial load and debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(searchTerm);
    }, searchTerm ? 500 : 0); // No delay for initial load
    return () => clearTimeout(timer);
  }, [searchTerm, fetchProjects]);

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.uid !== id && p._id !== id));
      setIsDeleting(null);
      setSuccessMessage(isEn ? 'Project deleted successfully' : 'Proyecto eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (id) => {
    setActionLoading(true);
    try {
      await activateProject(id);
      fetchProjects(searchTerm);
      setSuccessMessage(isEn ? 'Project activated successfully' : 'Proyecto activado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Activation failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const id = editingProject.uid || editingProject._id;
      const updated = await updateProject(id, editingProject);
      setProjects(projects.map(p => (p.uid === id || p._id === id) ? updated : p));
      setEditingProject(null);
      setSuccessMessage(isEn ? 'Project updated successfully' : 'Proyecto actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
        <p className="text-white/50">{isEn ? "Loading projects..." : "Cargando proyectos..."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Enhanced Header */}
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
            {isAdmin 
              ? (isEn ? 'All Projects' : 'Todos los Proyectos') 
              : (isEn ? 'My Projects' : 'Mis Proyectos')}
          </h1>
          <p className="text-white/50 text-xs md:text-base">
            {isAdmin 
              ? (isEn ? 'System administration and support dashboard.' : 'Panel de administración y soporte del sistema.') 
              : (isEn ? 'Manage your generated AI applications.' : 'Gestiona tus aplicaciones de IA generadas.')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={isAdmin 
                ? (isEn ? "Search..." : "Buscar...") 
                : (isEn ? "Search projects..." : "Buscar proyectos...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 pl-12 pr-4 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus:bg-white/10 transition-all shadow-inner text-sm"
            />
          </div>
          <Link to="/projects/create" className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap group py-3 text-sm">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
            {isEn ? "New Project" : "Nuevo Proyecto"}
          </Link>
        </div>
      </header>

      {/* Prototype Notice */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-5 md:p-6 rounded-2xl md:rounded-3xl border border-accent/20 bg-gradient-to-r from-accent/10 via-transparent to-transparent flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5 relative overflow-hidden group"
      >
        <div className="absolute right-0 top-0 w-64 h-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-accent/30 to-accent/5 flex items-center justify-center text-accent flex-shrink-0 border border-accent/10 backdrop-blur-md">
          <Phone size={20} className="md:size-6" />
        </div>
        <div className="flex-1 relative z-10">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold bg-accent/20 text-accent uppercase tracking-widest">
              Prototype Mode
            </span>
            <p className="text-xs md:text-sm font-bold text-white tracking-wide">
              {isEn ? "Shared Active Number" : "Número Activo Compartido"}
            </p>
          </div>
          <p className="text-[11px] md:text-sm text-white/70 leading-relaxed max-w-3xl">
            {isEn 
              ? "All share one number. Calls to " 
              : "Todos comparten un único número. Las llamadas a "}
            <span className="text-white font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded ml-1">+1 (978) 344-6298</span>
            {isEn 
              ? " will use the "
              : " usarán el "}
            <span className="text-emerald-400 font-bold uppercase text-[9px] md:text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{isEn ? "Active" : "Activo"}</span>
            {isEn ? " project." : " proyecto."}
          </p>
        </div>
      </motion.div>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
        >
          <CheckCircle2 size={18} />
          {successMessage}
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {projects.length === 0 ? (
        <div className="glass p-8 md:p-12 rounded-3xl text-center mt-4 border border-white/5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/30 border border-white/10">
            <Layout size={32} className="md:size-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            {searchTerm 
              ? (isEn ? 'No matches found' : 'No se encontraron coincidencias') 
              : (isEn ? 'No projects found' : 'No se encontraron proyectos')}
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            {searchTerm 
              ? (isEn 
                  ? `We couldn't find any projects matching "${searchTerm}".` 
                  : `No pudimos encontrar proyectos que coincidan con "${searchTerm}".`)
              : (isEn 
                  ? "You haven't generated any projects yet."
                  : "Aún no has generado ningún proyecto.")}
          </p>
          {!searchTerm && (
            <Link to="/projects/create" className="btn-primary inline-flex items-center justify-center gap-2 py-3 text-sm">
              <Plus size={18} /> {isEn ? "Create first project" : "Crea tu primer proyecto"}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.uid || project._id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className={`glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] group flex flex-col h-full border ${project.isActive ? 'border-accent/40 shadow-[0_0_30px_rgba(99,102,241,0.15)] bg-accent/[0.02]' : 'border-white/5 hover:border-white/20 hover:bg-white/[0.02]'} transition-all duration-500 relative overflow-hidden`}
            >
              {/* Dynamic Background */}
              <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[60px] pointer-events-none transition-colors duration-700 ${project.isActive ? 'bg-accent/30' : 'bg-white/5 group-hover:bg-accent/10'}`} />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex gap-3 md:gap-4 items-center">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-bold text-lg transition-all duration-500 ${project.isActive ? 'bg-gradient-to-br from-accent to-accent/50 shadow-lg shadow-accent/30' : 'bg-gradient-to-br from-white/10 to-transparent border border-white/10 group-hover:border-accent/30'}`}>
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  {project.isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold bg-white/5 text-white/40 border border-white/10 uppercase tracking-wider">
                      Inactive
                    </span>
                  )}
                </div>
                
                {/* Actions - Visible on mobile or hover on desktop */}
                <div className="flex gap-1 md:gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                  {!project.isActive && (
                    <button 
                      onClick={() => handleActivate(project.uid || project._id)}
                      className="p-2 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg md:rounded-xl transition-all"
                      title="Set as Active"
                    >
                      <CheckCircle2 size={16} md:size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => setEditingProject({ ...project })}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg md:rounded-xl transition-all"
                    title="Edit project"
                  >
                    <Edit2 size={16} md:size={18} />
                  </button>
                  <button 
                    onClick={() => setIsDeleting(project.uid || project._id)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all"
                    title="Delete project"
                  >
                    <Trash2 size={16} md:size={18} />
                  </button>
                </div>
              </div>
              
              <div className="relative z-10 flex-grow">
                <h3 className={`text-xl md:text-2xl font-bold mb-2 md:mb-3 transition-colors ${project.isActive ? 'text-white' : 'group-hover:text-accent'}`}>{project.name}</h3>
                <p className="text-white/60 text-xs md:text-sm line-clamp-3 mb-6 leading-relaxed">{project.description}</p>
                
                <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-[11px] font-semibold text-white/50 mb-8">
                  <span className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
                    <Box size={12} md:size={14} className={project.isActive ? "text-accent" : ""} /> {project.type}
                  </span>
                  <span className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-white/5 border border-white/5 uppercase tracking-wide">
                    {project.language}
                  </span>
                  {isAdmin && project.user && (
                    <span className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center gap-1.5 ml-auto">
                      <UserIcon size={12} md:size={14} /> {project.user.name}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-5 flex items-center justify-between relative z-10 mt-auto">
                <span className="text-[10px] md:text-xs text-white/30 font-mono">
                  {(project.uid || project._id).substring(0, 8)}
                </span>
                <Link 
                  to={`/projects/${project.uid || project._id}`}
                  className={`flex items-center gap-2 text-xs md:text-sm font-semibold transition-all group/link px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl ${project.isActive ? 'bg-accent text-white hover:bg-accent/90 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'}`}
                >
                  {isEn ? "Details" : "Detalles"} 
                  <ExternalLink size={14} md:size={16} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProject(null)}
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-xl font-bold">{isEn ? "Edit Project" : "Editar Proyecto"}</h3>
                  <p className="text-xs text-white/40">
                    {isEn ? "Modify all aspects of your AI application." : "Modifica todos los aspectos de tu aplicación de IA."}
                  </p>
                </div>
                <button onClick={() => setEditingProject(null)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Basic Section */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">
                    {isEn ? "Basic Information" : "Información Básica"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">
                        {isEn ? "Project Name" : "Nombre del Proyecto"}
                      </label>
                      <input 
                        type="text" 
                        value={editingProject.name}
                        onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                        className="input-field py-2"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">
                        {isEn ? "Business Type" : "Tipo de Negocio"}
                      </label>
                      <select 
                        value={editingProject.type}
                        onChange={(e) => setEditingProject({...editingProject, type: e.target.value})}
                        className="input-field py-2"
                      >
                        <option value="Restaurante">{isEn ? "Restaurant" : "Restaurante"}</option>
                        <option value="Hotel">{isEn ? "Hotel" : "Hotel"}</option>
                        <option value="Tienda">{isEn ? "Store" : "Tienda"}</option>
                        <option value="Otro">{isEn ? "Other" : "Otro"}</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50 ml-1">
                      {isEn ? "Short Description" : "Descripción Corta"}
                    </label>
                    <textarea 
                      value={editingProject.description}
                      onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                      className="input-field py-2 min-h-[60px] resize-none"
                      required
                    />
                  </div>
                </section>

                {/* AI Config Section */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">
                    {isEn ? "AI Configuration" : "Configuración de IA"}
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50 ml-1">
                      {isEn ? "Context & Instructions" : "Contexto e Instrucciones"}
                    </label>
                    <textarea 
                      value={editingProject.context || ''}
                      onChange={(e) => setEditingProject({...editingProject, context: e.target.value})}
                      className="input-field py-2 min-h-[100px] resize-none"
                      placeholder={isEn ? "e.g. We sell pizzas..." : "ej. Vendemos pizzas..."}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">
                        {isEn ? "Voice Tone" : "Tono de Voz"}
                      </label>
                      <select 
                        value={editingProject.voiceTone || 'Profesional'}
                        onChange={(e) => setEditingProject({...editingProject, voiceTone: e.target.value})}
                        className="input-field py-2"
                      >
                        <option value="Formal">{isEn ? "Formal" : "Formal"}</option>
                        <option value="Amigable">{isEn ? "Friendly" : "Amigable"}</option>
                        <option value="Profesional">{isEn ? "Professional" : "Profesional"}</option>
                        <option value="Casual">{isEn ? "Casual" : "Casual"}</option>
                        <option value="Persuasivo">{isEn ? "Persuasive" : "Persuasivo"}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">
                        {isEn ? "Language" : "Idioma"}
                      </label>
                      <select 
                        value={editingProject.language || 'es-ES'}
                        onChange={(e) => setEditingProject({...editingProject, language: e.target.value})}
                        className="input-field py-2"
                      >
                        <option value="es-GT">Español (GT)</option>
                        <option value="es-ES">Español (ES)</option>
                        <option value="en-US">English (US)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">
                        {isEn ? "Agent Name" : "Nombre del Agente"}
                      </label>
                      <input 
                        type="text" 
                        value={editingProject.agentId || ''}
                        onChange={(e) => setEditingProject({...editingProject, agentId: e.target.value})}
                        className="input-field py-2"
                        placeholder={isEn ? "agent-123" : "agente-123"}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">
                        {isEn ? "Target Audience" : "Público Objetivo"}
                      </label>
                      <input 
                        type="text" 
                        value={editingProject.targetAudience || ''}
                        onChange={(e) => setEditingProject({...editingProject, targetAudience: e.target.value})}
                        className="input-field py-2"
                        placeholder={isEn ? "e.g. Families" : "ej. Familias"}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">
                        {isEn ? "Business Hours" : "Horarios de Atención"}
                      </label>
                      <input 
                        type="text" 
                        value={editingProject.businessHours || ''}
                        onChange={(e) => setEditingProject({...editingProject, businessHours: e.target.value})}
                        className="input-field py-2"
                        placeholder={isEn ? "e.g. Mon-Sun 12pm-10pm" : "ej. Lun-Dom 12pm-10pm"}
                      />
                    </div>
                  </div>
                </section>

                {/* Knowledge Base Section */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">
                      {isEn ? "Knowledge Base" : "Base de Conocimientos"}
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setEditingProject({...editingProject, knowledgeBase: [...(editingProject.knowledgeBase || []), '']})}
                      className="text-accent hover:text-white text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> {isEn ? "Add Info" : "Agregar Info"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(editingProject.knowledgeBase || []).map((kb, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text"
                          value={kb}
                          onChange={(e) => {
                            const newKB = [...editingProject.knowledgeBase];
                            newKB[index] = e.target.value;
                            setEditingProject({...editingProject, knowledgeBase: newKB});
                          }}
                          className="input-field py-2 flex-1"
                          placeholder="e.g. Aceptamos pagos con cripto..."
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newKB = editingProject.knowledgeBase.filter((_, i) => i !== index);
                            setEditingProject({...editingProject, knowledgeBase: newKB});
                          }}
                          className="p-2 text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {(!editingProject.knowledgeBase || editingProject.knowledgeBase.length === 0) && (
                      <p className="text-xs text-white/20 italic text-center py-2">
                        {isEn ? "No knowledge base entries yet." : "Sin entradas en la base de conocimientos aún."}
                      </p>
                    )}
                  </div>
                </section>

                {/* FAQs Section */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">
                      {isEn ? "FAQs" : "Preguntas Frecuentes"}
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setEditingProject({...editingProject, faqs: [...(editingProject.faqs || []), {question: '', answer: ''}]})}
                      className="text-accent hover:text-white text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> {isEn ? "Add FAQ" : "Agregar FAQ"}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(editingProject.faqs || []).map((faq, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 relative group/faq">
                        <button 
                          type="button"
                          onClick={() => {
                            const newFaqs = editingProject.faqs.filter((_, i) => i !== index);
                            setEditingProject({...editingProject, faqs: newFaqs});
                          }}
                          className="absolute top-2 right-2 p-1 text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover/faq:opacity-100"
                        >
                          <X size={16} />
                        </button>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-white/30 ml-1">
                            {isEn ? "Question" : "Pregunta"}
                          </label>
                          <input 
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const newFaqs = [...editingProject.faqs];
                              newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                              setEditingProject({...editingProject, faqs: newFaqs});
                            }}
                            className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 placeholder:text-white/20"
                            placeholder={isEn ? "e.g. Do you have parking?" : "ej. ¿Tienen parqueo?"}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-white/30 ml-1">
                            {isEn ? "Answer" : "Respuesta"}
                          </label>
                          <input 
                            type="text"
                            value={faq.answer}
                            onChange={(e) => {
                              const newFaqs = [...editingProject.faqs];
                              newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                              setEditingProject({...editingProject, faqs: newFaqs});
                            }}
                            className="bg-transparent border-none p-0 text-xs w-full focus:ring-0 text-white/60 placeholder:text-white/10"
                            placeholder={isEn ? "e.g. Yes..." : "ej. Sí..."}
                          />
                        </div>
                      </div>
                    ))}
                    {(!editingProject.faqs || editingProject.faqs.length === 0) && (
                      <p className="text-xs text-white/20 italic text-center py-2">
                        {isEn ? "No FAQs added yet." : "No se han agregado preguntas aún."}
                      </p>
                    )}
                  </div>
                </section>
              </form>

              <div className="p-6 border-t border-white/10 flex gap-3 bg-white/5">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="btn-secondary flex-1"
                >
                  {isEn ? "Cancel" : "Cancelar"}
                </button>
                <button 
                  type="submit"
                  onClick={handleUpdate}
                  disabled={actionLoading}
                  className="btn-primary flex-[2] flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isEn ? "Save All Changes" : "Guardar Cambios"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleting(null)}
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass border border-red-500/20 rounded-3xl overflow-hidden shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-400">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isEn ? "Delete Project?" : "¿Eliminar Proyecto?"}
              </h3>
              <p className="text-white/50 mb-8">
                {isEn 
                  ? "This action cannot be undone. All associated data will be removed from your active dashboard."
                  : "Esta acción no se puede deshacer. Todos los datos asociados se eliminarán de tu tablero activo."}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleting(null)}
                  className="btn-secondary flex-1"
                >
                  {isEn ? "Cancel" : "Cancelar"}
                </button>
                <button 
                  onClick={() => handleDelete(isDeleting)}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2.5 rounded-xl flex-1 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : (isEn ? 'Delete' : 'Eliminar')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;

