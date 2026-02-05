import React from 'react';
import { Vault } from './components/Vault';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      <Vault />
    </div>
  );
}