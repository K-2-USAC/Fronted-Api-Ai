import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useUser } from '../hooks/useUser';
import { User, Mail, Shield, Camera, Loader2, Phone, BadgeCheck, AlertCircle } from 'lucide-react';

const Profile = () => {
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const { getUserProfile, updateUserProfile, isLoading, error: apiError } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setFormData({
          name: data.name || '',
          surname: data.surname || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSuccessMessage('');
      const { email, ...updateData } = formData;
      const response = await updateUserProfile(updateData);
      
      if (response.success) {
        updateUser(response.user);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        // Clear message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      surname: user?.surname || '',
      phone: user?.phone || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  if (isLoading && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 w-full pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Profile</h1>
        <p className="text-white/50">Manage your personal information and preferences.</p>
      </header>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3"
        >
          <BadgeCheck size={20} />
          {successMessage}
        </motion.div>
      )}

      {apiError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
        >
          <AlertCircle size={20} />
          {apiError}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-accent/20 to-accent/5 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-dark border-4 border-dark flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 pt-16">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold">{formData.name} {formData.surname}</h2>
              <p className="text-white/50">{formData.email}</p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <User size={16} /> Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="h-12 flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-white/90">
                    {formData.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <User size={16} /> Surname
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={e => setFormData({ ...formData, surname: e.target.value })}
                    className="input-field"
                    placeholder="Enter your surname"
                  />
                ) : (
                  <div className="h-12 flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-white/90">
                    {formData.surname || <span className="text-white/20 italic">Not set</span>}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Mail size={16} /> Email Address
                </label>
                <div className="h-12 flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-white/40 cursor-not-allowed">
                  {formData.email}
                </div>
                <p className="text-[10px] text-white/30 italic">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Phone size={16} /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="h-12 flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-white/90">
                    {formData.phone || <span className="text-white/20 italic">Not set</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Shield size={20} className="text-accent" /> Security
              </h3>
              <button className="btn-secondary text-sm">Change Password</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

