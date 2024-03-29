import { MouseEvent, useEffect } from 'react';
import apiClient from '../util/api-client';
import { shallow } from 'zustand/shallow';
import { DiffusionState, Page, useGlobalStore } from '../store/global.store';
import { useFormStore } from '../store/form.store';
import Divider from '../components/Divider';
import ErrorBox from '../components/ErrorBox';

export default function TextToImage() {
  const [prompt, setPrompt, steps, setSteps, seed, setSeed] = useFormStore(
    (state) => [
      state.prompt,
      state.setPrompt,
      state.steps,
      state.setSteps,
      state.seed,
      state.setSeed
    ],
    shallow
  );

  const [
    setProgress,
    setSelectedImage,
    resetImages,
    setDiffusionState,
    setSelectedPage,
    imageData,
    diffusionState,
    username
  ] = useGlobalStore((s) => [
    s.setProgress,
    s.setSelectedImage,
    s.resetImages,
    s.setDiffusionState,
    s.setSelectedPage,
    s.imageData,
    s.diffusionState,
    s.username
  ]);

  const handleSubmit = (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDiffusionState(DiffusionState.IN_PROGRESS);
    resetImages();
    setProgress(0, steps);
    apiClient.post('/generators/text-to-image', {
      username,
      args: {
        prompt,
        steps,
        height: 512,
        width: 512,
        seed
      }
    });
  };

  useEffect(() => {
    setSelectedImage(imageData.length - 1);
    let { step, totalSteps } = imageData[imageData.length - 1];
    if (totalSteps === 0) {
      setProgress(-1, 100);
    } else {
      setProgress(step, totalSteps);
    }
  }, [imageData, setDiffusionState, setProgress, setSelectedImage]);

  return (
    <>
      <div className="px-3 mb-6 md:mb-0">
        <div className="max-w-md p-1 rounded-lg border-4 border-dashed border-blue-300">
          <img
            src={imageData[imageData.length - 1].image}
            alt="Generated by user"
          />
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
            step="1"
            onChange={(e) => setSteps(+e.target.value)}
          />
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="generator-seed"
          >
            Seed
          </label>
          <input
            className="appearance-none block w-[30%] text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="generator-seed"
            type="number"
            value={seed}
            step="1"
            onChange={(e) => setSeed(+e.target.value)}
          />
          <label className="invisible block uppercase tracking-wide text-gray-700 text-xs font-bold mb-3">
            Steps
          </label>
          <input
            className="invisible block w-full text-gray-700 border rounded py-3 mb-2 leading-tight"
            type="number"
          />
          <Divider />
          <button
            className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded-lg disabled:bg-purple-100 disabled:border disabled:border-1 disabled:border-purple-400 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-200"
            type="submit"
            disabled={diffusionState === DiffusionState.IN_PROGRESS}
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
