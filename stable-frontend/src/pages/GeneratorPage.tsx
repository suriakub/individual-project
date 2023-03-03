import TextToImage from './TextToImage';
import ImageToImage from './ImageToImage';
import EditImage from './EditImage';
import ImageInpainting from './ImageInpainting';
import SketchToImage from './SketchToImage';
import { Page, useGlobalStore } from '../store/global.store';

export default function GeneratorPage() {
  const [selectedPage] = useGlobalStore((s) => [s.selectedPage]);

  const renderPage = () => {
    switch (selectedPage) {
      case Page.TextToImage:
        return <TextToImage />;
      case Page.ImageToImage:
        return <ImageToImage />;
      case Page.SketchToImage:
        return <SketchToImage />;
      case Page.ImageInpainting:
        return <ImageInpainting />;
      case Page.EditGeneratedImage:
        return <EditImage />;
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {/* {renderGeneratorModes(nav-items)} */}
        <div className="px-4 py-6 sm:px-0 mx-auto">
          <div className="flex flex-wrap -mx-3 mb-2 justify-center gap-12">
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}
