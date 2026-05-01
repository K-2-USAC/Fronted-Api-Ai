import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B0C10]">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className="relative inline-block mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent shadow-[0_0_50px_rgba(99,102,241,0.2)]">
            <AlertCircle size={64} />
          </div>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full"
          >
            404
          </motion.div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold tracking-tight mb-4 text-white"
        >
          Lost in Space?
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 mb-10 leading-relaxed"
        >
          The page you're looking for has vanished into the digital void. Don't worry, we can guide you back to safety.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/dashboard" 
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-8"
          >
            <Home size={18} /> Go to Dashboard
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-8"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1, duration: 2 }}
          className="mt-20 text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold"
        >
          Error Code: VOID_NULL_PAGE_404
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
