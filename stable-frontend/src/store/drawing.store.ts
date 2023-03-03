import React from 'react';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import { create } from 'zustand';

interface DrawingStore {
  canvasRef: React.RefObject<ReactSketchCanvasRef>;
  brushColor: string;
  brushSize: number;
  eraseMode: boolean;
  setBrushColor: (brushColor: string) => void;
  setBrushSize: (brushSize: number) => void;
  setEraseMode: (eraseMode: boolean) => void;
}

export const useDrawingStore = create<DrawingStore>((set) => ({
  brushColor: '#000',
  brushSize: 10,
  eraseMode: false,
  canvasRef: React.createRef<ReactSketchCanvasRef>(),
  setBrushColor: (brushColor: string) => set(() => ({ brushColor })),
  setBrushSize: (brushSize: number) => set(() => ({ brushSize })),
  setEraseMode: (eraseMode: boolean) => set(() => ({ eraseMode }))
}));
