
import { useCallback, useState } from 'react';
import { ApiService } from '../services/api';
import { VotingScale, RoomDto } from '../services/api/types';
import { User, GameState } from '../types/game';
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
    console.log('Criando sala para:', userName);
    
    try {
      const roomData = {
        name: `Sala de ${userName}`,
        createdBy: userName,
        scale: VotingScale.Fibonacci,
        timeLimit: 0,
        autoReveal: false,
      };
      
      const response = await ApiService.rooms.createRoom(roomData);
      
      // Só procede se a API retornar sucesso
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        return;
      }
      
      const room: RoomDto = 'data' in response ? response.data : response;
      console.log('Sala criada com sucesso:', room);
      
      if (!room || !room.id) {
        handleError('Resposta inválida da API: dados da sala ausentes');
        return;
      }
      
      // Primeiro, atualiza o estado com as informações básicas da sala
      setGameState(prev => ({
        ...prev,
        roomCode: room.code,
        roomId: room.id,
        users: [], // Limpa a lista de usuários para buscar da API
        currentUser: null, // Será definido após buscar os participantes
      }));

      console.log('Estado da sala atualizado, buscando participantes...');

      // Buscar participantes imediatamente após criar a sala
      setTimeout(async () => {
        try {
          console.log('Buscando participantes da sala criada:', room.id);
          const participants = await fetchParticipants(room.id);
          
          // Encontra o usuário atual (criador da sala) na lista de participantes
          const currentUserFromApi = participants.find(p => 
            p.name === userName || p.id === userName || p.isModerator || p.isProductOwner
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
              id: room.createdBy?.id || userName,
              name: room.createdBy?.displayName || userName,
              isModerator: true,
              isProductOwner: true,
              hasVoted: false,
            };
            
            setGameState(prev => ({
              ...prev,
              currentUser: fallbackUser,
              users: [fallbackUser, ...prev.users],
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar participantes iniciais:', error);
          // Fallback: criar usuário local em caso de erro
          const fallbackUser: User = {
            id: room.createdBy?.id || userName,
            name: room.createdBy?.displayName || userName,
            isModerator: true,
            isProductOwner: true,
            hasVoted: false,
          };
          
          setGameState(prev => ({
            ...prev,
            currentUser: fallbackUser,
            users: [fallbackUser],
          }));
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      handleError(error);
    } finally {
      setIsCreatingRoom(false);
    }
  }, [setGameState, handleError, handleApiResponse, fetchParticipants]);

  return { createRoom, isCreatingRoom };
};
