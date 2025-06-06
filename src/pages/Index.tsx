
import React from 'react';
import { GameProvider, useGame } from '../contexts/GameContext';
import { HomePage } from '../components/home/HomePage';
import { GameRoom } from '../components/game/GameRoom';

const Index = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

const AppContent: React.FC = () => {
  const { gameState } = useGame();
  
  return gameState.roomCode ? <GameRoom /> : <HomePage />;
};

export default Index;
