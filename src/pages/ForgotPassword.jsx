import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

const ForgotPassword = () => {
  const [uid, setUid] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // Endpoint: PATCH /user/update-password/:uid
      // Body: { newPassword }
      await apiClient.patch(`/user/update-password/${uid}`, { newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: "Password updated successfully. Please log in." } });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password. Make sure the User ID is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-8 md:p-12 rounded-3xl w-full border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/30 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="mb-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Login
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
            <KeyRound size={20} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
        </div>
        <p className="text-white/50">Enter your User ID and your new credentials.</p>
      </div>

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Success!</h2>
          <p className="text-white/50 mb-6">Your password has been reset. Redirecting you to login...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">User ID (UID)</label>
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              className="input-field"
              placeholder="Enter your unique ID"
              required
            />
            <p className="text-[10px] text-white/30 mt-1 ml-1">Contact your admin if you don't know your ID.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full mt-4 h-12 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
