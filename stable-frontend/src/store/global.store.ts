import { create } from 'zustand';

interface GlobalStore {
  progress: number;
  images: string[];
  selectedImage: number;
  diffusionState: DiffusionState;
  username: string | null;
  setProgress: (progress: number) => void;
  setImage: (image?: string) => void;
  setUsername: (username: string | null) => void;
  setSelectedImage: (index: number) => void;
}

const DEFAULT_IMAGE = `${process.env.PUBLIC_URL}/blank.jpg`;
const IMAGE_PREFIX = 'data:image/jpeg;base64,';

export enum DiffusionState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  progress: -1,
  images: [DEFAULT_IMAGE],
  selectedImage: 0,
  diffusionState: DiffusionState.NOT_STARTED,
  username: localStorage.getItem('username'),

  setProgress: (progress: number) => {
    const state =
      progress === 100 ? DiffusionState.COMPLETED : DiffusionState.IN_PROGRESS;
    set(() => ({ progress, diffusionState: state }));
  },

  setImage: (image?: string) => {
    if (image === undefined) {
      image = DEFAULT_IMAGE;
    } else if (!image.startsWith(IMAGE_PREFIX)) {
      image = IMAGE_PREFIX + image;
    }
    set((state) => ({
      images: [...state.images, image || ''],
      selectedImage: state.images.length,
    }));
  },

  setUsername: (username: string | null) => {
    username === null
      ? localStorage.removeItem('username')
      : localStorage.setItem('username', username);
    set(() => ({ username }));
  },
  setSelectedImage: (index: number) => {
    set(() => ({ selectedImage: index }));
  },
}));
