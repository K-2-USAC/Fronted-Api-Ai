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

const steps = [
  { id: 1, title: "Basics", icon: Code2 },
  { id: 2, title: "Details", icon: Globe },
  { id: 3, title: "Style", icon: Paintbrush },
  { id: 4, title: "Extras", icon: CalendarDays },
];

const CreateProjectWizard = () => {
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
        setError("El nombre del proyecto es obligatorio");
        return false;
      }
      if (!wizardData.type.trim()) {
        setError("El tipo de negocio es obligatorio");
        return false;
      }
    }
    if (step === 2) {
      if (!wizardData.description.trim()) {
        setError("La descripción es obligatoria");
        return false;
      }
    }
    if (step === 4) {
      if (!wizardData.agentId.trim()) {
        setError("El Agent ID es obligatorio para la integración");
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
          <h2 className="text-3xl font-bold mb-4">Generating Magic...</h2>
          <p className="text-white/50 max-w-md mx-auto">
            Our AI is crafting your project architecture, generating styles, and
            preparing your workspace.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-[70vh]">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Create New Project
        </h1>

        {/* Progress Bar */}
        <div className="relative flex justify-between">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full z-0" />
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 rounded-full z-0"
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isCompleted
                      ? "bg-accent text-white"
                      : isCurrent
                        ? "bg-white text-dark shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        : "bg-dark border border-white/20 text-white/40"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <step.icon size={18} />
                  )}
                </div>
                <span
                  className={`absolute -bottom-8 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                    isCurrent ? "text-white" : "text-white/40"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 relative glass rounded-3xl p-8 md:p-12 overflow-hidden border border-white/10 shadow-2xl">
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
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Let's start with the basics
                  </h2>
                  <p className="text-white/50 mb-8">
                    What are we building today?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={wizardData.name}
                    onChange={(e) => setWizardData({ name: e.target.value })}
                    className="input-field text-lg"
                    placeholder="e.g. Acme Corp Website"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Tipo de Negocio
                  </label>
                  <select
                    value={wizardData.type}
                    onChange={(e) => setWizardData({ type: e.target.value })}
                    className="input-field appearance-none bg-dark text-white cursor-pointer"
                  >
                    <option value="Restaurante" className="bg-dark text-white">
                      Restaurante
                    </option>
                    <option value="Hotel" className="bg-dark text-white">
                      Hotel
                    </option>
                    <option value="Tienda" className="bg-dark text-white">
                      Tienda
                    </option>
                    <option value="Otro" className="bg-dark text-white">
                      Otro
                    </option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Tell us more</h2>
                  <p className="text-white/50 mb-8">
                    This helps our AI understand your goals.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={wizardData.description}
                    onChange={(e) =>
                      setWizardData({ description: e.target.value })
                    }
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Describe qué hace tu negocio y qué deseas lograr..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Público Objetivo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={wizardData.targetAudience}
                    onChange={(e) =>
                      setWizardData({ targetAudience: e.target.value })
                    }
                    className="input-field"
                    placeholder="ej. Jóvenes profesionales, pequeñas empresas..."
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Look & Feel</h2>
                  <p className="text-white/50 mb-8">
                    Choose the vibe of your application.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-4">
                    Tono de Voz
                  </label>
                  <div className="grid grid-cols-2 gap-4">
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
                        className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                          wizardData.voiceTone === tone
                            ? "bg-accent/20 border-accent shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                            : "bg-white/5 border-white/10 hover:border-white/30"
                        }`}
                      >
                        <span className="font-medium text-sm">{tone}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 mt-4">
                    Idioma del Agente
                  </label>
                  <select
                    value={wizardData.language}
                    onChange={(e) =>
                      setWizardData({ language: e.target.value })
                    }
                    className="input-field appearance-none bg-dark text-white cursor-pointer"
                  >
                    <option value="es-GT" className="bg-dark text-white">
                      Español (Guatemala)
                    </option>
                    <option value="es-ES" className="bg-dark text-white">
                      Español (España)
                    </option>
                    <option value="en-US" className="bg-dark text-white">
                      Inglés (US)
                    </option>
                    <option value="en-GB" className="bg-dark text-white">
                      Inglés (UK)
                    </option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Final details</h2>
                  <p className="text-white/50 mb-8">
                    Add any extra information.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Nombre del Agente
                    </label>
                    <input
                      type="text"
                      value={wizardData.agentId}
                      onChange={(e) =>
                        setWizardData({ agentId: e.target.value })
                      }
                      className="input-field"
                      placeholder="ej. Asistente IA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Horarios de Atención
                    </label>
                    <input
                      type="text"
                      value={wizardData.businessHours}
                      onChange={(e) =>
                        setWizardData({ businessHours: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g. Lun-Vie, 9am - 6pm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-4 flex justify-between items-center">
                    <span>Preguntas Frecuentes (FAQs)</span>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="text-accent hover:text-white flex items-center gap-1 text-xs transition-colors"
                    >
                      <Plus size={14} /> Agregar FAQ
                    </button>
                  </label>

                  <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                    {wizardData.faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="flex gap-2 items-start bg-white/5 p-3 rounded-xl border border-white/10"
                      >
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) =>
                              updateFaq(i, "question", e.target.value)
                            }
                            className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 placeholder:text-white/20"
                            placeholder="Pregunta"
                          />
                          <input
                            type="text"
                            value={faq.answer}
                            onChange={(e) =>
                              updateFaq(i, "answer", e.target.value)
                            }
                            className="bg-transparent border-none p-0 text-xs w-full focus:ring-0 text-white/50 placeholder:text-white/10"
                            placeholder="Respuesta"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFaq(i)}
                          className="p-1 text-white/30 hover:text-red-400 transition-colors"
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

        <div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center">
          <button
            onClick={handleBack}
            className={`btn-secondary flex items-center gap-2 ${currentStep === 1 ? "opacity-0 pointer-events-none" : ""}`}
          >
            <ArrowLeft size={18} /> Back
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="bg-accent text-white px-6 py-3 rounded-full font-medium hover:bg-accent/90 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
            >
              Generate Project <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProjectWizard;
