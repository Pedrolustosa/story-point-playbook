
import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { HomePage } from '../components/home/HomePage';
import { GameRoom } from '../components/game/GameRoom';

const Index: React.FC = () => {
  // Proteção para verificar se o contexto está disponível
  let gameState, gameContext;
  
  try {
    gameContext = useGame();
    gameState = gameContext.gameState;
  } catch (error) {
    console.error('GameContext not available:', error);
    // Renderiza um componente de loading ou erro se o contexto não estiver disponível
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não temos gameState, mostra loading
  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    );
  }
  
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
