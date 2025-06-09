
import { useCallback, useState } from 'react';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';
import { User, GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';
import { useNavigate } from 'react-router-dom';

export const useCreateRoom = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const { handleError, handleApiResponse } = useErrorHandler();
  const navigate = useNavigate();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const createRoom = useCallback(async (moderatorName: string) => {
    console.log('Criando sala para:', moderatorName);

    if (!moderatorName.trim()) {
      handleError('Nome do moderador é obrigatório');
      return;
    }

    setIsCreatingRoom(true);

    try {
      // Create room with the moderator name
      const createRoomResponse = await ApiService.rooms.createRoom({
        name: `Sala de ${moderatorName}`,
        createdBy: moderatorName, // Este campo é obrigatório para criar a sala
        scale: 0, // Fibonacci
        timeLimit: 0,
        autoReveal: false,
      });

      const roomResult = handleApiResponse(createRoomResponse);
      if (!roomResult) {
        return;
      }

      const roomData = 'data' in createRoomResponse ? createRoomResponse.data : createRoomResponse;
      console.log('Sala criada com sucesso:', roomData);

      if (!roomData.id || !roomData.code) {
        handleError('Resposta inválida da API: dados da sala ausentes');
        return;
      }

      // Agora entrar na sala recém-criada como moderador
      console.log('Entrando na sala criada como moderador:', roomData.code);
      const joinResponse = await ApiService.rooms.joinRoom(roomData.code, {
        displayName: moderatorName, // Importante: usar displayName aqui
        role: 'Moderator',
      });

      const joinResult = handleApiResponse(joinResponse);
      if (!joinResult) {
        return;
      }

      const userData: UserDto = 'data' in joinResponse ? joinResponse.data : joinResponse;
      console.log('Usuário criado/atualizado após join:', userData);

      // Create the current user with the name from the API response
      const currentUser: User = {
        id: userData.id,
        name: userData.name || moderatorName, // Usar name da resposta ou fallback
        isModerator: true,
        isProductOwner: true,
        hasVoted: false,
      };

      console.log('Estado da sala atualizado, buscando participantes...');

      // Update game state immediately
      setGameState(prev => ({
        ...prev,
        roomCode: roomData.code.toUpperCase(),
        roomId: roomData.id,
        currentUser: currentUser,
        users: [currentUser], // Adiciona pelo menos o usuário atual
      }));

      // Navigate to main page
      navigate('/');

      // Fetch participants after a delay to ensure the API is ready
      setTimeout(async () => {
        try {
          console.log('Buscando participantes da sala criada:', roomData.id);
          await fetchParticipants(roomData.id);
        } catch (error) {
          console.error('Erro ao buscar participantes após criar sala:', error);
        }
      }, 1500);

    } catch (error) {
      console.error('Erro ao criar sala:', error);
      handleError(error);
    } finally {
      setIsCreatingRoom(false);
    }
  }, [setGameState, fetchParticipants, handleError, handleApiResponse, navigate]);

  return { createRoom, isCreatingRoom };
};
