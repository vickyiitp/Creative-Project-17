import React, { useEffect, useState } from 'react';
import { GameStatus } from '../types';
import { BATTERY_MAX } from '../constants';

interface UIOverlayProps {
  status: GameStatus;
  currentLevel: number;
  battery: number;
  darknessActive: boolean;
  onStart: () => void;
  onNextLevel: () => void;
  onRestart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  status,
  currentLevel,
  battery,
  darknessActive,
  onStart,
  onNextLevel,
  onRestart
}) => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const onTouchStart = () => setIsTouch(true);
    window.addEventListener('touchstart', onTouchStart);
    return () => window.removeEventListener('touchstart', onTouchStart);
  }, []);

  const dispatchKey = (code: string, type: 'virtual-keydown' | 'virtual-keyup') => {
      const event = new CustomEvent(type, { detail: { code } });
      window.dispatchEvent(event);
  };

  const handleControl = (code: string) => ({
      onMouseDown: () => dispatchKey(code, 'virtual-keydown'),
      onMouseUp: () => dispatchKey(code, 'virtual-keyup'),
      onMouseLeave: () => dispatchKey(code, 'virtual-keyup'),
      onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); dispatchKey(code, 'virtual-keydown'); },
      onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); dispatchKey(code, 'virtual-keyup'); }
  });

  return (
    <>
      {/* Global CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.4)_100%)]"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-40">
        {/* Top HUD */}
        <div className="flex justify-between items-start w-full">
          <div className="text-white font-mono pointer-events-auto bg-black/40 p-2 px-4 rounded border border-cyan-900/50 backdrop-blur-sm">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-cyan-400 font-display drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
              SHADOW<span className="text-white">OP</span>
            </h1>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-cyan-600 font-bold tracking-[0.2em]">SECTOR-{currentLevel.toString().padStart(2, '0')}</p>
            </div>
          </div>
          
          {/* Battery Indicator */}
          <div className="flex flex-col items-end pointer-events-auto">
              <div className="flex flex-col items-end space-y-1 bg-black/40 p-3 rounded border border-cyan-900/50 backdrop-blur-sm">
                  <span className={`text-[10px] font-bold tracking-[0.2em] ${darknessActive ? 'text-cyan-300 animate-pulse' : 'text-gray-500'}`}>
                      {darknessActive ? 'CLOAK ENGAGED' : 'CLOAK STANDBY'}
                  </span>
                  <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden relative">
                          <div 
                              className={`h-full transition-all duration-300 ease-out shadow-[0_0_10px_currentColor] ${battery < 20 ? 'bg-red-500 text-red-500' : 'bg-cyan-400 text-cyan-400'}`}
                              style={{ width: `${(battery / BATTERY_MAX) * 100}%` }}
                          />
                      </div>
                      <span className="text-xs font-mono text-cyan-500">{Math.round(battery)}%</span>
                  </div>
              </div>
          </div>
        </div>

        {/* Center Menus */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          {status === GameStatus.MENU && (
            <div className="bg-black/90 p-8 border border-cyan-500 text-center rounded pointer-events-auto shadow-[0_0_50px_rgba(0,243,255,0.2)] backdrop-blur-xl max-w-sm mx-4 transform transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_10px_#0ff]"></div>
              <h2 className="text-5xl font-black text-white mb-2 tracking-tighter italic font-display glitch-text">
                  INIT
              </h2>
              <p className="text-cyan-400/80 mb-8 text-xs font-mono tracking-widest uppercase border-t border-b border-cyan-900/50 py-2">
                Tactical Stealth Simulator
              </p>
              <button 
                  onClick={onStart}
                  className="w-full px-8 py-3 bg-cyan-900/30 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500 font-bold transition-all duration-200 uppercase tracking-[0.2em] text-sm shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]"
              >
                Execute Mission
              </button>
            </div>
          )}

          {status === GameStatus.GAME_OVER && (
            <div className="bg-black/90 p-8 border border-red-600 text-center rounded pointer-events-auto shadow-[0_0_50px_rgba(255,0,0,0.3)] backdrop-blur-xl max-w-sm mx-4 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_10px_#f00]"></div>
              <h2 className="text-5xl font-black text-red-600 mb-2 font-display tracking-tighter">FATAL</h2>
              <p className="text-red-400/80 mb-8 font-mono text-xs uppercase tracking-widest border-y border-red-900/50 py-2">Signal Lost</p>
              <button 
                  onClick={onRestart}
                  className="w-full px-8 py-3 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-black border border-red-600 font-bold transition-colors uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]"
              >
                Retry
              </button>
            </div>
          )}

          {status === GameStatus.LEVEL_COMPLETE && (
            <div className="bg-black/90 p-8 border border-emerald-500 text-center rounded pointer-events-auto shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-xl max-w-sm mx-4 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <h2 className="text-4xl font-black text-emerald-500 mb-2 font-display">CLEARED</h2>
              <p className="text-emerald-400/80 mb-8 font-mono text-xs uppercase tracking-widest border-y border-emerald-900/50 py-2">Sector Secured</p>
              <button 
                  onClick={onNextLevel}
                  className="w-full px-8 py-3 bg-emerald-900/30 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500 font-bold transition-colors uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
              >
                Proceed
              </button>
            </div>
          )}

          {status === GameStatus.VICTORY && (
              <div className="bg-black/90 p-8 border border-blue-500 text-center rounded pointer-events-auto shadow-[0_0_50px_rgba(59,130,246,0.3)] backdrop-blur-xl max-w-sm mx-4 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                <h2 className="text-4xl font-black text-blue-500 mb-4 font-display">PHANTOM</h2>
                <p className="text-blue-300/80 mb-8 font-mono text-xs uppercase tracking-widest border-y border-blue-900/50 py-2">
                    All Objectives Complete
                </p>
                <button 
                    onClick={onRestart}
                    className="w-full px-8 py-3 bg-blue-900/30 hover:bg-blue-500 text-blue-400 hover:text-black border border-blue-500 font-bold transition-colors uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
                >
                  Reset System
                </button>
              </div>
            )}
        </div>

        {/* Mobile Touch Controls */}
        <div className={`fixed bottom-8 left-0 right-0 px-8 flex justify-between items-end pointer-events-none md:hidden ${status === GameStatus.PLAYING ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            {/* D-Pad */}
            <div className="relative w-36 h-36 pointer-events-auto opacity-80">
                <button className="absolute top-0 left-12 w-12 h-12 bg-black/60 rounded-t-lg border border-cyan-800/50 active:bg-cyan-500 active:border-cyan-400 transition-colors backdrop-blur-sm" {...handleControl('ArrowUp')}>
                  <svg className="w-6 h-6 mx-auto text-cyan-500 active:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button className="absolute bottom-0 left-12 w-12 h-12 bg-black/60 rounded-b-lg border border-cyan-800/50 active:bg-cyan-500 active:border-cyan-400 transition-colors backdrop-blur-sm" {...handleControl('ArrowDown')}>
                  <svg className="w-6 h-6 mx-auto text-cyan-500 active:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>
                </button>
                <button className="absolute left-0 top-12 w-12 h-12 bg-black/60 rounded-l-lg border border-cyan-800/50 active:bg-cyan-500 active:border-cyan-400 transition-colors backdrop-blur-sm" {...handleControl('ArrowLeft')}>
                  <svg className="w-6 h-6 mx-auto text-cyan-500 active:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="absolute right-0 top-12 w-12 h-12 bg-black/60 rounded-r-lg border border-cyan-800/50 active:bg-cyan-500 active:border-cyan-400 transition-colors backdrop-blur-sm" {...handleControl('ArrowRight')}>
                  <svg className="w-6 h-6 mx-auto text-cyan-500 active:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Action Button */}
            <div className="pointer-events-auto opacity-90 mb-2">
                <button 
                  className="w-20 h-20 rounded-full bg-cyan-900/30 border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:bg-cyan-500 active:shadow-[0_0_30px_rgba(6,182,212,0.8)] flex items-center justify-center transition-all backdrop-blur-md"
                  {...handleControl('Space')}
                >
                    <span className="font-bold text-cyan-100 text-xs tracking-widest active:text-black">CLOAK</span>
                </button>
            </div>
        </div>

        {/* Footer Controls Hint (Desktop) */}
        <div className="hidden md:block absolute bottom-4 w-full text-center text-cyan-800/60 text-[10px] font-mono tracking-[0.3em] pointer-events-none uppercase">
          [WASD] Movement • [SPACE] Active Camouflage
        </div>
      </div>
    </>
  );
};

export default UIOverlay;