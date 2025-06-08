
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
      console.log('ID da sala é obrigatório para buscar participantes');
      return [];
    }

    try {
      console.log('Buscando participantes da sala:', roomId);
      const response = await ApiService.rooms.getParticipants(roomId);

      // Verifica se a resposta foi bem-sucedida
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('Falha ao buscar participantes da API, mantendo lista atual');
        return gameState.users;
      }

      const participantsData: UserDto[] = 'data' in response ? response.data : response;
      
      if (!Array.isArray(participantsData)) {
        console.error('Resposta da API não é um array:', participantsData);
        return gameState.users;
      }

      console.log('Dados brutos dos participantes da API:', participantsData);

      // Converte os dados da API para o formato interno
      const participants: User[] = participantsData.map(participant => {
        const isProductOwner = participant.role === 'ProductOwner';
        const user: User = {
          id: participant.id,
          name: participant.displayName || 'Nome não disponível',
          isModerator: isProductOwner, // PO é sempre moderador
          isProductOwner: isProductOwner,
          hasVoted: false, // Será atualizado pelo sistema de votação
        };
        console.log('Participante convertido:', user);
        return user;
      });

      console.log('Participantes convertidos:', participants);
      console.log('Total de participantes:', participants.length);
      console.log('Product Owners encontrados:', participants.filter(p => p.isProductOwner).length);

      // Atualiza o estado com os participantes
      setGameState(prev => {
        console.log('Atualizando estado - participantes anteriores:', prev.users.length);
        console.log('Atualizando estado - novos participantes:', participants.length);
        
        return {
          ...prev,
          users: participants,
        };
      });

      return participants;
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      // Em caso de erro, não mostra toast para não spam o usuário
      // handleError(error);
      return gameState.users;
    }
  }, [gameState.users, handleApiResponse, setGameState]);

  return { fetchParticipants };
};
