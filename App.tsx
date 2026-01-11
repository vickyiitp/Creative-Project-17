
import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameStatus } from './types';
import { LEVELS } from './data/levels';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [battery, setBattery] = useState(100);
  const [darknessActive, setDarknessActive] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const startGame = () => {
    setCurrentLevelIndex(0);
    setStatus(GameStatus.PLAYING);
    setRetryKey(0);
  };

  const nextLevel = () => {
    if (currentLevelIndex + 1 < LEVELS.length) {
      setCurrentLevelIndex(prev => prev + 1);
      setStatus(GameStatus.PLAYING);
      setRetryKey(0);
    } else {
      setStatus(GameStatus.VICTORY);
    }
  };

  const handleRestart = () => {
      setRetryKey(k => k + 1);
      if (status === GameStatus.VICTORY) {
          setCurrentLevelIndex(0);
      }
      setStatus(GameStatus.PLAYING);
  };

  return (
    // Removed bg-neutral-950 to let game.html background show
    <div className="fixed inset-0 flex items-center justify-center font-sans select-none overflow-hidden touch-none p-4">
      {/* Game Container: Maintains 4:3 Aspect Ratio but scales down on smaller screens */}
      <div className="relative w-full max-w-[800px] aspect-[4/3] max-h-[90vh] shadow-2xl shadow-black/80">
        
        {/* Game World */}
        <GameCanvas 
          key={`${currentLevelIndex}-${retryKey}`}
          level={LEVELS[currentLevelIndex]}
          status={status}
          onStatusChange={setStatus}
          onBatteryUpdate={setBattery}
          onDarknessToggle={setDarknessActive}
        />

        {/* UI HUD */}
        <UIOverlay 
          status={status}
          currentLevel={currentLevelIndex + 1}
          battery={battery}
          darknessActive={darknessActive}
          onStart={startGame}
          onNextLevel={nextLevel}
          onRestart={handleRestart}
        />

      </div>
    </div>
  );
};

export default App;
