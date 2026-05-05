import { memo, useCallback, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useLanguage } from "../context/LanguageContext";

const GoogleLoginButton = memo(function GoogleLoginButton({
  onSuccess,
  onError,
}) {
  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      theme="filled_black"
      shape="rectangular"
      size="large"
      text="continue_with"
    />
  );
});

const Login = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google login failed:", err);
    }
  }, [loginWithGoogle, navigate]);

  const handleGoogleError = useCallback(() => {
    console.error("Google Login Failed");
  }, []);

  return (
    <div className="glass p-8 md:p-12 rounded-3xl w-full border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/30 blur-[80px] rounded-full pointer-events-none" />

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {isEn ? "Welcome back" : "Bienvenido de nuevo"}
        </h1>
        <p className="text-white/50">
          {isEn ? "Sign in to your account to continue" : "Inicia sesión en tu cuenta para continuar"}
        </p>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl"
          >
            {error}
          </motion.div>
        )}
        {successMessage && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl"
          >
            {successMessage}
          </motion.div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 relative z-10"
      >
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            {isEn ? "Email" : "Correo Electrónico"}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white/70">
              {isEn ? "Password" : "Contraseña"}
            </label>
            <Link
              to="/forgot-password"
              title={isEn ? "Click here to reset your password" : "Haz clic aquí para restablecer tu contraseña"}
              className="text-xs text-accent hover:underline"
            >
              {isEn ? "Forgot?" : "¿Olvidaste?"}
            </Link>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full mt-4 h-12 flex items-center justify-center relative overflow-hidden"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full"
            />
          ) : (
            isEn ? "Sign In" : "Iniciar Sesión"
          )}
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-white/30 text-xs">
            {isEn ? "OR CONTINUE WITH" : "O CONTINÚA CON"}
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <div className="flex justify-center w-full">
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        <p className="text-center text-sm text-white/50 mt-4">
          {isEn ? "Don't have an account?" : "¿No tienes una cuenta?"}{" "}
          <Link
            to="/register"
            className="text-white hover:text-accent transition-colors"
          >
            {isEn ? "Sign up" : "Regístrate"}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
