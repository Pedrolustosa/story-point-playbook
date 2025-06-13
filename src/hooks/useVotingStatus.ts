
import { useCallback, useEffect, useState, useRef } from 'react';
import { ApiService } from '../services/api';
import { VotingStatusDto } from '../services/api/types';
import { useErrorHandler } from './useErrorHandler';

export const useVotingStatus = (
  roomId: string | null, 
  storyId: string | null, 
  votingInProgress: boolean
) => {
  const [votingStatus, setVotingStatus] = useState<VotingStatusDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleApiResponse } = useErrorHandler();
  
  // Refs para controle de polling e debounce
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  
  // Cache simples para evitar requisições desnecessárias
  const cacheRef = useRef<{
    roomId: string | null;
    storyId: string | null;
    data: VotingStatusDto[];
    timestamp: number;
  }>({
    roomId: null,
    storyId: null,
    data: [],
    timestamp: 0
  });

  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const fetchVotingStatus = useCallback(async (isRetry = false) => {
    if (!roomId || !storyId || !votingInProgress) {
      setVotingStatus([]);
      retryCountRef.current = 0;
      return;
    }

    // Verificar cache (válido por 1 segundo)
    const now = Date.now();
    const cache = cacheRef.current;
    if (!isRetry && 
        cache.roomId === roomId && 
        cache.storyId === storyId && 
        now - cache.timestamp < 1000) {
      console.log('🗳️ Usando dados do cache para status de votação');
      setVotingStatus(cache.data);
      return;
    }

    // Debounce: evitar chamadas muito frequentes
    if (!isRetry && now - lastFetchRef.current < 1500) {
      console.log('🗳️ Fetch debounced - muito cedo para nova requisição');
      return;
    }

    lastFetchRef.current = now;
    setIsLoading(true);
    
    try {
      console.log('🗳️ Buscando status de votação para história:', storyId);
      const response = await ApiService.stories.getVotingStatus(roomId, storyId);
      
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('🗳️ Erro ao buscar status de votação');
        setVotingStatus([]);
        return;
      }

      const statusData = 'data' in response ? response.data : response;
      if (Array.isArray(statusData)) {
        console.log('🗳️ Status de votação recebido:', statusData);
        setVotingStatus(statusData);
        
        // Atualizar cache
        cacheRef.current = {
          roomId,
          storyId,
          data: statusData,
          timestamp: now
        };
        
        // Reset retry count em caso de sucesso
        retryCountRef.current = 0;
      } else {
        console.log('🗳️ Formato inválido do status de votação:', statusData);
        setVotingStatus([]);
      }
    } catch (error: any) {
      console.log('🗳️ Erro ao buscar status de votação:', error);
      
      // Tratamento específico para erro 429 (Too Many Requests)
      if (error?.status === 429) {
        retryCountRef.current++;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000); // Backoff exponencial, máximo 10s
        
        console.log(`🗳️ Rate limit atingido (429). Tentativa ${retryCountRef.current}. Aguardando ${retryDelay}ms antes de tentar novamente.`);
        
        // Agendar retry
        retryTimeoutRef.current = setTimeout(() => {
          if (votingInProgress && roomId && storyId) {
            fetchVotingStatus(true);
          }
        }, retryDelay);
        
        // Não mostrar erro para o usuário se é apenas rate limiting
        return;
      }
      
      // Para outros erros, mostrar normalmente
      handleError(error);
      setVotingStatus([]);
      retryCountRef.current = 0;
    } finally {
      setIsLoading(false);
    }
  }, [roomId, storyId, votingInProgress, handleError, handleApiResponse]);

  // Cleanup ao desmontar ou quando parâmetros mudam
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Busca inicial quando votação está em progresso
  useEffect(() => {
    if (votingInProgress && roomId && storyId) {
      fetchVotingStatus();
    } else {
      setVotingStatus([]);
      clearAllTimers();
      retryCountRef.current = 0;
    }
  }, [fetchVotingStatus, votingInProgress, roomId, storyId]);

  // Polling para atualizar status em tempo real durante votação
  useEffect(() => {
    clearAllTimers(); // Limpar timers existentes
    
    if (!votingInProgress || !roomId || !storyId) {
      return;
    }

    // Configurar novo intervalo com frequência menor para evitar rate limiting
    intervalRef.current = setInterval(() => {
      fetchVotingStatus();
    }, 3000); // Aumentado de 2s para 3s

    return () => {
      clearAllTimers();
    };
  }, [votingInProgress, roomId, storyId, fetchVotingStatus]);

  return {
    votingStatus,
    isLoading,
    refetch: () => fetchVotingStatus()
  };
};
