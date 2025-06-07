
import { useCallback, useState } from 'react';
import { ApiService } from '../services/api';
import { VotingScale, RoomDto } from '../services/api/types';
import { User, GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';

export const useCreateRoom = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const { handleError, handleApiResponse } = useErrorHandler();

  const createRoom = useCallback(async (userName: string) => {
    if (!userName.trim()) {
      handleError('Nome de usuário é obrigatório');
      return;
    }
    
    setIsCreatingRoom(true);
    
    try {
      const roomData = {
        name: `Sala de ${userName}`,
        createdBy: userName,
        scale: VotingScale.Fibonacci,
        timeLimit: 0,
        autoReveal: false,
      };
      
      const response = await ApiService.rooms.createRoom(roomData);
      
      // Só procede se a API retornar sucesso
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        return;
      }
      
      const room: RoomDto = 'data' in response ? response.data : response;
      
      if (!room || !room.id) {
        handleError('Resposta inválida da API: dados da sala ausentes');
        return;
      }
      
      const newUser: User = {
        id: room.createdBy?.id || userName,
        name: room.createdBy?.displayName || userName,
        isModerator: true,
        isProductOwner: true,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode: room.code,
        roomId: room.id,
        users: [newUser],
        currentUser: newUser,
      }));

      // Buscar participantes após um pequeno delay para garantir que a sala esteja pronta
      setTimeout(async () => {
        try {
          console.log('Buscando participantes iniciais da sala criada');
          await fetchParticipants(room.id);
        } catch (error) {
          console.log('Erro ao buscar participantes iniciais (esperado se endpoint não existir):', error);
        }
      }, 1000);
      
    } catch (error) {
      handleError(error);
    } finally {
      setIsCreatingRoom(false);
    }
  }, [setGameState, handleError, handleApiResponse, fetchParticipants]);

  return { createRoom, isCreatingRoom };
};
