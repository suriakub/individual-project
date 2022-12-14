import { MouseEvent, useEffect, useState } from 'react';
import apiClient from '../util/api-client';
import socket from '../util/socket-connection';

export default function GeneratorForm() {
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState(30);
  const [image, setImage] = useState();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    socket.on('progress', (progress) => {
      setProgress(progress);
    });
    socket.on('image', (image) => {
      setProgress(100);
      setImage(image);
    });
    return function cleanup() {
      socket.off('progress');
      socket.off('image');
    };
  }, []);

  const handleSubmit = (event: MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProgress(0);
    setImage(undefined);
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
        <img
          className="object-contain w-full rounded-lg"
          src={imgSrc}
          alt={prompt}
        />
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
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0 mx-auto">
        <div className="flex flex-wrap -mx-3 mb-2">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <div className="max-w-md p-1 rounded-lg border-4 border-dashed border-gray-200">
              {showImage(image)}
            </div>
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
  );
}
