import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import { useLanguage } from "../context/LanguageContext";

const Register = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register({
        name,
        surname,
        phone,
        email,
        password,
      });

      // If the API returns a token, we are logged in
      if (response.token) {
        navigate("/dashboard");
      } else {
        // If no token, registration was successful but we need to log in manually
        navigate("/login", {
          state: { message: isEn ? "Registration successful! Please log in." : "¡Registro exitoso! Por favor inicia sesión." },
        });
      }
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <div className="glass p-8 md:p-12 rounded-3xl w-full border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/30 blur-[80px] rounded-full pointer-events-none" />

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {isEn ? "Create an account" : "Crear una cuenta"}
        </h1>
        <p className="text-white/50">
          {isEn ? "The future of AI call centers" : "El futuro de los call centers con IA"}
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
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              {isEn ? "First Name" : "Nombre"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              {isEn ? "Surname" : "Apellido"}
            </label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="input-field"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            {isEn ? "Phone Number" : "Número de Teléfono"}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            placeholder="+1 (555) 000-0000"
            required
          />
        </div>

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
          <label className="block text-sm font-medium text-white/70 mb-2">
            {isEn ? "Password" : "Contraseña"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full mt-4 h-12 flex items-center justify-center"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full"
            />
          ) : (
            isEn ? "Create Account" : "Crear Cuenta"
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
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            shape="rectangular"
            size="large"
            text="signup_with"
          />
        </div>

        <p className="text-center text-sm text-white/50 mt-4">
          {isEn ? "Already have an account?" : "¿Ya tienes una cuenta?"}{" "}
          <Link
            to="/login"
            className="text-white hover:text-accent transition-colors"
          >
            {isEn ? "Sign in" : "Inicia sesión"}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
