
import React from 'react';
import { useGame } from '../contexts/GameContext';

export const RevealCountdown: React.FC = () => {
  const { gameState } = useGame();

  if (gameState.revealCountdown === null) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Revelando votos em...
        </h3>
        <div className="text-6xl font-bold text-blue-600 animate-pulse">
          {gameState.revealCountdown}
        </div>
      </div>
    </div>
  );
};
