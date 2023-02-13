import { useState } from 'react';
import TextToImage from '../components/TextToImage';
import ImageToImage from '../components/ImageToImage';

enum GeneratorModes {
  TextToImage = 'TextToImage',
  ImageToImage = 'ImageToImage',
  ImageInpainting = 'ImageInpainting',
}

const generatorOptions = [
  { label: 'Text to Image', id: GeneratorModes.TextToImage },
  { label: 'Image to Image', id: GeneratorModes.ImageToImage },
  { label: 'Image Inpainting', id: GeneratorModes.ImageInpainting },
];

export default function GeneratorPage() {
  const [mode, setMode] = useState(GeneratorModes.TextToImage);

  const renderView = () => {
    switch (mode) {
      case GeneratorModes.TextToImage:
        return <TextToImage />;
      case GeneratorModes.ImageToImage:
        return <ImageToImage />;
      case GeneratorModes.ImageInpainting:
        return <h1>Image Inpainting</h1>;
    }
  };

  const renderGeneratorModes = (
    options: { label: string; id: GeneratorModes }[]
  ) => {
    const activeCSS =
      'inline-flex p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group';
    const inactiveCSS =
      'inline-flex p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group';

    return (
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <ul className='flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400'>
          {options.map(({ label, id }) => {
            return (
              <li className='mr-2' key={id}>
                <button
                  className={id === mode ? activeCSS : inactiveCSS}
                  onClick={() => setMode(id)}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <>
      <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
        {renderGeneratorModes(generatorOptions)}
        <div className='px-4 py-6 sm:px-0 mx-auto'>
          <div className='flex flex-wrap -mx-3 mb-2 justify-center gap-12'>
            {renderView()}
          </div>
        </div>
      </div>
    </>
  );
}
