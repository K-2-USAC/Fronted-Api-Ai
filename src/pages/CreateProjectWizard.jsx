import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWizardStore } from "../store/projectStore";
import { useProjects } from "../hooks/useProjects";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Code2,
  Paintbrush,
  Globe,
  CalendarDays,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const steps = [
  { id: 1, title: "Basics", titleEs: "Básico", icon: Code2 },
  { id: 2, title: "Details", titleEs: "Detalles", icon: Globe },
  { id: 3, title: "Style", titleEs: "Estilo", icon: Paintbrush },
  { id: 4, title: "Extras", titleEs: "Extras", icon: CalendarDays },
];

const CreateProjectWizard = () => {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { createProject, error: apiError } = useProjects();
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { wizardData, setWizardData, resetWizard } = useWizardStore();

  // Handle API error
  useEffect(() => {
    if (apiError) setError(apiError);
  }, [apiError]);

  // Cleanup on unmount if not generated
  useEffect(() => {
    return () => {
      // Don't reset if we're just navigating between steps, only on full unmount
    };
  }, []);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step) => {
    setError(null);
    if (step === 1) {
      if (!wizardData.name.trim()) {
        setError(isEn ? "Project name is required" : "El nombre del proyecto es obligatorio");
        return false;
      }
      if (!wizardData.type.trim()) {
        setError(isEn ? "Business type is required" : "El tipo de negocio es obligatorio");
        return false;
      }
    }
    if (step === 2) {
      if (!wizardData.description.trim()) {
        setError(isEn ? "Description is required" : "La descripción es obligatoria");
        return false;
      }
    }
    if (step === 4) {
      if (!wizardData.agentId.trim()) {
        setError(isEn ? "Agent Name is required" : "El Nombre del Agente es obligatorio");
        return false;
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateStep(4)) return;

    setIsGenerating(true);

    try {
      // Real API call to backend POST /projects
      await createProject(wizardData);

      resetWizard();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to generate project:", err);
      setIsGenerating(false);
    }
  };

  const addFaq = () => {
    setWizardData({ faqs: [...wizardData.faqs, { question: "", answer: "" }] });
  };

  const updateFaq = (index, field, value) => {
    const newFaqs = [...wizardData.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setWizardData({ faqs: newFaqs });
  };

  const removeFaq = (index) => {
    if (wizardData.faqs.length <= 1) {
      setWizardData({ faqs: [{ question: "", answer: "" }] });
      return;
    }
    const newFaqs = wizardData.faqs.filter((_, i) => i !== index);
    setWizardData({ faqs: newFaqs });
  };

  const addKB = () => {
    setWizardData({ knowledgeBase: [...wizardData.knowledgeBase, ""] });
  };

  const updateKB = (index, value) => {
    const newKB = [...wizardData.knowledgeBase];
    newKB[index] = value;
    setWizardData({ knowledgeBase: newKB });
  };

  const removeKB = (index) => {
    if (wizardData.knowledgeBase.length <= 1) {
      setWizardData({ knowledgeBase: [""] });
      return;
    }
    const newKB = wizardData.knowledgeBase.filter((_, i) => i !== index);
    setWizardData({ knowledgeBase: newKB });
  };

  if (isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-2 border-accent border-r-2 border-r-transparent"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-4 rounded-full border-b-2 border-purple-500 border-l-2 border-l-transparent"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Code2 size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">{isEn ? "Generating Magic..." : "Generando Magia..."}</h2>
          <p className="text-white/50 max-w-md mx-auto">
            {isEn 
              ? "Our AI is crafting your project architecture, generating styles, and preparing your workspace."
              : "Nuestra IA está diseñando la arquitectura de tu proyecto, generando estilos y preparando tu espacio de trabajo."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-[70vh] px-2 md:px-0 pb-12">
      <div className="mb-12 md:mb-16">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 md:mb-12 text-center md:text-left">
          {isEn ? "Create New Project" : "Crear Proyecto"}
        </h1>

        {/* Progress Bar */}
        <div className="relative flex justify-between px-2">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-white/10 rounded-full z-0" />
          <motion.div
            className="absolute top-5 left-0 h-0.5 bg-accent rounded-full z-0"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />

          {steps.map((step, i) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-accent text-white scale-90"
                      : isCurrent
                        ? "bg-white text-dark shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110"
                        : "bg-dark border border-white/20 text-white/40"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <step.icon size={16} />
                  )}
                </div>
                <span
                  className={`absolute -bottom-7 md:-bottom-8 text-[10px] md:text-xs font-bold whitespace-nowrap transition-colors duration-300 uppercase tracking-widest ${
                    isCurrent ? "text-white" : "text-white/20"
                  } ${isCurrent ? 'block' : 'hidden md:block'}`}
                >
                  {isEn ? step.title : step.titleEs}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 relative glass rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 overflow-hidden border border-white/10 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full flex flex-col"
          >
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm flex items-center gap-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 flex-1">
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    {isEn ? "The basics" : "Lo básico"}
                  </h2>
                  <p className="text-white/50 text-sm md:text-base mb-8">
                    {isEn ? "Tell us what you're building." : "Cuéntanos qué estás construyendo."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-white/70 mb-2">
                      {isEn ? "Project Name" : "Nombre del Proyecto"}
                    </label>
                    <input
                      type="text"
                      value={wizardData.name}
                      onChange={(e) => setWizardData({ name: e.target.value })}
                      className="input-field py-3 text-base"
                      placeholder={isEn ? "e.g. My Project" : "ej. Mi Proyecto"}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-white/70 mb-2">
                      {isEn ? "Business Type" : "Tipo de Negocio"}
                    </label>
                    <div className="relative">
                      <select
                        value={wizardData.type}
                        onChange={(e) => setWizardData({ type: e.target.value })}
                        className="input-field py-3 appearance-none bg-dark text-white cursor-pointer pr-10"
                      >
                        <option value="Restaurante">{isEn ? "Restaurant" : "Restaurante"}</option>
                        <option value="Hotel">{isEn ? "Hotel" : "Hotel"}</option>
                        <option value="Tienda">{isEn ? "Store" : "Tienda"}</option>
                        <option value="Otro">{isEn ? "Other" : "Otro"}</option>
                      </select>
                      <ArrowRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 flex-1">
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    {isEn ? "Project details" : "Detalles"}
                  </h2>
                  <p className="text-white/50 text-sm md:text-base mb-8">
                    {isEn ? "Give us a clear description." : "Danos una descripción clara."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-white/70 mb-2">
                      {isEn ? "Description" : "Descripción"}
                    </label>
                    <textarea
                      value={wizardData.description}
                      onChange={(e) =>
                        setWizardData({ description: e.target.value })
                      }
                      className="input-field min-h-[150px] md:min-h-[120px] resize-none py-3"
                      placeholder={isEn 
                        ? "Describe your business goals..." 
                        : "Describe los objetivos de tu negocio..."}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-white/70 mb-2">
                      {isEn ? "Target Audience (Optional)" : "Público Objetivo"}
                    </label>
                    <input
                      type="text"
                      value={wizardData.targetAudience}
                      onChange={(e) =>
                        setWizardData({ targetAudience: e.target.value })
                      }
                      className="input-field py-3"
                      placeholder={isEn ? "e.g. Students, Professionals" : "ej. Estudiantes, Profesionales"}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 flex-1">
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    {isEn ? "Look & feel" : "Estilo"}
                  </h2>
                  <p className="text-white/50 text-sm md:text-base mb-8">
                    {isEn ? "Define the personality." : "Define la personalidad."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-white/70 mb-4">
                    {isEn ? "Voice Tone" : "Tono de Voz"}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "Formal",
                      "Amigable",
                      "Profesional",
                      "Casual",
                      "Persuasivo",
                    ].map((tone) => (
                      <div
                        key={tone}
                        onClick={() => setWizardData({ voiceTone: tone })}
                        className={`p-3 md:p-4 rounded-xl cursor-pointer border transition-all duration-300 text-center ${
                          wizardData.voiceTone === tone
                            ? "bg-accent/20 border-accent text-white"
                            : "bg-white/5 border-white/10 text-white/40"
                        }`}
                      >
                        <span className="font-bold text-[11px] md:text-sm uppercase tracking-wider">
                          {isEn ? (
                            tone === "Formal" ? "Formal" :
                            tone === "Amigable" ? "Friendly" :
                            tone === "Profesional" ? "Pro" :
                            tone === "Casual" ? "Casual" :
                            tone === "Persuasivo" ? "Persuasive" : tone
                          ) : tone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-white/70 mb-2 mt-4">
                    {isEn ? "Agent Language" : "Idioma"}
                  </label>
                  <div className="relative">
                    <select
                      value={wizardData.language}
                      onChange={(e) =>
                        setWizardData({ language: e.target.value })
                      }
                      className="input-field py-3 appearance-none bg-dark pr-10"
                    >
                      <option value="es-GT">Español (GT)</option>
                      <option value="es-ES">Español (ES)</option>
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                    </select>
                    <ArrowRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/30 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 flex-1">
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    {isEn ? "Final touch" : "Toque final"}
                  </h2>
                  <p className="text-white/50 text-sm md:text-base mb-8">
                    {isEn ? "Complete the setup." : "Completa la configuración."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-white/70 mb-2">
                      {isEn ? "Agent Name" : "Nombre del Agente"}
                    </label>
                    <input
                      type="text"
                      value={wizardData.agentId}
                      onChange={(e) =>
                        setWizardData({ agentId: e.target.value })
                      }
                      className="input-field py-3"
                      placeholder={isEn ? "ej. AI Assistant" : "ej. Asistente IA"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-white/70 mb-2">
                      {isEn ? "Hours" : "Horarios"}
                    </label>
                    <input
                      type="text"
                      value={wizardData.businessHours}
                      onChange={(e) =>
                        setWizardData({ businessHours: e.target.value })
                      }
                      className="input-field py-3"
                      placeholder="9am - 6pm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-white/70 mb-4 flex justify-between items-center">
                    <span>{isEn ? "FAQs" : "Preguntas (FAQs)"}</span>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="text-accent text-xs font-bold flex items-center gap-1"
                    >
                      <Plus size={14} /> {isEn ? "Add" : "Añadir"}
                    </button>
                  </label>

                  <div className="space-y-3 max-h-[150px] md:max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                    {wizardData.faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="flex gap-2 items-start bg-white/5 p-3 rounded-xl border border-white/5"
                      >
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) =>
                              updateFaq(i, "question", e.target.value)
                            }
                            className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 placeholder:text-white/20 font-medium"
                            placeholder={isEn ? "Question" : "Pregunta"}
                          />
                          <input
                            type="text"
                            value={faq.answer}
                            onChange={(e) =>
                              updateFaq(i, "answer", e.target.value)
                            }
                            className="bg-transparent border-none p-0 text-xs w-full focus:ring-0 text-white/40 placeholder:text-white/10"
                            placeholder={isEn ? "Answer" : "Respuesta"}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFaq(i)}
                          className="p-1 text-white/20 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 md:mt-12 pt-6 border-t border-white/10 flex justify-between items-center">
          <button
            onClick={handleBack}
            className={`btn-secondary flex items-center gap-2 py-2.5 text-sm ${currentStep === 1 ? "opacity-0 pointer-events-none" : ""}`}
          >
            <ArrowLeft size={16} /> {isEn ? "Back" : "Atrás"}
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 py-2.5 text-sm"
            >
              {isEn ? "Next" : "Siguiente"} <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-accent text-white px-6 py-2.5 rounded-full font-bold hover:bg-accent/90 active:scale-95 transition-all text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-2 disabled:opacity-50"
            >
              {isEn ? "Create" : "Crear"} <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProjectWizard;
