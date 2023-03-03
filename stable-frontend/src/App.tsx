import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import './App.css';
import { DiffusionState, useGlobalStore } from './store/global.store';
import socket from './util/socket-connection';
import LoginModal from './components/LoginModal';
import setBodyColor from './util/set-body-color';
import THEME_COLORS from './util/color-constants';
import ProgressBar from './components/ProgressBar';
import Header from './components/Header';

window.Buffer = window.Buffer || require('buffer').Buffer;

export default function App(props: { children?: React.ReactNode }) {
  useEffect(() => {
    setBodyColor(THEME_COLORS.blue.background);
  });
  const [setProgress, pushImage, setError, setDiffusionState] = useGlobalStore(
    (state) => [
      state.setProgress,
      state.pushImage,
      state.setError,
      state.setDiffusionState
    ],
    shallow
  );

  useEffect(() => {
    if (socket !== null) {
      socket.on('image', ({ image, step, totalSteps }) => {
        pushImage({ image, step, totalSteps });
        setProgress(step, totalSteps);
      });
      socket.on('error', () => {
        setError(true);
        setDiffusionState(DiffusionState.NOT_STARTED);
      });
    }

    return function cleanup() {
      if (socket !== null) {
        socket.off('image');
        socket.off('error');
      }
    };
  }, [pushImage, setProgress, setError, setDiffusionState]);

  return (
    <>
      <LoginModal />
      <Header />
      <div className="min-h-full">
        {props?.children}
        <Outlet />
        <footer className="fixed bottom-0 left-0 z-20 w-full pb-4 pt-3 px-5 bg-white border-t border-gray-200 shadow md:items-center md:justify-between">
          <div className="">
            <ProgressBar />
          </div>
        </footer>
      </div>
    </>
  );
}
