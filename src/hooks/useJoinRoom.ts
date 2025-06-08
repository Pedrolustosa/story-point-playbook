
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

      // Só procede se a API retornar sucesso
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

      // Primeiro, atualiza o estado com as informações básicas
      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomId,
        users: [], // Limpa a lista para buscar da API
        currentUser: null, // Será definido após buscar os participantes
      }));

      console.log('Estado básico atualizado, buscando participantes...');

      // Buscar participantes imediatamente após entrar na sala
      setTimeout(async () => {
        try {
          console.log('Buscando participantes após entrar na sala:', roomId);
          const participants = await fetchParticipants(roomId);
          
          // Encontra o usuário atual na lista de participantes
          const currentUserFromApi = participants.find(p => 
            p.id === userData.id || p.name === userData.displayName
          );
          
          if (currentUserFromApi) {
            console.log('Usuário atual encontrado nos participantes:', currentUserFromApi);
            setGameState(prev => ({
              ...prev,
              currentUser: currentUserFromApi,
            }));
          } else {
            console.log('Usuário atual não encontrado, criando localmente');
            // Fallback: criar usuário local se não encontrado na API
            const fallbackUser: User = {
              id: userData.id,
              name: userData.displayName,
              isModerator: false,
              isProductOwner: userData.role === 'ProductOwner',
              hasVoted: false,
            };
            
            setGameState(prev => ({
              ...prev,
              currentUser: fallbackUser,
              users: [...prev.users, fallbackUser],
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar participantes após entrar:', error);
          // Fallback: criar usuário local em caso de erro
          const fallbackUser: User = {
            id: userData.id,
            name: userData.displayName,
            isModerator: false,
            isProductOwner: userData.role === 'ProductOwner',
            hasVoted: false,
          };
          
          setGameState(prev => ({
            ...prev,
            currentUser: fallbackUser,
            users: [fallbackUser],
          }));
        }
      }, 500);
      
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      handleError(error);
    }
  }, [setGameState, fetchParticipants, handleError, handleApiResponse]);

  return { joinRoom };
};
