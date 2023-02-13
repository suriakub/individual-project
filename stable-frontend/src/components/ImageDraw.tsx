import React, { useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useGlobalStore } from '../store/global.store';
import { shallow } from 'zustand/shallow';
import { getBase64 } from '../util/image-utils';
import ColorPicker from './ColorPicker';
import ImageSlider from './ImageSlider';

export const ImageDraw = ({
  canvasRef,
}: {
  canvasRef: React.RefObject<ReactSketchCanvasRef>;
}) => {
  const [brushColor, setBrushColor] = useState('#000');
  const [brushSize, setBrushSize] = useState(10);
  const [eraseMode, setEraseMode] = useState(false);
  const [images, selectedImage, setImage] = useGlobalStore(
    (state) => [state.images, state.selectedImage, state.setImage],
    shallow
  );

  const handleEraseToggle = () => {
    // setting the state is an async operation
    setEraseMode(!eraseMode);
    canvasRef.current?.eraseMode(!eraseMode);
  };

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setImage(await getBase64(event.target.files[0]));
    }
  };

  return (
    <>
      <div className='max-w-md p-1 rounded-lg border-4 border-dashed border-gray-200'>
        <ReactSketchCanvas
          ref={canvasRef}
          className='object-contain w-full rounded-lg'
          width='432px'
          height='432px'
          strokeColor={brushColor}
          strokeWidth={brushSize}
          backgroundImage={images[selectedImage]}
          exportWithBackgroundImage={true}
        />
        <ImageSlider />
        <div className='mb-4' />
        <ColorPicker color={brushColor} setColor={setBrushColor} />
        Brush Size
        <input
          id='minmax-range'
          type='range'
          min='2'
          max='20'
          value={brushSize}
          onChange={(e) => setBrushSize(+e.target.value)}
          className='ml-3 w-[60%] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
        />
        <div className='flex py-4'>
          <button
            className='bg-red-500 hover:bg-red-400 text-white mx-1 py-1 px-2 mt-3 rounded'
            onClick={() => canvasRef.current?.clearCanvas()}
          >
            Clear Canvas
          </button>
          <button
            className='bg-blue-500 hover:bg-blue-400 text-white mx-1 py-1 px-2 mt-3 rounded'
            onClick={() => canvasRef.current?.undo()}
          >
            Undo
          </button>
          <button
            className='bg-blue-500 hover:bg-blue-400 text-white mx-1 py-1 px-2 mt-3 rounded'
            onClick={() => canvasRef.current?.redo()}
          >
            Redo
          </button>
          <label className='relative inline-flex items-center mb-5 cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              onClick={handleEraseToggle}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
            <span className='ml-3 text-sm font-medium text-gray-900 dark:text-gray-300'>
              Erase mode
            </span>
          </label>
        </div>
        <input
          className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400'
          id='file_input'
          type='file'
          onChange={onImageChange}
        />
      </div>
    </>
  );
};
