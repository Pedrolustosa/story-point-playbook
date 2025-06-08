
import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { HomePage } from '../components/home/HomePage';
import { GameRoom } from '../components/game/GameRoom';

const Index: React.FC = () => {
  const { gameState } = useGame();
  
  console.log('Index rendering with gameState:', gameState);
  console.log('Has roomCode:', !!gameState.roomCode);
  console.log('Has currentUser:', !!gameState.currentUser);
  console.log('Current user details:', gameState.currentUser);
  console.log('Should show GameRoom:', !!(gameState.roomCode && gameState.currentUser));

  // Log when we have the required data
  useEffect(() => {
    if (gameState.roomCode && gameState.currentUser) {
      console.log('✅ Dados completos para GameRoom:', {
        roomCode: gameState.roomCode,
        currentUser: gameState.currentUser,
        users: gameState.users
      });
    } else {
      console.log('❌ Dados insuficientes para GameRoom:', {
        roomCode: gameState.roomCode,
        currentUser: gameState.currentUser
      });
    }
  }, [gameState.roomCode, gameState.currentUser]);
  
  // Renderiza GameRoom se temos roomCode e currentUser
  const shouldShowGameRoom = gameState.roomCode && gameState.currentUser;
  console.log('Rendering decision - shouldShowGameRoom:', shouldShowGameRoom);
  
  return shouldShowGameRoom ? <GameRoom /> : <HomePage />;
};

export default Index;
