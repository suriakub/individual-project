import React, { MouseEvent } from 'react';
import apiClient from '../util/api-client';
import { shallow } from 'zustand/shallow';
import { useGlobalStore } from '../store/global.store';
import { useTextToImageStore } from '../store/text-to-image.store';
import { DrawingMenu } from '../components/DrawingMenu';
import { roundNumber } from '../util/number-utils';
import Divider from '../components/Divider';
import ErrorBox from '../components/ErrorBox';
import { useDrawingStore } from '../store/drawing.store';

export default function ImageInpainting() {
  const [prompt, setPrompt, steps, setSteps, strength, setStrength] =
    useTextToImageStore(
      (state) => [
        state.prompt,
        state.setPrompt,
        state.steps,
        state.setSteps,
        state.strength,
        state.setStrength
      ],
      shallow
    );
  const [
    setProgress,
    pushImage,
    sliceImages,
    username,
    imageData,
    selectedImage
  ] = useGlobalStore(
    (state) => [
      state.setProgress,
      state.pushImage,
      state.sliceImages,
      state.username,
      state.imageData,
      state.selectedImage
    ],
    shallow
  );
  const canvasRef = useDrawingStore((s) => s.canvasRef);

  const handleSubmit = async (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mask = await canvasRef.current?.exportImage('jpeg');
    canvasRef.current?.clearCanvas();
    const { step, totalSteps } = imageData[selectedImage];

    const { data } = await apiClient.post('/images/merge', {
      image: imageData[selectedImage].image,
      mask
    });
    sliceImages(step);
    pushImage({
      image: data.image,
      step,
      totalSteps
    });
    setProgress(0, 1);
    apiClient.post('/generators/image-to-image', {
      username,
      args: {
        prompt,
        image: imageData[imageData.length - 1].image,
        mask,
        steps,
        strength
      }
    });
  };

  return (
    <>
      <div className="px-3 mb-6 md:mb-0">
        <div className="max-w-md p-1 rounded-lg border-4 border-dashed border-pink-300">
          <DrawingMenu />
        </div>
      </div>
      <div className="w-full md:w-1/3 md:min-w-[33%] mb-6 md:mb-0">
        <form className="w-full max-w-lg" onSubmit={handleSubmit}>
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="generator-prompt"
          >
            Text Prompt
          </label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="generator-prompt"
            type="text"
            placeholder="e.g. Mount Fuji with rising sun"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="generator-steps"
          >
            Steps
          </label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="generator-steps"
            type="number"
            value={steps}
            onChange={(e) => setSteps(+e.target.value)}
          />
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="generator-strength"
          >
            Strength
          </label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="generator-strength"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={roundNumber(strength, 2)}
            onChange={(e) => setStrength(+e.target.value)}
          />
          <Divider />
          <button
            className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
            type="submit"
            disabled={strength === 0}
          >
            Generate
          </button>
          <ErrorBox />
        </form>
      </div>
    </>
  );
}
