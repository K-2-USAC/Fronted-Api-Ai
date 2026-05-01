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

const ProjectDetails = () => {
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
      setError('Invalid Project ID');
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
      setError(err.message || 'Failed to load project details');
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
        <p className="text-white/50 animate-pulse">Analyzing project data...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-400">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-white/50 mb-8">{error || 'Project not found'}</p>
        <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{project.name}</h1>
            <p className="text-white/50">Analytics and call history for this project.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={calls.length === 0 && !selectedCall}
            className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-30"
          >
            <FileText size={18} /> Export PDF Summary
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Calls', value: stats.total, icon: PhoneCall, color: 'text-accent' },
          { label: 'Completed', value: stats.completed, icon: Activity, color: 'text-emerald-400' },
          { label: 'Failed', value: stats.failed, icon: AlertCircle, color: 'text-red-400' },
          { label: 'Avg. Duration', value: stats.avgDuration, icon: Clock, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl border border-white/5"
          >
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Call History List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass rounded-3xl overflow-hidden border border-white/5">
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2">
                <Phone size={18} className="text-accent" /> Call History
              </h2>
              <span className="text-xs text-white/30">{calls.length} recent records</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5">
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Duration</th>
                    <th className="px-6 py-4"></th>
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
                        className={`group cursor-pointer transition-colors ${selectedCall?.callSid === call.callSid ? 'bg-accent/10' : 'hover:bg-white/5'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50 group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                              {call.callerPhone ? call.callerPhone.slice(-2) : '??'}
                            </div>
                            <span className="text-sm font-medium">{call.callerPhone || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm">{new Date(call.startedAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-white/30">{new Date(call.startedAt).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            call.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            call.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {call.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/50">
                          {durationSecs !== null ? `${durationSecs}s` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight size={16} className="text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </td>
                      </tr>
                    );
                  })}
                  {calls.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-white/30 italic">
                        No calls recorded for this project yet.
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
                className="glass rounded-3xl overflow-hidden border border-accent/20 flex flex-col sticky top-24 max-h-[calc(100vh-120px)] shadow-2xl"
              >
                <div className="p-6 border-b border-white/10 bg-accent/5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold">Call Insights</h3>
                    <button onClick={() => setSelectedCall(null)} className="text-white/30 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs">
                      <Calendar size={14} className="text-accent" />
                      <span className="text-white/60">{new Date(selectedCall.startedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Clock size={14} className="text-accent" />
                      <span className="text-white/60">
                        Duration: {selectedCall.endedAt 
                          ? `${Math.round((new Date(selectedCall.endedAt) - new Date(selectedCall.startedAt)) / 1000)}s` 
                          : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Transcript</p>
                  
                  {selectedCall.messages && selectedCall.messages.length > 0 ? (
                    selectedCall.messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                          msg.role === 'user' 
                            ? 'bg-white/5 border border-white/10 rounded-tr-none' 
                            : 'bg-accent/10 border border-accent/20 text-accent-foreground rounded-tl-none'
                        }`}>
                          <div className="flex items-center gap-1.5 mb-1 opacity-50">
                            {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                            <span className="uppercase text-[8px] font-bold tracking-tighter">
                              {msg.role === 'user' ? 'Customer' : 'AI Agent'}
                            </span>
                          </div>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs text-white/20 italic">No transcript available for this call.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/10 bg-white/5">
                  <button className="w-full btn-secondary text-xs flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10">
                    <Trash2 size={14} /> Delete Record
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-3xl p-8 border border-white/5 border-dashed text-center flex flex-col items-center justify-center h-64 opacity-50">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-white/20" />
                </div>
                <p className="text-sm font-medium">Select a call</p>
                <p className="text-xs text-white/30">View detailed transcript and AI interaction</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

