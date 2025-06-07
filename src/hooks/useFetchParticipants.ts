
import { useCallback } from 'react';
import { User, GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';

export const useFetchParticipants = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const { handleError } = useErrorHandler();

  const fetchParticipants = useCallback(async (roomId: string) => {
    if (!roomId) {
      handleError('ID da sala é obrigatório');
      return [];
    }

    // Como a rota de participantes não existe, vamos retornar os usuários atuais
    console.log('fetchParticipants chamado, mas a rota não existe. Retornando usuários atuais.');
    return gameState.users;
  }, [gameState.users, handleError]);

  return { fetchParticipants };
};
