import { useDrawingStore } from '../store/drawing.store';
import ColorPicker from './ColorPicker';

export const DrawingMenu = () => {
  const [
    canvasRef,
    brushColor,
    brushSize,
    eraseMode,
    setBrushColor,
    setBrushSize,
    setEraseMode
  ] = useDrawingStore((state) => [
    state.canvasRef,
    state.brushColor,
    state.brushSize,
    state.eraseMode,
    state.setBrushColor,
    state.setBrushSize,
    state.setEraseMode
  ]);

  const handleEraseToggle = () => {
    // setting the state is an async operation
    setEraseMode(!eraseMode);
    canvasRef.current?.eraseMode(!eraseMode);
  };

  return (
    <>
      <div className='pt-2'>
        <ColorPicker color={brushColor} setColor={setBrushColor} />
        Brush Size
        <input
          id="minmax-range"
          type="range"
          min="2"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(+e.target.value)}
          className="ml-3 w-[60%] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex py-4">
          <button
            className="bg-red-500 hover:bg-red-400 text-white mx-1 py-1 px-2 mt-3 rounded"
            onClick={() => canvasRef.current?.clearCanvas()}
          >
            Clear Canvas
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-400 text-white mx-1 py-1 px-2 mt-3 rounded"
            onClick={() => canvasRef.current?.undo()}
          >
            Undo
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-400 text-white mx-1 py-1 px-2 mt-3 rounded"
            onClick={() => canvasRef.current?.redo()}
          >
            Redo
          </button>
          <label className="relative inline-flex items-center mb-5 cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              onClick={handleEraseToggle}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Erase mode
            </span>
          </label>
        </div>
      </div>
    </>
  );
};

// Move the discussion of diffusion models into the background
// Discuss the implications of changing worker/api/frontend, what needs to be done to develop different versions of them
// Discuss the differences between running of the code locally vs in a cluster

// Personal preference of technologies:
// Try to avoid using random links from the internet as references
// - look for research papers / textbooks
// StackOverflow developer survery is a good reference for a start, but I need to back up 
// Limited time budget is a good argument for the choice of technology

// referencing should be everywhere, even when I reference a particular source frequently
// reference Marco as an expert on diffusion

// TRY TO STRUCTURE THE DISSERTATION IN A WAY THAT IF SOMEONE INTERESTED WOULD BE ABLE TO CHANGE IT EASILY