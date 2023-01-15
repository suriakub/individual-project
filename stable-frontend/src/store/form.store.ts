import { ImageListType } from 'react-images-uploading';
import { create } from 'zustand';

interface FormStore {
  prompt: string;
  steps: number;
  formImageList: ImageListType;
  setPrompt: (prompt: string) => void;
  setSteps: (steps: number) => void;
  setFormImage: (formImageList: ImageListType) => void;
}

export const useFormStore = create<FormStore>((set) => ({
  prompt: '',
  steps: 30,
  formImageList: [],
  setPrompt: (prompt: string) => set(() => ({ prompt })),
  setSteps: (steps: number) => set(() => ({ steps })),
  setFormImage: (formImageList: ImageListType) => set(() => ({ formImageList }))
}));
