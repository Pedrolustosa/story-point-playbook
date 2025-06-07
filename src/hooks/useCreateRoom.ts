
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
  const { handleError, handleSuccess } = useErrorHandler();

  const createRoom = useCallback(async (userName: string) => {
    if (!userName.trim()) {
      handleError('Nome de usuário é obrigatório', 'Validação');
      return;
    }

    console.log('Creating room for user:', userName);
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
    
    setIsCreatingRoom(true);
    
    try {
      const roomData = {
        name: `Sala de ${userName}`,
        createdBy: userName,
        scale: VotingScale.Fibonacci,
        timeLimit: 0,
        autoReveal: false,
      };
      
      console.log('Sending room creation request with data:', roomData);
      
      const response = await ApiService.rooms.createRoom(roomData);
      console.log('Room created successfully:', response);
      
      // Extract the actual room data from the response
      const room: RoomDto = 'data' in response ? response.data : response;
      
      console.log('Processed room data:', room);
      
      if (!room || !room.id) {
        console.error('API response is invalid:', room);
        throw new Error('Resposta inválida da API: dados da sala ausentes');
      }
      
      const newUser: User = {
        id: room.createdBy?.id || userName,
        name: room.createdBy?.displayName || userName,
        isModerator: true,
        isProductOwner: true,
        hasVoted: false,
      };

      console.log('Setting game state with room:', room);
      console.log('New user:', newUser);

      setGameState(prev => ({
        ...prev,
        roomCode: room.code,
        roomId: room.id,
        users: [newUser],
        currentUser: newUser,
      }));

      handleSuccess('Sala criada com sucesso!', `Código da sala: ${room.code}`);

      // Fetch all participants after creating the room
      console.log('Fetching participants after room creation');
      setTimeout(() => fetchParticipants(room.id), 1000);
      
    } catch (error) {
      console.error('Error creating room:', error);
      const appError = handleError(error, 'Erro ao criar sala');
      
      // Only fallback to local mode if it's a network error
      if (appError.code === 'NETWORK_ERROR') {
        console.log('Falling back to local mode due to network error');
        
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

        handleSuccess('Sala criada em modo local', `Código da sala: ${roomCode}`);
      }
    } finally {
      setIsCreatingRoom(false);
    }
  }, [setGameState, fetchParticipants, handleError, handleSuccess]);

  return { createRoom, isCreatingRoom };
};
