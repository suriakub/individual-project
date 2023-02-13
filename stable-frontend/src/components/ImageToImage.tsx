import React, { MouseEvent, useState } from 'react';
import apiClient from '../util/api-client';
import { shallow } from 'zustand/shallow';
import { DiffusionState, useGlobalStore } from '../store/global.store';
import { useFormStore } from '../store/form.store';
import { ImageDraw } from './ImageDraw';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import ProgressBar from './ProgressBar';

export default function ImageToImage() {
  const [prompt, setPrompt, steps, setSteps] = useFormStore(
    (state) => [state.prompt, state.setPrompt, state.steps, state.setSteps],
    shallow
  );
  const [setProgress, setImage, progress, diffusionState, username] = useGlobalStore(
    (state) => [
      state.setProgress,
      state.setImage,
      state.progress,
      state.diffusionState,
      state.username
    ],
    shallow
  );

  const canvasRef = React.createRef<ReactSketchCanvasRef>();

  const [strength, setStrength] = useState(0.8);

  const handleSubmit = async (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    const editedImage = await canvasRef.current?.exportImage('jpeg');
    setImage(editedImage);
    canvasRef.current?.clearCanvas();
    setProgress(0);
    apiClient.post('/generators/image-to-image', {
      username,
      args: {
        prompt,
        image: editedImage,
        steps,
        strength,
      },
    });
  };

  return (
    <>
      <div className='px-3 mb-6 md:mb-0'>
        <ImageDraw canvasRef={canvasRef} />
      </div>
      <div className='w-full md:w-1/3 md:min-w-[33%] mb-6 md:mb-0'>
        <form className='w-full max-w-lg' onSubmit={handleSubmit}>
          <label
            className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
            htmlFor='generator-prompt'
          >
            Text Prompt
          </label>
          <input
            className='appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
            id='generator-prompt'
            type='text'
            placeholder='Mount Fuji with rising sun'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <label
            className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
            htmlFor='generator-steps'
          >
            Steps
          </label>
          <input
            className='appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
            id='generator-steps'
            type='number'
            value={steps}
            onChange={(e) => setSteps(+e.target.value)}
          />
          <label
            className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
            htmlFor='generator-strength'
          >
            Strength
          </label>
          <input
            className='appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
            id='generator-strength'
            type='number'
            step='0.01'
            min='0'
            max='1'
            value={strength}
            onChange={(e) => setStrength(+e.target.value)}
          />
          <button
            className='bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200'
            type='submit'
            disabled={diffusionState === DiffusionState.IN_PROGRESS}
          >
            Generate
          </button>
          <ProgressBar className='pt-5' percentage={progress} />
        </form>
      </div>
    </>
  );
}
