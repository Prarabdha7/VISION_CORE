import React, { useState, useEffect } from 'react';

// !!! CHANGE THIS IP TO MATCH YOUR ASUS TUF LOCAL NETWORK IP !!!
const BACKEND_IP = "192.168.1.19"; 
const BACKEND_URL = `http://${BACKEND_IP}:8000`;

function App() {
  const [activeFilter, setActiveFilter] = useState('dim');
  const [serverStatus, setServerStatus] = useState('Checking...');

  // Poll server state on startup to verify connectivity
  useEffect(() => {
    fetch(`${BACKEND_URL}/status`)
      .then(res => res.json())
      .then(data => {
        setServerStatus('ONLINE');
        setActiveFilter(data.active_filter);
      })
      .catch(err => {
        console.error("Failed to ping processing backend:", err);
        setServerStatus('OFFLINE/UNREACHABLE');
      });
  }, []);

  // Send an async REST API request to update background calculations on Machine A
  const changeFilter = async (filterMode) => {
    try {
      const response = await fetch(`${BACKEND_URL}/set_filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter_mode: filterMode }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setActiveFilter(data.active_filter);
      }
    } catch (error) {
      console.error("Error dispatching state change:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-gray-100 p-6 flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            VISION_CORE // Edge Matrix
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Distributed Cross-Platform Stream Panel</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 px-4 py-2 rounded-xl backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${serverStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          <span className="text-xs font-mono text-gray-400 tracking-wider">NODE_A: {serverStatus}</span>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow mb-6">
        
        {/* Large Bento Box: Live Video Monitor Frame */}
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800/80 rounded-3xl overflow-hidden shadow-2xl relative flex items-center justify-center min-h-[480px]">
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">LIVE_FEED // 30_FPS_TARGET</p>
          </div>
          
          {serverStatus === 'ONLINE' ? (
            <img 
              src={`${BACKEND_URL}/video_feed`} 
              className="w-full h-full object-cover" 
              alt="Live Filter Stream" 
            />
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-500 font-mono text-sm mb-2">Awaiting network connection from processing node...</p>
              <p className="text-xs text-gray-600 bg-gray-950 p-3 rounded-lg font-mono">Targeting endpoint: {BACKEND_URL}/video_feed</p>
            </div>
          )}
        </div>

        {/* Right Side Bento Column */}
        <div className="flex flex-col gap-6">
          
          {/* Glassmorphic Control Box */}
          <div className="bg-gradient-to-b from-gray-900/60 to-gray-900/20 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex-grow">
            <h2 className="text-lg font-semibold mb-1 text-white">Matrix Controls</h2>
            <p className="text-xs text-gray-400 mb-6">Select a transformation matrix to isolate your background profile.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'normal', name: 'Normal Pass', desc: 'Raw feed with unmodified pixels.' },
                { id: 'dim', name: 'Background Dimmer', desc: 'Multiplies background brightness by 0.3.' },
                { id: 'blur', name: 'Gaussian Blur', desc: 'Convolves pixel arrays with a 25x25 kernel.' },
                { id: 'pixelate', name: 'Pixel Mosaic', desc: 'Down-samples background to 16px blocks.' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => changeFilter(filter.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                    activeFilter === filter.id 
                      ? 'bg-blue-600/10 border-blue-500/80 shadow-md shadow-blue-500/5' 
                      : 'bg-gray-950/40 border-gray-800/60 hover:border-gray-700 hover:bg-gray-900/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${activeFilter === filter.id ? 'text-blue-400' : 'text-gray-200'}`}>
                      {filter.name}
                    </span>
                    {activeFilter === filter.id && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-2 py-0.5 rounded-full border border-blue-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{filter.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostics Architecture Info Card Box */}
          <div className="bg-gray-900/30 border border-gray-800/50 rounded-3xl p-5 font-mono text-[11px] text-gray-500 flex flex-col gap-2">
            <div className="flex justify-between border-b border-gray-800/80 pb-2">
              <span>NODE_A RX (ASUS):</span>
              <span className="text-gray-400">NVIDIA RTX 3050 CUDA</span>
            </div>
            <div className="flex justify-between border-b border-gray-800/80 pb-2">
              <span>NODE_B TX (MAC):</span>
              <span className="text-gray-400">APPLE M4 SILICON</span>
            </div>
            <div className="flex justify-between">
              <span>PIPELINE DUCT:</span>
              <span className="text-gray-400">MJPEG OVER HTTP REST</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest border-t border-gray-900 pt-4">
        Distributed Cluster System Engine // 2026
      </footer>
    </div>
  );
}

export default App;