import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Sparkles } from "lucide-react";

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const templates = [
    {
      name: "Respuestas Inteligentes",
      desc: "Automatización avanzada para consultas frecuentes con lenguaje natural.",
      icon: Zap,
    },
    {
      name: "Análisis Predictivo",
      desc: "Anticípate a las necesidades del cliente con modelos de IA avanzados.",
      icon: Sparkles,
    },
    {
      name: "Seguridad de Grado Empresarial",
      desc: "Encriptación de extremo a extremo en cada interacción.",
      icon: Shield,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center pt-20 pb-32 px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center mt-12 md:mt-24"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-accent"
        >
          <Sparkles size={16} />
          <span>Presentando Vox2k: El Call Center del Futuro</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] mb-12"
        >
          Conversaciones <span className="text-white/40 block md:inline">inteligentes</span>
          <br />a la velocidad de <span className="text-accent relative inline-block">
            2k
            <span className="absolute -inset-1 bg-accent/20 blur-xl rounded-full -z-10 animate-pulse" />
          </span>.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Transformamos la atención al cliente. Vox2k utiliza modelos avanzados
          de IA para ofrecer respuestas precisas, humanas y eficientes en cada
          llamada.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            Empezar Ahora <ArrowRight size={18} />
          </Link>
          <a href="#features" className="btn-secondary w-full sm:w-auto text-center">
            Ver Funcionalidades
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        id="features"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-6xl w-full mx-auto mt-32"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Potencia tu Call Center
          </h2>
          <p className="text-white/50">
            Nuestra IA genera interacciones de nivel empresarial desde el primer
            segundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="glass p-8 rounded-3xl group cursor-pointer hover:bg-white/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <tpl.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{tpl.name}</h3>
              <p className="text-white/50 leading-relaxed">{tpl.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
