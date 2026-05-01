import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
}));

// Store specifically for the Wizard form to persist state between steps
export const useWizardStore = create((set) => ({
  wizardData: {
    name: '',
    type: 'Restaurante',
    description: '',
    context: '',
    targetAudience: '',
    voiceTone: 'Profesional',
    language: 'es-GT',
    businessHours: '',
    agentId: '',
    knowledgeBase: [''],
    faqs: [{ question: '', answer: '' }],
  },
  setWizardData: (data) => set((state) => ({ wizardData: { ...state.wizardData, ...data } })),
  resetWizard: () => set({
    wizardData: {
      name: '',
      type: 'Restaurante',
      description: '',
      context: '',
      targetAudience: '',
      voiceTone: 'Profesional',
      language: 'es-GT',
      businessHours: '',
      agentId: '',
      knowledgeBase: [''],
      faqs: [{ question: '', answer: '' }],
    }
  })
}));
