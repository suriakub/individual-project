import { create } from 'zustand';

interface SocketStore {
  progress: number;
  image?: string;
  setProgress: (progress: number) => void;
  setImage: (image?: string) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  progress: 100,
  image: undefined,
  setProgress: (progress: number) => set(() => ({ progress })),
  setImage: (image?: string) => set(() => ({ image }))
}));
