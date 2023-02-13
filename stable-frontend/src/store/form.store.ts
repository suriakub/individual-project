import { create } from 'zustand';

interface FormStore {
  prompt: string;
  steps: number;
  setPrompt: (prompt: string) => void;
  setSteps: (steps: number) => void;
}

export const useFormStore = create<FormStore>((set) => ({
  prompt: '',
  steps: 30,
  setPrompt: (prompt: string) => set(() => ({ prompt })),
  setSteps: (steps: number) => set(() => ({ steps })),
}));
