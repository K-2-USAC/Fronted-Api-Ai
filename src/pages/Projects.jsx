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
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === 'admin';
  const { getProjects, updateProject, deleteProject, isLoading, error } = useProjects();
  
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
      setSuccessMessage('Project deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
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
      setSuccessMessage('Project updated successfully');
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
        <p className="text-white/50">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            {isAdmin ? 'All Projects' : 'My Projects'}
          </h1>
          <p className="text-white/50">
            {isAdmin ? 'System administration and support dashboard.' : 'Manage your generated applications.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={isAdmin ? "Search by project or user..." : "Search projects..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
            />
          </div>
          <Link to="/projects/create" className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
            <Plus size={18} /> New Project
          </Link>
        </div>
      </header>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3"
        >
          <CheckCircle2 size={20} />
          {successMessage}
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
        >
          <AlertCircle size={20} />
          {error}
        </motion.div>
      )}

      {projects.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center mt-4 border border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/30 border border-white/10">
            <Layout size={40} />
          </div>
          <h2 className="text-2xl font-semibold mb-3">
            {searchTerm ? 'No matches found' : 'No projects found'}
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
            {searchTerm 
              ? `We couldn't find any projects matching "${searchTerm}". Try a different search term.` 
              : "You haven't generated any projects yet. Start by creating a new AI-powered application."}
          </p>
          {!searchTerm && (
            <Link to="/projects/create" className="btn-primary inline-flex items-center justify-center gap-2">
              <Plus size={18} /> Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.uid || project._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass p-6 rounded-2xl group flex flex-col h-full border border-white/10 hover:border-accent/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/40 to-accent/10 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingProject({ ...project })}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    title="Edit project"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => setIsDeleting(project.uid || project._id)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">{project.name}</h3>
              <p className="text-white/50 text-sm line-clamp-2 mb-4 flex-grow">{project.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-white/40 mb-6">
                <span className="px-2 py-1 rounded bg-white/5 flex items-center gap-1">
                  <Box size={12} /> {project.type}
                </span>
                <span className="px-2 py-1 rounded bg-white/5 uppercase">
                  {project.language}
                </span>
                {isAdmin && project.user && (
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent flex items-center gap-1 ml-auto">
                    <UserIcon size={12} /> {project.user.name}
                  </span>
                )}
              </div>
              
              <div className="border-t border-white/10 pt-4 flex items-center justify-between mt-auto">
                <span className="text-[10px] text-white/30 italic">
                  ID: {(project.uid || project._id).substring(0, 8)}...
                </span>
                <Link 
                  to={`/projects/${project.uid || project._id}`}
                  className="flex items-center gap-1 text-sm text-accent hover:text-white transition-colors font-medium"
                >
                  Details <ExternalLink size={14} />
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
                  <h3 className="text-xl font-bold">Edit Project</h3>
                  <p className="text-xs text-white/40">Modify all aspects of your AI application.</p>
                </div>
                <button onClick={() => setEditingProject(null)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Basic Section */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">Project Name</label>
                      <input 
                        type="text" 
                        value={editingProject.name}
                        onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                        className="input-field py-2"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">Business Type</label>
                      <select 
                        value={editingProject.type}
                        onChange={(e) => setEditingProject({...editingProject, type: e.target.value})}
                        className="input-field py-2"
                      >
                        <option value="Restaurante">Restaurante</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Tienda">Tienda</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50 ml-1">Short Description</label>
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
                  <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">AI Configuration</h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50 ml-1">Context & Instructions</label>
                    <textarea 
                      value={editingProject.context || ''}
                      onChange={(e) => setEditingProject({...editingProject, context: e.target.value})}
                      className="input-field py-2 min-h-[100px] resize-none"
                      placeholder="e.g. Vendemos pizzas artesanales hechas en horno de leña..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">Voice Tone</label>
                      <select 
                        value={editingProject.voiceTone || 'Profesional'}
                        onChange={(e) => setEditingProject({...editingProject, voiceTone: e.target.value})}
                        className="input-field py-2"
                      >
                        <option value="Formal">Formal</option>
                        <option value="Amigable">Amigable</option>
                        <option value="Profesional">Profesional</option>
                        <option value="Casual">Casual</option>
                        <option value="Persuasivo">Persuasivo</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">Language</label>
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
                      <label className="text-xs font-medium text-white/50 ml-1">Agent ID</label>
                      <input 
                        type="text" 
                        value={editingProject.agentId || ''}
                        onChange={(e) => setEditingProject({...editingProject, agentId: e.target.value})}
                        className="input-field py-2"
                        placeholder="agente-123"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">Target Audience</label>
                      <input 
                        type="text" 
                        value={editingProject.targetAudience || ''}
                        onChange={(e) => setEditingProject({...editingProject, targetAudience: e.target.value})}
                        className="input-field py-2"
                        placeholder="e.g. Familias y jóvenes"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 ml-1">Business Hours</label>
                      <input 
                        type="text" 
                        value={editingProject.businessHours || ''}
                        onChange={(e) => setEditingProject({...editingProject, businessHours: e.target.value})}
                        className="input-field py-2"
                        placeholder="e.g. Lun-Dom 12pm-10pm"
                      />
                    </div>
                  </div>
                </section>

                {/* Knowledge Base Section */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">Knowledge Base</h4>
                    <button 
                      type="button" 
                      onClick={() => setEditingProject({...editingProject, knowledgeBase: [...(editingProject.knowledgeBase || []), '']})}
                      className="text-accent hover:text-white text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> Add Info
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
                      <p className="text-xs text-white/20 italic text-center py-2">No knowledge base entries yet.</p>
                    )}
                  </div>
                </section>

                {/* FAQs Section */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">FAQs</h4>
                    <button 
                      type="button" 
                      onClick={() => setEditingProject({...editingProject, faqs: [...(editingProject.faqs || []), {question: '', answer: ''}]})}
                      className="text-accent hover:text-white text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> Add FAQ
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
                          <label className="text-[10px] font-medium text-white/30 ml-1">Question</label>
                          <input 
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const newFaqs = [...editingProject.faqs];
                              newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                              setEditingProject({...editingProject, faqs: newFaqs});
                            }}
                            className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 placeholder:text-white/20"
                            placeholder="e.g. ¿Tienen parqueo?"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-white/30 ml-1">Answer</label>
                          <input 
                            type="text"
                            value={faq.answer}
                            onChange={(e) => {
                              const newFaqs = [...editingProject.faqs];
                              newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                              setEditingProject({...editingProject, faqs: newFaqs});
                            }}
                            className="bg-transparent border-none p-0 text-xs w-full focus:ring-0 text-white/60 placeholder:text-white/10"
                            placeholder="e.g. Sí, contamos con parqueo privado gratuito..."
                          />
                        </div>
                      </div>
                    ))}
                    {(!editingProject.faqs || editingProject.faqs.length === 0) && (
                      <p className="text-xs text-white/20 italic text-center py-2">No FAQs added yet.</p>
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
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={handleUpdate}
                  disabled={actionLoading}
                  className="btn-primary flex-[2] flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save All Changes
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
              <h3 className="text-xl font-bold mb-2">Delete Project?</h3>
              <p className="text-white/50 mb-8">
                This action cannot be undone. All associated data will be removed from your active dashboard.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleting(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(isDeleting)}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2.5 rounded-xl flex-1 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Delete'}
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

