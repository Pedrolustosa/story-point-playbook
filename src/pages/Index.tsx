
import React from 'react';
import { GameProvider, useGame } from '../contexts/GameContext';
import { HomePage } from '../components/home/HomePage';
import { GameRoom } from '../components/game/GameRoom';

const AppContent: React.FC = () => {
  const { gameState } = useGame();
  
  console.log('AppContent rendering with gameState:', gameState);
  
  return gameState.roomCode ? <GameRoom /> : <HomePage />;
};

const Index: React.FC = () => {
  return (
    <div>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </div>
  );
};

export default Index;
