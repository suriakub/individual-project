import { ReactSketchCanvas } from 'react-sketch-canvas';
import { shallow } from 'zustand/shallow';
import { useDrawingStore } from '../store/drawing.store';
import { useGlobalStore } from '../store/global.store';

export default function DrawingCanvas() {
  const [canvasRef, brushColor, brushSize] = useDrawingStore(
    (s) => [s.canvasRef, s.brushColor, s.brushSize],
    shallow
  );
  const [imageData, selectedImage] = useGlobalStore((s) => [
    s.imageData,
    s.selectedImage
  ]);
  return (
    <ReactSketchCanvas
      ref={canvasRef}
      className="object-contain w-full rounded-lg cursor-crosshair"
      width="432px"
      height="432px"
      strokeColor={brushColor}
      strokeWidth={brushSize}
      backgroundImage={imageData[selectedImage].image}
    />
  );
}
