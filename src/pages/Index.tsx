
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { HomePage } from '../components/home/HomePage';
import { GameRoom } from '../components/game/GameRoom';

const Index: React.FC = () => {
  const { gameState } = useGame();
  const navigate = useNavigate();
  
  console.log('Index rendering with gameState:', gameState);
  console.log('Has roomCode:', !!gameState.roomCode);
  console.log('Has currentUser:', !!gameState.currentUser);
  console.log('Should show GameRoom:', !!(gameState.roomCode && gameState.currentUser));

  // Redireciona para a sala quando temos roomCode
  useEffect(() => {
    if (gameState.roomCode && gameState.currentUser) {
      console.log('Redirecionando para game room:', gameState.roomCode);
      console.log('Current user:', gameState.currentUser);
    } else {
      console.log('Não redirecionando - dados insuficientes:', {
        roomCode: gameState.roomCode,
        currentUser: gameState.currentUser
      });
    }
  }, [gameState.roomCode, gameState.currentUser, navigate]);
  
  // Renderiza GameRoom se temos roomCode e currentUser
  const shouldShowGameRoom = gameState.roomCode && gameState.currentUser;
  console.log('Rendering decision - shouldShowGameRoom:', shouldShowGameRoom);
  
  return shouldShowGameRoom ? <GameRoom /> : <HomePage />;
};

export default Index;
