import { create } from 'zustand';
import THEME_COLORS from '../util/color-constants';
import { BLANK_IMAGE } from '../util/image-utils';
import setBodyColor from '../util/set-body-color';

interface GlobalStore {
  progress: number;
  imageData: ImageData[];
  selectedImage: number;
  diffusionState: DiffusionState;
  username: string | null;
  error: boolean;
  selectedPage: Page;
  setProgress: (step: number, totalSteps: number) => void;
  pushImage: (image: ImageData) => void;
  resetImages: () => void;
  sliceImages: (timestep: number) => void;
  popImage: () => void;
  setUsername: (username: string | null) => void;
  setDiffusionState: (state: DiffusionState) => void;
  setSelectedImage: (index: number) => void;
  setError: (error: boolean) => void;
  setSelectedPage: (page: Page) => void;
}

export enum Page {
  TextToImage = 'TextToImage',
  ImageToImage = 'ImageToImage',
  SketchToImage = 'SketchToImage',
  EditGeneratedImage = 'EditGeneratedImage',
  ImageInpainting = 'ImageInpainting'
}

export type ImageData = {
  image: string;
  step: number;
  totalSteps: number;
};

const DEFAULT_IMAGE: ImageData = {
  image: BLANK_IMAGE,
  step: 0,
  totalSteps: 0
};
const IMAGE_PREFIX = 'data:image/jpeg;base64,';

export enum DiffusionState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  progress: -1,
  imageData: [DEFAULT_IMAGE],
  selectedImage: 0,
  diffusionState: DiffusionState.NOT_STARTED,
  username: localStorage.getItem('username'),
  error: false,
  selectedPage: Page.TextToImage,

  setProgress: (step: number, totalSteps: number) => {
    const progress = Math.floor((step / totalSteps) * 100);
    set(() => ({ progress }));
  },

  pushImage: (data: ImageData) => {
    if (!data.image.startsWith(IMAGE_PREFIX)) {
      data.image = IMAGE_PREFIX + data.image;
    }
    set((state) => ({
      imageData: [...state.imageData, data || ''],
      selectedImage: state.imageData.length
    }));
  },

  sliceImages: (timestep: number) => {
    set((state) => {
      const index = state.imageData.findIndex((data) => data.step === timestep);
      return {
        imageData: state.imageData.slice(0, index),
        selectedImage: index - 1
      };
    });
  },

  popImage: () => {
    set((state) => {
      return {
        imageData: state.imageData.slice(0, state.imageData.length - 1),
        selectedImage: state.imageData.length - 2
      };
    });
  },

  resetImages: () => {
    set(() => ({ imageData: [DEFAULT_IMAGE], selectedImage: 0 }));
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

  setError: (error: boolean) => {
    set(() => ({ error }));
  },

  setDiffusionState: (state: DiffusionState) => {
    set(() => ({ diffusionState: state }));
  },

  setSelectedPage: (page: Page) => {
    if (page === Page.EditGeneratedImage) {
      setBodyColor(THEME_COLORS.green.background);
    } else {
      setBodyColor(THEME_COLORS.blue.background);
    }
    set(() => ({ selectedPage: page }));
  }
}));
