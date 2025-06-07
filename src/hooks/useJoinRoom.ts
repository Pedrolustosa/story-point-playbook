
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
  const { handleError, handleSuccess } = useErrorHandler();

  const joinRoom = useCallback(async (roomCode: string, userName: string) => {
    if (!roomCode.trim()) {
      handleError('Código da sala é obrigatório', 'Validação');
      return;
    }

    if (!userName.trim()) {
      handleError('Nome de usuário é obrigatório', 'Validação');
      return;
    }

    try {
      console.log('Joining room:', roomCode, 'as:', userName);
      
      const response = await ApiService.rooms.joinRoom(roomCode, {
        displayName: userName,
        role: 'Developer',
      });

      console.log('Joined room successfully:', response);

      // Extract the actual user data from the response
      const userData: UserDto = 'data' in response ? response.data : response;
      
      console.log('Processed user data:', userData);
      
      if (!userData || !userData.id) {
        throw new Error('Resposta inválida da API: dados do usuário ausentes');
      }

      // Use roomId from the user response instead of making another API call
      const roomId = userData.roomId;
      console.log('Using roomId from join response:', roomId);

      if (!roomId) {
        throw new Error('ID da sala não encontrado na resposta da API');
      }

      // Create the new user without knowing moderator status yet
      const newUser: User = {
        id: userData.id,
        name: userData.displayName,
        isModerator: false, // Will be updated when fetching participants
        isProductOwner: userData.role === 'ProductOwner',
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomId,
        currentUser: newUser,
      }));

      handleSuccess('Entrou na sala com sucesso!', `Bem-vindo, ${userName}!`);

      // Fetch all participants after joining the room to get complete info including moderator status
      console.log('Fetching participants after joining room');
      await fetchParticipants(roomId);
      
    } catch (error) {
      console.error('Error joining room:', error);
      const appError = handleError(error, 'Erro ao entrar na sala');
      
      // Only fallback to local mode if it's a network error
      if (appError.code === 'NETWORK_ERROR') {
        console.log('Falling back to local mode due to network error');
        
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

        handleSuccess('Entrou na sala em modo local', `Bem-vindo, ${userName}!`);
      }
    }
  }, [setGameState, fetchParticipants, handleError, handleSuccess]);

  return { joinRoom };
};
