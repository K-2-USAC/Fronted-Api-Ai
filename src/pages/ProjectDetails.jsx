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
    <div className="flex flex-col gap-8 pb-20 px-2 md:px-0">
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <Link to="/projects" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
              {project.name}
            </h1>
            <p className="text-white/50 text-xs md:text-base">
              {isEn ? "Analytics and call history." : "Analítica e historial."}
            </p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <button 
            onClick={handleExportPDF}
            disabled={calls.length === 0 && !selectedCall}
            className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 text-xs md:text-sm disabled:opacity-30 py-2.5 md:py-3"
          >
            <FileText size={16} md:size={18} /> {isEn ? "Export PDF" : "Exportar PDF"}
          </button>
        </div>
      </header>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: isEn ? 'Total Calls' : 'Llamadas', value: stats.total, icon: PhoneCall, color: 'text-accent', bg: 'bg-accent/20', border: 'group-hover:border-accent/30' },
          { label: isEn ? 'Completed' : 'Completas', value: stats.completed, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'group-hover:border-emerald-500/30' },
          { label: isEn ? 'Failed' : 'Fallidas', value: stats.failed, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'group-hover:border-red-500/30' },
          { label: isEn ? 'Duration' : 'Duración', value: stats.avgDuration, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'group-hover:border-purple-500/30' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`glass p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col relative overflow-hidden group border border-white/5 transition-all duration-500 ${stat.border}`}
          >
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 relative z-10 ${stat.bg} ${stat.color}`}>
              <stat.icon size={16} md:size={22} strokeWidth={2} />
            </div>
            <div className="relative z-10">
              <p className="text-white/40 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Call History List Premium */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 relative">
            <div className="p-6 md:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                  <Phone size={18} md:size={20} />
                </div>
                {isEn ? "Call History" : "Historial"}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 w-fit">
                {calls.length} {isEn ? "records" : "registros"}
              </span>
            </div>
            
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left border-collapse min-w-[500px] md:min-w-0">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 md:px-8 py-4 font-bold">{isEn ? "Customer" : "Cliente"}</th>
                    <th className="px-6 md:px-8 py-4 font-bold hidden sm:table-cell">{isEn ? "Date" : "Fecha"}</th>
                    <th className="px-6 md:px-8 py-4 font-bold">{isEn ? "Status" : "Estado"}</th>
                    <th className="px-6 md:px-8 py-4 font-bold hidden md:table-cell">{isEn ? "Duration" : "Duración"}</th>
                    <th className="px-6 md:px-8 py-4"></th>
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
                        <td className="px-6 md:px-8 py-4">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] md:text-xs font-bold text-white/50 group-hover:bg-accent group-hover:text-white transition-all">
                              {call.callerPhone ? call.callerPhone.slice(-2) : '??'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold group-hover:text-accent transition-colors">{call.callerPhone || 'Unknown'}</span>
                              <span className="text-[10px] text-white/40 sm:hidden">{new Date(call.startedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4 hidden sm:table-cell">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white/80">{new Date(call.startedAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-white/40 mt-0.5">{new Date(call.startedAt).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                            call.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            call.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {isEn ? call.status : (
                              call.status === 'completed' ? 'Ok' :
                              call.status === 'active' ? 'Activa' : 'Fail'
                            )}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4 text-sm font-mono text-white/60 hidden md:table-cell">
                          {durationSecs !== null ? `${durationSecs}s` : 'N/A'}
                        </td>
                        <td className="px-6 md:px-8 py-4 text-right">
                          <ChevronRight size={16} className="text-white/20 group-hover:text-white ml-auto" />
                        </td>
                      </tr>
                    );
                  })}
                  {calls.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <p className="text-white/40 text-sm">{isEn ? "No calls recorded." : "No hay llamadas."}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Conversation Details Sidebar / Modal on Mobile */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedCall && (
              <div className="fixed lg:sticky inset-0 lg:top-24 z-[60] lg:z-10 flex items-center justify-center lg:block p-4 lg:p-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedCall(null)}
                  className="absolute inset-0 bg-dark/80 backdrop-blur-sm lg:hidden"
                />
                <motion.div
                  key={selectedCall.callSid}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="glass rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-accent/20 flex flex-col w-full max-w-lg lg:max-w-none max-h-[90vh] lg:max-h-[calc(100vh-120px)] shadow-2xl relative z-10"
                >
                  <div className="p-6 md:p-8 border-b border-white/10 bg-gradient-to-b from-accent/10 to-transparent">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg md:text-xl font-bold">{isEn ? "Call Insights" : "Detalles"}</h3>
                      <button onClick={() => setSelectedCall(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 transition-all">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 text-[10px] md:text-xs bg-dark/30 p-2.5 rounded-xl border border-white/5">
                        <Calendar size={14} className="text-accent" />
                        <span className="text-white/80">{new Date(selectedCall.startedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] md:text-xs bg-dark/30 p-2.5 rounded-xl border border-white/5">
                        <Clock size={14} className="text-purple-400" />
                        <span className="text-white/80 font-mono">
                          {selectedCall.endedAt 
                            ? `${Math.round((new Date(selectedCall.endedAt) - new Date(selectedCall.startedAt)) / 1000)}s` 
                            : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 md:space-y-6 custom-scrollbar">
                    {selectedCall.messages && selectedCall.messages.length > 0 ? (
                      selectedCall.messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[90%] p-3 md:p-4 rounded-2xl text-[13px] md:text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-white/10 border border-white/10 rounded-tr-none' 
                              : 'bg-accent/10 border border-accent/20 text-white rounded-tl-none'
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5 opacity-40">
                              {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                              <span className="uppercase text-[8px] font-bold tracking-widest">
                                {msg.role === 'user' ? (isEn ? 'Customer' : 'Cliente') : (isEn ? 'AI Agent' : 'IA')}
                              </span>
                            </div>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-white/30 text-sm py-10">{isEn ? "No transcript." : "Sin transcripción."}</p>
                    )}
                  </div>

                  <div className="p-4 md:p-6 border-t border-white/10 bg-white/[0.02]">
                    <button className="w-full btn-secondary py-3 text-red-400 text-xs md:text-sm">
                      {isEn ? "Delete Record" : "Eliminar Registro"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
            {!selectedCall && (
              <div className="hidden lg:flex glass rounded-[2rem] p-10 border border-white/5 border-dashed text-center flex-col items-center justify-center h-80 opacity-60">
                <MessageSquare size={32} className="text-white/20 mb-6" />
                <p className="text-lg font-bold mb-2">{isEn ? "Select a call" : "Selecciona una llamada"}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

