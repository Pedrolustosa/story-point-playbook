
import React from 'react';
import { GameProvider, useGame } from '../contexts/GameContext';
import { HomePage } from '../components/HomePage';
import { GameRoom } from '../components/GameRoom';

const AppContent: React.FC = () => {
  const { gameState } = useGame();
  
  return gameState.roomCode ? <GameRoom /> : <HomePage />;
};

const Index = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default Index;
