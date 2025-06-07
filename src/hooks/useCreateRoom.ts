
import { useCallback, useState } from 'react';
import { ApiService } from '../services/api';
import { VotingScale, RoomDto } from '../services/api/types';
import { User, GameState } from '../types/game';
import { generateRoomCode } from '../utils/gameUtils';
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
      
      const room: RoomDto = 'data' in response ? response.data : response;
      
      if (!room || !room.id) {
        throw new Error('Resposta inválida da API: dados da sala ausentes');
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

      handleApiResponse(response);
      setTimeout(() => fetchParticipants(room.id), 1000);
      
    } catch (error) {
      const appError = handleError(error);
      
      if (appError.code === 'NETWORK_ERROR') {
        const roomCode = generateRoomCode();
        const newUser: User = {
          id: '1',
          name: userName,
          isModerator: true,
          isProductOwner: true,
          hasVoted: false,
        };

        setGameState(prev => ({
          ...prev,
          roomCode,
          roomId: roomCode,
          users: [newUser],
          currentUser: newUser,
        }));
      }
    } finally {
      setIsCreatingRoom(false);
    }
  }, [setGameState, fetchParticipants, handleError, handleApiResponse]);

  return { createRoom, isCreatingRoom };
};
