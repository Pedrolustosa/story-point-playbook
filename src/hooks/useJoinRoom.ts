
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';
import { User, GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';

export const useJoinRoom = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const { handleError, handleApiResponse } = useErrorHandler();

  const joinRoom = useCallback(async (roomCode: string, userName: string) => {
    if (!roomCode.trim()) {
      handleError('Código da sala é obrigatório');
      return;
    }

    if (!userName.trim()) {
      handleError('Nome de usuário é obrigatório');
      return;
    }

    try {
      const response = await ApiService.rooms.joinRoom(roomCode, {
        displayName: userName,
        role: 'Developer',
      });

      // Só procede se a API retornar sucesso
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        return;
      }

      const userData: UserDto = 'data' in response ? response.data : response;
      
      if (!userData || !userData.id) {
        handleError('Resposta inválida da API: dados do usuário ausentes');
        return;
      }

      const roomId = userData.roomId;

      if (!roomId) {
        handleError('ID da sala não encontrado na resposta da API');
        return;
      }

      const newUser: User = {
        id: userData.id,
        name: userData.displayName,
        isModerator: false,
        isProductOwner: userData.role === 'ProductOwner',
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomId,
        currentUser: newUser,
      }));

      // Buscar participantes imediatamente após entrar na sala
      setTimeout(async () => {
        try {
          console.log('Buscando participantes após entrar na sala');
          await fetchParticipants(roomId);
        } catch (error) {
          console.log('Erro ao buscar participantes (esperado se endpoint não existir):', error);
        }
      }, 500);
      
    } catch (error) {
      handleError(error);
    }
  }, [setGameState, fetchParticipants, handleError, handleApiResponse]);

  return { joinRoom };
};
