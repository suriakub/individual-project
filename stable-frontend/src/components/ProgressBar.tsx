import { DiffusionState, useGlobalStore } from '../store/global.store';

export default function ProgressBar({ className }: { className?: string }) {
  const [state, progress] = useGlobalStore((s) => [
    s.diffusionState,
    s.progress
  ]);
  let text: string;
  if (state === DiffusionState.NOT_STARTED) {
    text = 'Diffusion not started';
  } else if (state === DiffusionState.COMPLETED) {
    text = 'Diffusion completed.';
  } else {
    text = 'Diffusion in progress...';
  }
  return (
    <div className={`${className}`}>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-blue-700 dark:text-white">
          {text}
        </span>
        <span className="text-sm font-medium text-blue-700 dark:text-white">
          {state === DiffusionState.NOT_STARTED ? '' : `${progress}%`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${Math.max(0, progress)}%` }}
        />
      </div>
    </div>
  );
}
