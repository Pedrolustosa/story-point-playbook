
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { HomePage } from '../components/home/HomePage';
import { GameRoom } from '../components/game/GameRoom';

const Index: React.FC = () => {
  const { gameState } = useGame();
  const navigate = useNavigate();
  
  console.log('Index rendering with gameState:', gameState);

  // Redireciona para a sala quando temos roomCode
  useEffect(() => {
    if (gameState.roomCode && gameState.currentUser) {
      console.log('Redirecionando para game room:', gameState.roomCode);
      // Em vez de renderizar condicionalmente, vamos mostrar a GameRoom diretamente
    }
  }, [gameState.roomCode, gameState.currentUser, navigate]);
  
  return gameState.roomCode && gameState.currentUser ? <GameRoom /> : <HomePage />;
};

export default Index;
