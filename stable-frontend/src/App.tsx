import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import './App.css';
import Navigation from './components/Navigation';
import { useGlobalStore } from './store/global.store';
import socket from './util/socket-connection';
import LoginModal from './components/LoginModal';

window.Buffer = window.Buffer || require('buffer').Buffer;

export default function App(props: { children?: React.ReactNode }) {
  const [setProgress, setImage] = useGlobalStore(
    (state) => [state.setProgress, state.setImage],
    shallow
  );

  useEffect(() => {
    socket.on('image', ({ image, progress }) => {
      setProgress(progress);
      setImage(image);
    });

    return function cleanup() {
      socket.off('image');
    };
  }, [setImage, setProgress]);

  return (
    <>
      <LoginModal />
      <div className='min-h-full'>
        <Navigation />
        {props?.children}
        <Outlet />
        <footer className='fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600'>
          <span className='text-sm text-gray-500 sm:text-center dark:text-gray-400'>
            © 2023 Jakub Suriak
          </span>
        </footer>
      </div>
    </>
  );
}
