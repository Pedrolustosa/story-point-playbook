
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';
import { User, GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';

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
      const response = await ApiService.rooms.getParticipants(roomId);
      
      // Só procede se a API retornar sucesso
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        return [];
      }
      
      const usersData: UserDto[] = 'data' in response ? response.data : response;
      
      if (!Array.isArray(usersData)) {
        handleError('Formato inválido de dados dos participantes');
        return [];
      }
      
      const currentUsers = gameState.users;
      const currentUserId = gameState.currentUser?.id;
      
      const users: User[] = usersData.map(userData => {
        const existingUser = currentUsers.find(u => u.id === userData.id);
        const userName = (userData as any).name || existingUser?.name || 'Usuário sem nome';
        
        return {
          id: userData.id,
          name: userName,
          isModerator: userData.role === 'Moderator' || existingUser?.isModerator || false,
          isProductOwner: userData.role === 'ProductOwner',
          hasVoted: gameState.votesRevealed ? false : (existingUser?.hasVoted || false),
          vote: gameState.votesRevealed ? undefined : existingUser?.vote
        };
      });
      
      setGameState(prev => {
        const updatedCurrentUser = currentUserId ? 
          users.find(u => u.id === currentUserId) || prev.currentUser :
          prev.currentUser;
        
        return {
          ...prev,
          users,
          currentUser: updatedCurrentUser
        };
      });
      
      return users;
    } catch (error) {
      handleError(error);
      return [];
    }
  }, [setGameState, gameState.users, gameState.currentUser?.id, gameState.votesRevealed, handleError, handleApiResponse]);

  return { fetchParticipants };
};
