export default function ProgressBar({className, percentage }: {className: string, percentage: number }) {
  let text: string;
  if (percentage === -1) {
    text = 'Diffusion not started'
  } else if (percentage === 100) {
    text = 'Diffusion completed.'
  } else {
    text = 'Diffusion in progress...'
  }
  return (
    <>
      <div className={`flex justify-between mb-1 ${className}`}>
        <span className='text-base font-medium text-blue-700 dark:text-white'>
          {text}
        </span>
        <span className='text-sm font-medium text-blue-700 dark:text-white'>
          {percentage === -1 ? '' : `${percentage}%`}
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
        <div className='bg-blue-600 h-2.5 rounded-full' style={{width: `${Math.max(0, percentage)}%`}}/>
      </div>
    </>
  );
}
