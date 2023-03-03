import { create } from 'zustand';

interface FormStore {
  prompt: string;
  steps: number;
  strength: number;
  setPrompt: (prompt: string) => void;
  setSteps: (steps: number) => void;
  setStrength: (strength: number) => void;
}

export const useTextToImageFormStore = create<FormStore>((set) => ({
  prompt: '',
  steps: 30,
  strength: 0,
  setPrompt: (prompt: string) => set(() => ({ prompt })),
  setSteps: (steps: number) => set(() => ({ steps })),
  setStrength: (strength: number) => set(() => ({ strength }))
}));
