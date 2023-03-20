import { create } from 'zustand';

interface FormStore {
  prompt: string;
  steps: number;
  strength: number;
  seed?: number;
  setPrompt: (prompt: string) => void;
  setSteps: (steps: number) => void;
  setStrength: (strength: number) => void;
  setSeed: (seed: number) => void;
}

export const useFormStore = create<FormStore>((set) => ({
  prompt: 'A dream of Mount Fuji, concept art, matte painting, HQ, 4k',
  steps: 50,
  strength: 0,
  seed: undefined,
  setPrompt: (prompt: string) => set(() => ({ prompt })),
  setSteps: (steps: number) =>
    set(() => {
      return { steps: Math.min(Math.max(0, steps), 100) };
    }),
  setStrength: (strength: number) =>
    set(() => {
      return { strength: Math.min(Math.max(0, strength), 1) };
    }),
  setSeed: (seed: number) =>
    set(() => {
      return { seed: Math.min(Math.max(0, seed), 10000000) };
    })
}));
