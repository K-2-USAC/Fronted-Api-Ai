import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useUser } from "../hooks/useUser";
import {
  User,
  Mail,
  Shield,
  Camera,
  Loader2,
  Phone,
  BadgeCheck,
  AlertCircle,
  Fingerprint,
  Eye,
  EyeOff,
  Copy,
  Check,
  Key
} from "lucide-react";
import apiClient from "../api/apiClient";
import { useLanguage } from "../context/LanguageContext";

const Profile = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const {
    getUserProfile,
    updateUserProfile,
    isLoading,
    error: apiError,
  } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showUid, setShowUid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = async () => {
    try {
      setPasswordError('');
      if (!passwordData.oldPassword || !passwordData.newPassword) {
        setPasswordError(isEn ? 'Both passwords are required' : 'Ambas contraseñas son requeridas');
        return;
      }
      if (passwordData.newPassword.length < 8) {
        setPasswordError(isEn ? 'New password must be at least 8 characters' : 'La nueva contraseña debe tener al menos 8 caracteres');
        return;
      }
      
      const userId = user?.uid || user?.id;
      const response = await apiClient.patch(`/user/update-password/${userId}`, passwordData);
      
      if (response.data.success) {
        setSuccessMessage(isEn ? 'Password updated successfully' : 'Contraseña actualizada correctamente');
        setIsChangingPassword(false);
        setPasswordData({ oldPassword: '', newPassword: '' });
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || (isEn ? 'Error updating password' : 'Error al actualizar contraseña'));
    }
  };

  const handleCopyUid = () => {
    const userId = user?.uid || user?.id;
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        updateUser(data); // This will update the store with the full user object including uid
        setFormData({
          name: data.name || "",
          surname: data.surname || "",
          phone: data.phone || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSuccessMessage("");
      const { email, ...updateData } = formData;
      const response = await updateUserProfile(updateData);

      if (response.success) {
        updateUser(response.user);
        setSuccessMessage(isEn ? "Profile updated successfully!" : "¡Perfil actualizado correctamente!");
        setIsEditing(false);
        // Clear message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      surname: user?.surname || "",
      phone: user?.phone || "",
      email: user?.email || "",
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
      <header className="relative pb-6 border-b border-white/5">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
            {isEn ? "Profile" : "Perfil"}
          </h1>
          <p className="text-white/50 text-sm md:text-base">
            {isEn 
              ? "Manage your personal information and account preferences." 
              : "Gestiona tu información personal y preferencias de cuenta."}
          </p>
        </div>
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
        className="glass rounded-[2rem] overflow-hidden border border-white/10 relative"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[100px] pointer-events-none" />
        
        <div className="h-40 bg-gradient-to-r from-accent/30 via-purple-500/20 to-accent/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
          <div className="absolute -bottom-16 left-8 z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-dark border-4 border-dark flex items-center justify-center overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-5xl font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera size={32} className="text-white drop-shadow-lg" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 pt-16">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {formData.name} {formData.surname}
              </h2>
              <p className="text-white/50">{formData.email}</p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button onClick={handleCancel} className="btn-secondary">
                    {isEn ? "Cancel" : "Cancelar"}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isLoading && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {isEn ? "Save Changes" : "Guardar Cambios"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  {isEn ? "Edit Profile" : "Editar Perfil"}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <User size={16} /> {isEn ? "First Name" : "Nombre"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder={isEn ? "Your name" : "Tu nombre"}
                  />
                ) : (
                  <div className="h-12 flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-white/90">
                    {formData.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <User size={16} /> {isEn ? "Surname" : "Apellido"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                    className="input-field"
                    placeholder={isEn ? "Your surname" : "Tu apellido"}
                  />
                ) : (
                  <div className="h-12 flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-white/90">
                    {formData.surname || (
                      <span className="text-white/20 italic">Not set</span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Mail size={16} /> {isEn ? "Email Address" : "Correo Electrónico"}
                </label>
                <div className="h-12 flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-white/40 cursor-not-allowed">
                  {formData.email}
                </div>
                <p className="text-[10px] text-white/30 italic">
                  {isEn ? "Email cannot be changed" : "El correo no se puede cambiar"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Phone size={16} /> {isEn ? "Phone Number" : "Número de Teléfono"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input-field"
                    placeholder={isEn ? "Your phone number" : "Tu número de teléfono"}
                  />
                ) : (
                  <div className="h-12 flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-white/90">
                    {formData.phone || (
                      <span className="text-white/20 italic">Not set</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Shield size={20} className="text-accent" /> {isEn ? "Security & Account" : "Seguridad & Cuenta"}
              </h3>

              {/* UID Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint size={14} /> {isEn ? "Your Unique ID (UID)" : "Tu ID Único (UID)"}
                  </label>
                  <button
                    onClick={() => setShowUid(!showUid)}
                    className="text-xs text-accent hover:text-white transition-colors flex items-center gap-1"
                  >
                    {showUid ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showUid ? (isEn ? "Hide" : "Ocultar") : (isEn ? "Show ID" : "Mostrar ID")}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <code
                    className={`flex-1 p-3 rounded-lg bg-dark/50 border border-white/5 text-sm font-mono transition-all ${showUid ? "text-white" : "text-white/5 blur-sm select-none"}`}
                  >
                    {showUid
                      ? user?.uid || user?.id
                      : "••••••••••••••••••••••••"}
                  </code>
                  <button
                    onClick={handleCopyUid}
                    disabled={!showUid}
                    className={`p-3 rounded-lg transition-all ${copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30"}`}
                    title={isEn ? "Copy UID" : "Copiar UID"}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-white/20 mt-3 italic">
                  {isEn 
                    ? "Use this ID to recover your password if you lose access to your account." 
                    : "Utiliza este ID para recuperar tu contraseña si pierdes el acceso a tu cuenta."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Key size={16} className="text-white/50" />
                  {isEn ? "Change Password" : "Cambiar Contraseña"}
                </h4>
                
                {passwordError && (
                  <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    {passwordError}
                  </div>
                )}

                {isChangingPassword ? (
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder={isEn ? "Current Password" : "Contraseña Actual"}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      className="input-field text-sm h-10"
                    />
                    <input
                      type="password"
                      placeholder={isEn ? "New Password (min. 8 chars)" : "Nueva Contraseña (min. 8 caracteres)"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="input-field text-sm h-10"
                    />
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleChangePassword} className="btn-primary py-2 text-xs flex-1">
                        {isEn ? "Update" : "Actualizar"}
                      </button>
                      <button onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordError('');
                      }} className="btn-secondary py-2 text-xs flex-1">
                        {isEn ? "Cancel" : "Cancelar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setIsChangingPassword(true)} className="btn-secondary text-sm w-full md:w-auto">
                    {isEn ? "Change Password" : "Cambiar Contraseña"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
