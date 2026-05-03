import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../hooks/useProjects';
import { useCalls } from '../hooks/useCalls';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  ArrowLeft, 
  Phone, 
  Clock, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  Activity,
  AlertCircle,
  Loader2,
  PhoneCall,
  User,
  Bot,
  Trash2,
  FileText,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ProjectDetails = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const { id } = useParams();
  const { getProjectById } = useProjects();
  const { getCallsByProject, getCallDetails, deleteCallRecord, isLoading: callsLoading } = useCalls();
  
  const [project, setProject] = useState(null);
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    avgDuration: '0s'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id || id === 'undefined') {
      setError(isEn ? 'Invalid Project ID' : 'ID de Proyecto Inválido');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [projData, callsData] = await Promise.all([
        getProjectById(id),
        getCallsByProject(id)
      ]);
      
      setProject(projData);
      const callList = callsData.data || [];
      setCalls(callList);
      
      // Calculate real stats
      const total = callsData.total || 0;
      const completed = callList.filter(c => c.status === 'completed').length;
      const failed = callList.filter(c => c.status === 'failed').length;
      
      // Calculate average duration
      let totalDuration = 0;
      let callsWithDuration = 0;
      
      callList.forEach(call => {
        if (call.startedAt && call.endedAt) {
          const duration = (new Date(call.endedAt) - new Date(call.startedAt)) / 1000;
          if (duration > 0) {
            totalDuration += duration;
            callsWithDuration++;
          }
        }
      });
      
      const avgSecs = callsWithDuration > 0 ? Math.round(totalDuration / callsWithDuration) : 0;
      const avgDurationStr = avgSecs > 60 
        ? `${Math.floor(avgSecs / 60)}m ${avgSecs % 60}s` 
        : `${avgSecs}s`;
      
      setStats({
        total,
        completed,
        failed,
        avgDuration: avgDurationStr
      });
      
    } catch (err) {
      setError(err.message || (isEn ? 'Failed to load project details' : 'Error al cargar detalles del proyecto'));
    } finally {
      setIsLoading(false);
    }
  }, [id, getProjectById, getCallsByProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCallSelect = async (callSid) => {
    try {
      const details = await getCallDetails(callSid);
      setSelectedCall(details);
    } catch (err) {
      console.error('Error fetching call details:', err);
    }
  };

  const handleExportPDF = () => {
    if (!project || (calls.length === 0 && !selectedCall)) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header - Premium look
    doc.setFillColor(99, 102, 241); // Accent color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('PROJECT ANALYTICS REPORT', 14, 25);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 25, { align: 'right' });
    
    // Project Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(project.name, 14, 55);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Project Type: ${project.type}`, 14, 62);
    doc.text(`Project ID: ${project.uid || project._id}`, 14, 67);
    
    // Stats Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Performance Summary', 14, 80);
    
    const statsData = [
      ['Total Calls', stats.total.toString()],
      ['Completed Calls', stats.completed.toString()],
      ['Failed Calls', stats.failed.toString()],
      ['Avg. Duration', stats.avgDuration]
    ];
    
    doc.autoTable({
      startY: 85,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], fontSize: 11 },
      styles: { cellPadding: 5 }
    });
    
    let currentY = doc.lastAutoTable.finalY + 20;

    // Selected Call Detail (If exists)
    if (selectedCall) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text('Individual Call Detail (Security Audit)', 14, currentY);
      
      const callInfo = [
        ['Call SID', selectedCall.callSid],
        ['Caller', selectedCall.callerPhone || 'Unknown'],
        ['Started At', new Date(selectedCall.startedAt).toLocaleString()],
        ['Status', selectedCall.status],
        ['Duration', selectedCall.endedAt ? `${Math.round((new Date(selectedCall.endedAt) - new Date(selectedCall.startedAt)) / 1000)}s` : 'Active']
      ];
      
      doc.autoTable({
        startY: currentY + 5,
        body: callInfo,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
      });
      
      currentY = doc.lastAutoTable.finalY + 15;
      
      // Transcript
      doc.setFontSize(12);
      doc.text('Conversation Transcript', 14, currentY);
      currentY += 10;
      
      if (selectedCall.messages && selectedCall.messages.length > 0) {
        const transcriptData = selectedCall.messages.map(msg => [
          msg.role === 'user' ? 'CUSTOMER' : 'AI AGENT',
          msg.content
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Role', 'Message']],
          body: transcriptData,
          theme: 'grid',
          headStyles: { fillColor: [71, 85, 105] },
          columnStyles: { 
            0: { width: 30, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
          },
          styles: { fontSize: 9 }
        });
        currentY = doc.lastAutoTable.finalY + 20;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('No transcript available for this call.', 14, currentY);
        currentY += 15;
      }
    }
    
    // Call History Table (only if there's space and no selected call or as a separate section)
    if (!selectedCall) {
        if (currentY > 230) {
            doc.addPage();
            currentY = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Recent Call History', 14, currentY);
        
        const callTableData = calls.map(call => [
        call.callerPhone || 'Unknown',
        new Date(call.startedAt).toLocaleString(),
        call.status,
        call.endedAt ? `${Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000)}s` : 'N/A'
        ]);
        
        doc.autoTable({
        startY: currentY + 5,
        head: [['Caller', 'Date/Time', 'Status', 'Duration']],
        body: callTableData,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105] }
        });
    }
    
    doc.save(`${project.name}_security_report_${new Date().getTime()}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
        <p className="text-white/50 animate-pulse">
          {isEn ? "Analyzing project data..." : "Analizando datos del proyecto..."}
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-400">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isEn ? "Oops! Something went wrong" : "¡Ups! Algo salió mal"}
        </h2>
        <p className="text-white/50 mb-8">{error || (isEn ? 'Project not found' : 'Proyecto no encontrado')}</p>
        <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> {isEn ? "Back to Projects" : "Volver a Proyectos"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <Link to="/projects" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10 hover:border-white/20">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
              {project.name}
            </h1>
            <p className="text-white/50 text-sm md:text-base">
              {isEn ? "Analytics and call history for this project." : "Analítica e historial de llamadas de este proyecto."}
            </p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <button 
            onClick={handleExportPDF}
            disabled={calls.length === 0 && !selectedCall}
            className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-30"
          >
            <FileText size={18} /> {isEn ? "Export PDF Summary" : "Exportar Resumen PDF"}
          </button>
        </div>
      </header>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: isEn ? 'Total Calls' : 'Llamadas Totales', value: stats.total, icon: PhoneCall, color: 'text-accent', bg: 'bg-accent/20', border: 'group-hover:border-accent/30' },
          { label: isEn ? 'Completed' : 'Completadas', value: stats.completed, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'group-hover:border-emerald-500/30' },
          { label: isEn ? 'Failed' : 'Fallidas', value: stats.failed, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'group-hover:border-red-500/30' },
          { label: isEn ? 'Avg. Duration' : 'Duración Promedio', value: stats.avgDuration, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'group-hover:border-purple-500/30' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`glass p-6 rounded-3xl flex flex-col relative overflow-hidden group border border-white/5 transition-all duration-500 ${stat.border}`}
          >
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${stat.bg}`} />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 relative z-10 ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} strokeWidth={2} />
            </div>
            <div className="relative z-10 mt-auto">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1 group-hover:text-white/60 transition-colors">{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Call History List Premium */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass rounded-[2rem] overflow-hidden border border-white/5 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                  <Phone size={20} />
                </div>
                {isEn ? "Call History" : "Historial de Llamadas"}
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                {calls.length} {isEn ? "records" : "registros"}
              </span>
            </div>
            
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5 font-bold">{isEn ? "Customer" : "Cliente"}</th>
                    <th className="px-8 py-5 font-bold">{isEn ? "Date" : "Fecha"}</th>
                    <th className="px-8 py-5 font-bold">{isEn ? "Status" : "Estado"}</th>
                    <th className="px-8 py-5 font-bold">{isEn ? "Duration" : "Duración"}</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {calls.map((call) => {
                    const durationSecs = call.startedAt && call.endedAt 
                      ? Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000)
                      : null;
                      
                    return (
                      <tr 
                        key={call.callSid}
                        onClick={() => handleCallSelect(call.callSid)}
                        className={`group cursor-pointer transition-all duration-300 ${selectedCall?.callSid === call.callSid ? 'bg-accent/10 border-l-2 border-accent' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/50 group-hover:bg-gradient-to-br group-hover:from-accent/40 group-hover:to-accent/10 group-hover:text-white group-hover:border-accent/30 transition-all duration-300">
                              {call.callerPhone ? call.callerPhone.slice(-2) : '??'}
                            </div>
                            <span className="text-sm font-semibold group-hover:text-accent transition-colors">{call.callerPhone || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white/80">{new Date(call.startedAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-white/40 mt-0.5">{new Date(call.startedAt).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            call.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 
                            call.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                            'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                          }`}>
                            {isEn ? call.status : (
                              call.status === 'completed' ? 'Completada' :
                              call.status === 'active' ? 'Activa' : 'Fallida'
                            )}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm font-mono text-white/60">
                          {durationSecs !== null ? `${durationSecs}s` : 'N/A'}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ml-auto group-hover:bg-accent group-hover:text-white transition-all duration-300">
                            <ChevronRight size={16} className="text-white/40 group-hover:text-white" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {calls.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                          <PhoneCall size={24} />
                        </div>
                        <p className="text-white/40 text-sm">{isEn ? "No calls recorded for this project yet." : "No hay llamadas registradas para este proyecto aún."}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Conversation Details Sidebar */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedCall ? (
              <motion.div
                key={selectedCall.callSid}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass rounded-[2rem] overflow-hidden border border-accent/20 flex flex-col sticky top-24 max-h-[calc(100vh-120px)] shadow-2xl relative"
              >
                <div className="absolute -left-20 -top-20 w-40 h-40 bg-accent/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="p-8 border-b border-white/10 bg-gradient-to-b from-accent/10 to-transparent relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold">{isEn ? "Call Insights" : "Detalles de Llamada"}</h3>
                    <button onClick={() => setSelectedCall(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm bg-dark/30 p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                        <Calendar size={16} />
                      </div>
                      <span className="text-white/80 font-medium">{new Date(selectedCall.startedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm bg-dark/30 p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Clock size={16} />
                      </div>
                      <span className="text-white/80 font-medium">
                        {isEn ? "Duration" : "Duración"}: <span className="text-white font-mono">{selectedCall.endedAt 
                          ? `${Math.round((new Date(selectedCall.endedAt) - new Date(selectedCall.startedAt)) / 1000)}s` 
                          : (isEn ? 'Active' : 'Activa')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-white/10 flex-1" />
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                      {isEn ? "Transcript" : "Transcripción"}
                    </p>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                  
                  {selectedCall.messages && selectedCall.messages.length > 0 ? (
                    selectedCall.messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                          msg.role === 'user' 
                            ? 'bg-white/10 border border-white/10 rounded-tr-none' 
                            : 'bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-white rounded-tl-none backdrop-blur-md'
                        }`}>
                          <div className="flex items-center gap-2 mb-2 opacity-60">
                            {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                            <span className="uppercase text-[9px] font-bold tracking-widest">
                              {msg.role === 'user' ? (isEn ? 'Customer' : 'Cliente') : (isEn ? 'AI Agent' : 'Agente IA')}
                            </span>
                          </div>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                        <MessageSquare size={24} />
                      </div>
                      <p className="text-sm text-white/40">
                        {isEn ? "No transcript available for this call." : "No hay transcripción disponible para esta llamada."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-white/10 bg-white/[0.02] relative z-10">
                  <button className="w-full btn-secondary py-3 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30 transition-all">
                    <Trash2 size={16} /> <span className="font-medium">{isEn ? "Delete Record" : "Eliminar Registro"}</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-[2rem] p-10 border border-white/5 border-dashed text-center flex flex-col items-center justify-center h-80 opacity-60 bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <MessageSquare size={32} className="text-white/20" />
                </div>
                <p className="text-lg font-bold mb-2">{isEn ? "Select a call" : "Selecciona una llamada"}</p>
                <p className="text-sm text-white/40 max-w-[200px]">
                  {isEn ? "View detailed transcript and AI interaction" : "Ver transcripción detallada e interacción de IA"}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

