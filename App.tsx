import React, { useState } from 'react';
import LiveView from './components/LiveView';
import DeepChat from './components/DeepChat';
import { AppMode } from './types';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LIVE_VIDEO);
  const apiKey = process.env.API_KEY || '';
  const [showApiKeyError, setShowApiKeyError] = useState(!apiKey);

  if (showApiKeyError) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-2xl max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">API Key Missing</h1>
          <p className="text-slate-300 mb-4">
            To use Soulmate AI, you must provide a Google Gemini API Key.
            The environment variable <code>process.env.API_KEY</code> is not set.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 selection:bg-pink-500/30">
      <header className="fixed top-0 w-full z-50 bg-slate-900/50 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
              Soulmate AI
            </h1>
          </div>
          
          <nav className="flex bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
            <button
              onClick={() => setMode(AppMode.LIVE_VIDEO)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === AppMode.LIVE_VIDEO 
                  ? 'bg-slate-700 text-pink-300 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Video Call
            </button>
            <button
              onClick={() => setMode(AppMode.DEEP_THOUGHT)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === AppMode.DEEP_THOUGHT 
                  ? 'bg-slate-700 text-pink-300 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chat Advice
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-screen flex flex-col items-center">
        {mode === AppMode.LIVE_VIDEO ? (
          <div className="w-full animate-fade-in">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-light text-slate-100">Talk to Maya</h2>
                <p className="text-slate-500">Live Video & Voice • Emotional Support • Multi-lingual</p>
             </div>
             <LiveView apiKey={apiKey} />
          </div>
        ) : (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-light text-slate-100">Deep Advice</h2>
                <p className="text-slate-500">Complex Reasoning • Relationship Coaching • Text Mode</p>
             </div>
            <DeepChat apiKey={apiKey} />
          </div>
        )}
      </main>
      
      <footer className="fixed bottom-0 w-full py-2 bg-slate-950/80 backdrop-blur text-center text-[10px] text-slate-600 border-t border-slate-900">
        Powered by Gemini 2.5 Live API & Gemini 3.0 Pro
      </footer>
    </div>
  );
}

export default App;