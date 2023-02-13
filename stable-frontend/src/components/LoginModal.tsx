import { Dialog, Transition } from '@headlessui/react';
import { MouseEvent, Fragment, useState } from 'react';
import { useGlobalStore } from '../store/global.store';
import { shallow } from 'zustand/shallow';

export default function LoginModal() {
  const [setUsernameGlobal, usernameGlobal] = useGlobalStore(
    (state) => [state.setUsername, state.username],
    shallow
  );

  const [isOpen, setIsOpen] = useState(usernameGlobal === null);
  const [username, setUsername] = useState(usernameGlobal || '');

  function closeModal() {
  setIsOpen(false);
  }

  function handleSubmit(event: MouseEvent<HTMLFormElement>) {
    event.preventDefault();
    setUsernameGlobal(username);
    closeModal();
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    Please enter your username
                  </Dialog.Title>

                  <form className='mt-4' onSubmit={handleSubmit}>
                    <input
                      className='appearance-none block w-full bg-gray-100 text-gray-700 border rounded-md py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
                      id='login-username'
                      value={username}
                      type='text'
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <button
                      type='submit'
                      className='inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                    >
                      Got it, thanks!
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
