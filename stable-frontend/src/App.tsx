import React, { useEffect, useState } from 'react';
import './App.css';
import GeneratorForm from './components/GeneratorForm';
import Navigation from './components/Navigation';

import socket from './util/socket-connection';
window.Buffer = window.Buffer || require('buffer').Buffer;

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return function cleanup() {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <>
      <div className="min-h-full">
        <Navigation />
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Image Generation
            </h1>
          </div>
        </header>
        <main>
          <GeneratorForm />
        </main>
      </div>
    </>
  );
}
