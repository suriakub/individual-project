import React, { MouseEvent, useEffect } from 'react';
import apiClient from '../util/api-client';
import { shallow } from 'zustand/shallow';
import { DiffusionState, Page, useGlobalStore } from '../store/global.store';
import { useTextToImageStore } from '../store/text-to-image.store';
import { DrawingMenu } from '../components/DrawingMenu';
import { roundNumber } from '../util/number-utils';
import Divider from '../components/Divider';
import ErrorBox from '../components/ErrorBox';
import { useDrawingStore } from '../store/drawing.store';
import DrawingCanvas from '../components/DrawingCanvas';

export default function SketchToImage() {
  const [prompt, setPrompt, steps, setSteps, strength, setStrength] =
    useTextToImageStore(
      (s) => [
        s.prompt,
        s.setPrompt,
        s.steps,
        s.setSteps,
        s.strength,
        s.setStrength
      ],
      shallow
    );
  const [
    setProgress,
    resetImages,
    setSelectedImage,
    setSelectedPage,
    username,
    imageData,
    diffusionState
  ] = useGlobalStore(
    (s) => [
      s.setProgress,
      s.resetImages,
      s.setSelectedImage,
      s.setSelectedPage,
      s.username,
      s.imageData,
      s.diffusionState
    ],
    shallow
  );
  const canvasRef = useDrawingStore((s) => s.canvasRef);

  useEffect(() => {
    setStrength(0.8);
    setSelectedImage(0);
  }, [setSelectedImage, setStrength]);

  const handleSubmit = async (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();

    debugger;
    const mask = await canvasRef.current?.exportImage('jpeg');
    const uploadedImage = imageData[imageData.length - 1].image;
    canvasRef.current?.clearCanvas();
    resetImages();
    setProgress(0, 1);
    apiClient.post('/generators/image-to-image', {
      username,
      args: {
        prompt,
        image: uploadedImage,
        mask,
        steps,
        strength
      }
    });
  };

  return (
    <>
      <div className="px-3 mb-6 md:mb-0">
        <div className="max-w-md p-1 rounded-lg border-4 border-dashed border-blue-300">
          <DrawingCanvas />
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
            className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded-lg disabled:bg-purple-100 disabled:border disabled:border-1 disabled:border-purple-400 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-200"
            type="submit"
          >
            Generate
          </button>
          <button
            className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded-lg disabled:bg-green-100 disabled:border disabled:border-1 disabled:border-green-400 disabled:text-slate-500 disabled:border-slate-200 ml-5 disabled:cursor-not-allowed"
            type="submit"
            disabled={diffusionState !== DiffusionState.COMPLETED}
            onClick={() => setSelectedPage(Page.EditGeneratedImage)}
          >
            Edit Mode
          </button>
          <ErrorBox />
        </form>
      </div>
    </>
  );
}
