
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

      const userData: UserDto = 'data' in response ? response.data : response;
      
      if (!userData || !userData.id) {
        throw new Error('Resposta inválida da API: dados do usuário ausentes');
      }

      const roomId = userData.roomId;

      if (!roomId) {
        throw new Error('ID da sala não encontrado na resposta da API');
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

      handleApiResponse(response);
      await fetchParticipants(roomId);
      
    } catch (error) {
      const appError = handleError(error);
      
      if (appError.code === 'NETWORK_ERROR') {
        const newUser: User = {
          id: Date.now().toString(),
          name: userName,
          isModerator: false,
          isProductOwner: false,
          hasVoted: false,
        };

        setGameState(prev => ({
          ...prev,
          roomCode,
          roomId: roomCode,
          users: [...prev.users, newUser],
          currentUser: newUser,
        }));
      }
    }
  }, [setGameState, fetchParticipants, handleError, handleApiResponse]);

  return { joinRoom };
};
