import { MouseEvent } from 'react';
import apiClient from '../util/api-client';
import { shallow } from 'zustand/shallow';
import { useSocketStore } from '../store/socket.store';
import { useFormStore } from '../store/form.store';
import ImageDraw from '../components/ImageDraw';

export default function GeneratorPage() {
  const [prompt, setPrompt, steps, setSteps, formImage, setFormImage] =
    useFormStore(
      (state) => [
        state.prompt,
        state.setPrompt,
        state.steps,
        state.setSteps,
        state.formImageList,
        state.setFormImage
      ],
      shallow
    );
  const [setProgress, setImage, progress, image] = useSocketStore(
    (state) => [state.setProgress, state.setImage, state.progress, state.image],
    shallow
  );

  const handleSubmit = (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    setImage(undefined);
    setProgress(0);
    const payload = {
      userId: 1,
      args: {
        prompt,
        steps,
        height: 512,
        width: 512
      }
    };
    apiClient.post('/generators/text-to-image', payload);
  };

  const showImage = (image?: string) => {
    const imgSrc =
      image == null
        ? `${process.env.PUBLIC_URL}/blank.jpg`
        : `data:image/jpeg;base64,${image}`;

    return (
      <div className="relative">
        {progress !== 100 ? showProgressBar(progress) : <></>}
        <ImageDraw image={imgSrc} />
      </div>
    );
  };

  const showProgressBar = (percentage: number) => {
    return (
      <>
        <h3 className="absolute left-1/3 top-[42%] text-blue-600 font-medium">
          Generating image...
        </h3>
        <div className="absolute flex left-[17%] w-2/3 h-full items-center justify-center">
          <div className="w-full bg-gray-200 rounded-full">
            <div
              className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
              style={{ width: `${percentage}%` }}
            >
              {`${percentage}%`}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Image Generation
          </h1>
        </div>
      </header>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <button className="bg-yellow-500 hover:bg-yellow-400 text-white mx-2 py-2 px-4 rounded">
          Text to Image
        </button>
        <button className="bg-yellow-500 hover:bg-yellow-400 text-white mx-2 py-2 px-4 rounded">
          Image to Image
        </button>
        <div className="px-4 py-6 sm:px-0 mx-auto">
          <div className="flex flex-wrap -mx-3 mb-2">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              {showImage(image)}
              {/* <ImageUpload setImage={setFormImage} imageList={formImage} /> */}
            </div>
            <div className="w-full md:w-1/2 mb-6 md:mb-0">
              <form className="w-full max-w-lg" onSubmit={handleSubmit}>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="generator-prompt"
                >
                  Text Prompt
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                  id="generator-prompt"
                  type="text"
                  placeholder="Mount Fuji with rising sun"
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
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                  id="generator-steps"
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(+e.target.value)}
                />
                <button
                  className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
                  type="submit"
                  disabled={progress !== 100}
                >
                  Generate
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
