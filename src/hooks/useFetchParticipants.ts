
import { useCallback } from 'react';
import { User, GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';

export const useFetchParticipants = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const { handleError, handleApiResponse } = useErrorHandler();

  const fetchParticipants = useCallback(async (roomId: string) => {
    if (!roomId) {
      handleError('ID da sala é obrigatório');
      return [];
    }

    try {
      console.log('Buscando participantes da sala:', roomId);
      const response = await ApiService.rooms.getParticipants(roomId);

      // Verifica se a resposta foi bem-sucedida
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        return gameState.users;
      }

      const participantsData: UserDto[] = 'data' in response ? response.data : response;
      
      if (!Array.isArray(participantsData)) {
        console.error('Resposta da API não é um array:', participantsData);
        return gameState.users;
      }

      // Converte os dados da API para o formato interno
      const participants: User[] = participantsData.map(participant => ({
        id: participant.id,
        name: participant.displayName,
        isModerator: participant.role === 'ProductOwner',
        isProductOwner: participant.role === 'ProductOwner',
        hasVoted: false, // Será atualizado pelo sistema de votação
      }));

      console.log('Participantes obtidos da API:', participants);

      // Atualiza o estado com os participantes
      setGameState(prev => ({
        ...prev,
        users: participants,
      }));

      return participants;
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      handleError(error);
      return gameState.users;
    }
  }, [gameState.users, handleError, handleApiResponse, setGameState]);

  return { fetchParticipants };
};
