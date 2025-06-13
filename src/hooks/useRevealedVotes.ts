
import { useCallback, useEffect, useState, useRef } from 'react';
import { ApiService } from '../services/api';
import { VoteResultDto } from '../services/api/types';
import { useErrorHandler } from './useErrorHandler';

export const useRevealedVotes = (roomId: string | null, storyId: string | null, votesRevealed: boolean) => {
  const [revealedVotes, setRevealedVotes] = useState<VoteResultDto[]>([]);
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
    data: VoteResultDto[];
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

  const fetchRevealedVotes = useCallback(async (isRetry = false) => {
    if (!roomId || !storyId || !votesRevealed) {
      setRevealedVotes([]);
      retryCountRef.current = 0;
      return;
    }

    // Verificar cache (válido por 2 segundos)
    const now = Date.now();
    const cache = cacheRef.current;
    if (!isRetry && 
        cache.roomId === roomId && 
        cache.storyId === storyId && 
        now - cache.timestamp < 2000) {
      console.log('🗳️ Usando dados do cache para votos revelados');
      setRevealedVotes(cache.data);
      return;
    }

    // Debounce: evitar chamadas muito frequentes
    if (!isRetry && now - lastFetchRef.current < 3000) {
      console.log('🗳️ Fetch de votos revelados debounced - muito cedo para nova requisição');
      return;
    }

    lastFetchRef.current = now;
    setIsLoading(true);

    try {
      console.log('🗳️ Buscando votos revelados para história:', storyId);
      const response = await ApiService.stories.getRevealedVotes(roomId, storyId);
      
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('🗳️ Erro ao buscar votos revelados');
        setRevealedVotes([]);
        return;
      }

      const votesData = 'data' in response ? response.data : response;
      if (Array.isArray(votesData)) {
        console.log('🗳️ Votos revelados recebidos:', votesData);
        setRevealedVotes(votesData);
        
        // Atualizar cache
        cacheRef.current = {
          roomId,
          storyId,
          data: votesData,
          timestamp: now
        };
        
        // Reset retry count em caso de sucesso
        retryCountRef.current = 0;
      } else {
        console.log('🗳️ Formato inválido de votos revelados:', votesData);
        setRevealedVotes([]);
      }
    } catch (error: any) {
      console.log('🗳️ Erro ao buscar votos revelados:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error?.status === 429) {
        // Rate limiting - retry com backoff
        retryCountRef.current++;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        
        console.log(`🗳️ Rate limit atingido (429). Tentativa ${retryCountRef.current}. Aguardando ${retryDelay}ms antes de tentar novamente.`);
        
        retryTimeoutRef.current = setTimeout(() => {
          if (votesRevealed && roomId && storyId) {
            fetchRevealedVotes(true);
          }
        }, retryDelay);
        
        return; // Não mostrar erro para o usuário
      } else if (error?.status === 500) {
        // Erro interno do servidor - retry limitado
        retryCountRef.current++;
        
        if (retryCountRef.current <= 3) {
          const retryDelay = Math.min(2000 * retryCountRef.current, 8000);
          console.log(`🗳️ Erro 500 no servidor. Tentativa ${retryCountRef.current}/3. Aguardando ${retryDelay}ms antes de tentar novamente.`);
          
          retryTimeoutRef.current = setTimeout(() => {
            if (votesRevealed && roomId && storyId) {
              fetchRevealedVotes(true);
            }
          }, retryDelay);
          
          return; // Não mostrar erro para o usuário nas primeiras tentativas
        } else {
          console.log('🗳️ Máximo de tentativas atingido para erro 500. Parando tentativas.');
          // Mostrar erro apenas após esgotar as tentativas
          handleError(error, 'Erro no servidor ao buscar votos revelados. Tente novamente mais tarde.');
        }
      } else {
        // Outros erros - mostrar normalmente
        handleError(error);
      }
      
      setRevealedVotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, storyId, votesRevealed, handleError, handleApiResponse]);

  // Cleanup ao desmontar ou quando parâmetros mudam
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Busca inicial quando os votos são revelados
  useEffect(() => {
    if (votesRevealed && roomId && storyId) {
      fetchRevealedVotes();
    } else {
      setRevealedVotes([]);
      clearAllTimers();
      retryCountRef.current = 0;
    }
  }, [fetchRevealedVotes, votesRevealed, roomId, storyId]);

  // Polling para atualizar os votos em tempo real quando revelados
  useEffect(() => {
    clearAllTimers(); // Limpar timers existentes
    
    if (!votesRevealed || !roomId || !storyId) {
      return;
    }

    // Configurar novo intervalo com frequência menor para evitar sobrecarga
    intervalRef.current = setInterval(() => {
      fetchRevealedVotes();
    }, 5000); // Aumentado de 2s para 5s para reduzir carga no servidor

    return () => {
      clearAllTimers();
    };
  }, [votesRevealed, roomId, storyId, fetchRevealedVotes]);

  return {
    revealedVotes,
    isLoading,
    refetch: () => fetchRevealedVotes()
  };
};
