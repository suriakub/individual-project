import React, { MouseEvent, useEffect } from 'react';
import apiClient from '../util/api-client';
import { shallow } from 'zustand/shallow';
import { DiffusionState, useGlobalStore } from '../store/global.store';
import { useFormStore } from '../store/form.store';
import { DrawingMenu } from '../components/DrawingMenu';
import { roundNumber } from '../util/number-utils';
import Divider from '../components/Divider';
import ErrorBox from '../components/ErrorBox';
import ImageSlider from '../components/ImageSlider';
import { useDrawingStore } from '../store/drawing.store';
import DrawingCanvas from '../components/DrawingCanvas';

export default function EditImage() {
  const [prompt, setPrompt, steps, strength, setStrength, seed, setSeed] =
    useFormStore(
      (s) => [
        s.prompt,
        s.setPrompt,
        s.steps,
        s.strength,
        s.setStrength,
        s.seed,
        s.setSeed
      ],
      shallow
    );
  const [
    setProgress,
    pushImage,
    sliceImages,
    setDiffusionState,
    setSelectedImage,
    diffusionState,
    username,
    imageData,
    selectedImage
  ] = useGlobalStore(
    (s) => [
      s.setProgress,
      s.pushImage,
      s.sliceImages,
      s.setDiffusionState,
      s.setSelectedImage,
      s.diffusionState,
      s.username,
      s.imageData,
      s.selectedImage
    ],
    shallow
  );
  const canvasRef = useDrawingStore((s) => s.canvasRef);

  useEffect(() => {
    if (selectedImage === 0) {
      setSelectedImage(imageData.length - 1);
    }
    const { step, totalSteps } = imageData[selectedImage];
    setStrength(1 - step / totalSteps || 0);
  }, [imageData, selectedImage, setSelectedImage, setStrength]);

  const handleSubmit = async (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDiffusionState(DiffusionState.IN_PROGRESS);
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
    setProgress(0, steps);
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
        <div className="max-w-md p-1 rounded-lg border-4 border-dashed border-green-300">
          <DrawingCanvas />
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
            htmlFor="generator-strength"
          >
            Strength
          </label>
          <input
            className="appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            id="generator-strength"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={roundNumber(strength, 2)}
            disabled
            onChange={(e) => setStrength(+e.target.value)}
          />
          <ImageSlider />
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Brush Options
          </label>
          <DrawingMenu />
          <Divider />
          <button
            className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded-lg disabled:bg-purple-100 disabled:border disabled:border-1 disabled:border-purple-400 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-200"
            type="submit"
            disabled={
              strength === 0 || diffusionState === DiffusionState.IN_PROGRESS
            }
          >
            Continue Generation
          </button>
          <ErrorBox />
        </form>
      </div>
    </>
  );
}
