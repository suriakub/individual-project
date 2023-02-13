import { shallow } from 'zustand/shallow';
import { useGlobalStore } from '../store/global.store';

export default function ImageSlider() {
  const [setSelectedImage, images, selectedImage] = useGlobalStore(
    (state) => [state.setSelectedImage, state.images, state.selectedImage],
    shallow
  );

  return (
    <input
      id='steps-range'
      type='range'
      min={2}
      max={images.length - 1}
      value={selectedImage}
      step={1}
      onChange={(e) => setSelectedImage(+e.target.value)}
      className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
    />
  );
}
