import React from 'react';
import { ChangeEvent, useState } from 'react';
import { ColorResult, SliderPicker } from 'react-color';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

export default function ImageDraw({ image }: { image: string }) {
  const [brushColor, setBrushColor] = useState('#fff');
  const [eraseMode, setEraseMode] = useState(false);
  const canvasRef = React.createRef<ReactSketchCanvasRef>();

  const handleChange = (color: ColorResult, event: ChangeEvent) => {
    setBrushColor(color.hex);
  };

  const handleEraseToggle = () => {
    canvasRef.current?.eraseMode(eraseMode);
    setEraseMode(!eraseMode);
  };

  return (
    <>
      <div className="max-w-md p-1 rounded-lg border-4 border-dashed border-gray-200">
        <ReactSketchCanvas
          ref={canvasRef}
          className="object-contain w-full rounded-lg"
          width="432px"
          height="432px"
          strokeColor={brushColor}
          backgroundImage={image}
        />
        <SliderPicker color={brushColor} onChange={handleChange} />
        <button
          className="bg-red-500 hover:bg-red-400 text-white mx-1 py-1 px-2 mt-3 rounded"
          onClick={() => canvasRef.current?.resetCanvas()}
        >
          Clear
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white mx-1 py-1 px-2 mt-3 rounded"
          onClick={() => canvasRef.current?.undo()}
        >
          Undo
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white mx-1 py-1 px-2 mt-3 rounded"
          onClick={() => canvasRef.current?.redo()}
        >
          Redo
        </button>
        <label className="relative inline-flex items-center mb-5 cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            onClick={handleEraseToggle}
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            Erase mode
          </span>
        </label>
      </div>
    </>
  );
}
