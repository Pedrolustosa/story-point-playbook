
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
    console.log('=== INÍCIO DO PROCESSO DE ENTRAR NA SALA ===');
    console.log('Código da sala:', roomCode);
    console.log('Nome do usuário:', userName);

    if (!roomCode.trim()) {
      handleError('Código da sala é obrigatório');
      return;
    }

    if (!userName.trim()) {
      handleError('Nome de usuário é obrigatório');
      return;
    }

    try {
      console.log('Fazendo chamada para API - joinRoom');
      const response = await ApiService.rooms.joinRoom(roomCode, {
        displayName: userName,
        role: 'Developer',
      });

      console.log('Resposta da API recebida:', response);

      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('handleApiResponse retornou false - parando execução');
        return;
      }

      const userData: UserDto = 'data' in response ? response.data : response;
      console.log('Dados do usuário extraídos:', userData);
      
      if (!userData || !userData.id) {
        handleError('Resposta inválida da API: dados do usuário ausentes');
        return;
      }

      const roomId = userData.roomId;
      console.log('Room ID extraído:', roomId);

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

      console.log('Usuário atual criado:', currentUser);

      // Atualiza o estado imediatamente para permitir redirecionamento
      console.log('=== ATUALIZANDO ESTADO PARA REDIRECIONAMENTO ===');
      const newState = {
        roomCode: roomCode.trim().toUpperCase(),
        roomId: roomId,
        currentUser: currentUser,
        users: [currentUser], // Adiciona pelo menos o usuário atual
      };
      console.log('Novo estado que será definido:', newState);

      setGameState(prev => {
        const updatedState = {
          ...prev,
          ...newState
        };
        console.log('Estado anterior:', prev);
        console.log('Estado atualizado:', updatedState);
        return updatedState;
      });

      console.log('Estado atualizado com sucesso - usuário deve ser redirecionado');

      // Buscar outros participantes com delay menor para não conflitar com SignalR
      setTimeout(async () => {
        try {
          console.log('Buscando participantes completos após entrar na sala:', roomId);
          await fetchParticipants(roomId);
        } catch (error) {
          console.error('Erro ao buscar participantes após entrar:', error);
          // Mantém pelo menos o usuário atual se a busca falhar
        }
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      handleError(error);
    }
  }, [setGameState, fetchParticipants, handleError, handleApiResponse]);

  return { joinRoom };
};
