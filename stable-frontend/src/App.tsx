import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import './App.css';
import Navigation from './components/Navigation';
import { useSocketStore } from './store/socket.store';
import socket from './util/socket-connection';

window.Buffer = window.Buffer || require('buffer').Buffer;

export default function App(props: { children?: React.ReactNode }) {
  const [setProgress, setImage] = useSocketStore(
    (state) => [state.setProgress, state.setImage, state.progress, state.image],
    shallow
  );

  useEffect(() => {
    socket.on('progress', (progress) => {
      setProgress(progress);
    });
    socket.on('image', (image) => {
      setProgress(100);
      setImage(image);
    });

    return function cleanup() {
      socket.off('progress');
      socket.off('image');
    };
  }, [setImage, setProgress]);

  return (
    <div className="min-h-full">
      <Navigation />
      {props?.children}
      <Outlet />
    </div>
  );
}
