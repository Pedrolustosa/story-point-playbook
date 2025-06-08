
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { HomePage } from '../components/home/HomePage';
import { GameRoom } from '../components/game/GameRoom';

const Index: React.FC = () => {
  const { gameState } = useGame();
  
  console.log('Index rendering with gameState:', gameState);
  
  return gameState.roomCode ? <GameRoom /> : <HomePage />;
};

export default Index;
