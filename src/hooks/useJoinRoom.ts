
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

    console.log('Entrando na sala:', roomCode, 'com usuário:', userName);

    try {
      const response = await ApiService.rooms.joinRoom(roomCode, {
        displayName: userName,
        role: 'Developer',
      });

      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        return;
      }

      const userData: UserDto = 'data' in response ? response.data : response;
      console.log('Usuário entrou na sala com sucesso:', userData);
      
      if (!userData || !userData.id) {
        handleError('Resposta inválida da API: dados do usuário ausentes');
        return;
      }

      const roomId = userData.roomId;

      if (!roomId) {
        handleError('ID da sala não encontrado na resposta da API');
        return;
      }

      // Criar o usuário atual imediatamente
      const currentUser: User = {
        id: userData.id,
        name: userData.displayName,
        isModerator: false,
        isProductOwner: userData.role === 'ProductOwner',
        hasVoted: false,
      };

      // Atualiza o estado imediatamente para permitir redirecionamento
      console.log('Atualizando estado para permitir redirecionamento imediato');
      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomId,
        currentUser: currentUser,
        users: [currentUser], // Adiciona pelo menos o usuário atual
      }));

      // Buscar outros participantes com delay menor para não conflitar com SignalR
      setTimeout(async () => {
        try {
          console.log('Buscando participantes completos após entrar na sala:', roomId);
          await fetchParticipants(roomId);
        } catch (error) {
          console.error('Erro ao buscar participantes após entrar:', error);
          // Mantém pelo menos o usuário atual se a busca falhar
        }
      }, 1500); // Reduzido para 1.5 segundos
      
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      handleError(error);
    }
  }, [setGameState, fetchParticipants, handleError, handleApiResponse]);

  return { joinRoom };
};
