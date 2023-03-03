import React from 'react';
import { shallow } from 'zustand/shallow';
import { useTextToImageStore } from '../store/text-to-image.store';
import { useGlobalStore } from '../store/global.store';

export default function ImageSlider() {
  const setStrength = useTextToImageStore((state) => state.setStrength);
  const [setProgress, setSelectedImage, imageData, selectedImage] =
    useGlobalStore(
      (state) => [
        state.setProgress,
        state.setSelectedImage,
        state.imageData,
        state.selectedImage
      ],
      shallow
    );

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedImage(+e.target.value);
    const { step, totalSteps } = imageData[+e.target.value];
    setProgress(step, totalSteps);
    setStrength(1 - step / totalSteps);
  };

  return (
    <div className="pb-3">
      <label
        htmlFor="steps-range"
        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
      >
        Rewind diffusion
      </label>

      <input
        id="steps-range"
        type="range"
        min={1}
        max={imageData.length - 1}
        value={selectedImage}
        step={1}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div>
        Step {imageData[selectedImage].step} /{' '}
        {imageData[selectedImage].totalSteps}
      </div>
    </div>
  );
}
