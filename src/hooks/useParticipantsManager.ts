
import { useCallback, useRef, useState } from 'react';
import { User, GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';

export const useParticipantsManager = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const { handleError, handleApiResponse } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const cacheRef = useRef<{ roomId: string; participants: User[]; timestamp: number } | null>(null);
  
  // Configurações de controle de rate limiting
  const DEBOUNCE_DELAY = 2000; // 2 segundos de debounce
  const MIN_FETCH_INTERVAL = 3000; // Mínimo 3 segundos entre requisições
  const CACHE_DURATION = 5000; // Cache válido por 5 segundos

  const fetchParticipantsImmediate = useCallback(async (roomId: string): Promise<User[]> => {
    if (!roomId) {
      console.log('ID da sala é obrigatório para buscar participantes');
      return [];
    }

    // Verifica cache válido
    const now = Date.now();
    if (cacheRef.current && 
        cacheRef.current.roomId === roomId && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      console.log('Usando participantes do cache');
      return cacheRef.current.participants;
    }

    // Verifica intervalo mínimo entre requisições
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
      console.log(`Requisição bloqueada - aguardando ${MIN_FETCH_INTERVAL - timeSinceLastFetch}ms`);
      return gameState.users;
    }

    setIsLoading(true);
    lastFetchTimeRef.current = now;

    try {
      console.log('Buscando participantes da sala:', roomId);
      const response = await ApiService.rooms.getParticipants(roomId);

      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('Falha ao buscar participantes da API, mantendo lista atual');
        return gameState.users;
      }

      const participantsData: UserDto[] = 'data' in response ? response.data : response;
      
      if (!Array.isArray(participantsData)) {
        console.error('Resposta da API não é um array:', participantsData);
        return gameState.users;
      }

      console.log('Dados dos participantes da API:', participantsData.length, 'participantes');

      const participants: User[] = participantsData.map(participant => {
        const isProductOwner = participant.role === 'ProductOwner';
        return {
          id: participant.id,
          name: participant.displayName || 'Nome não disponível',
          isModerator: isProductOwner,
          isProductOwner: isProductOwner,
          hasVoted: false,
        };
      });

      // Atualiza cache
      cacheRef.current = {
        roomId,
        participants,
        timestamp: now
      };

      console.log('Participantes convertidos:', participants.length);

      setGameState(prev => ({
        ...prev,
        users: participants,
      }));

      return participants;
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      
      // Em caso de erro 429, aumenta o intervalo
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        console.warn('Rate limit atingido - aguardando mais tempo para próxima requisição');
        lastFetchTimeRef.current = now + 10000; // Bloqueia por 10 segundos adicionais
      }
      
      return gameState.users;
    } finally {
      setIsLoading(false);
    }
  }, [gameState.users, handleApiResponse, setGameState]);

  const fetchParticipantsDebounced = useCallback((roomId: string) => {
    // Cancela timeout anterior se existir
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Cria novo timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchParticipantsImmediate(roomId);
    }, DEBOUNCE_DELAY);

    console.log(`Requisição de participantes agendada para ${DEBOUNCE_DELAY}ms`);
  }, [fetchParticipantsImmediate]);

  const clearCache = useCallback(() => {
    cacheRef.current = null;
    console.log('Cache de participantes limpo');
  }, []);

  const cancelPendingRequests = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      console.log('Requisições pendentes canceladas');
    }
  }, []);

  return {
    fetchParticipantsImmediate,
    fetchParticipantsDebounced,
    isLoading,
    clearCache,
    cancelPendingRequests
  };
};
