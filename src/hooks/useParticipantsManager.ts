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
  const DEBOUNCE_DELAY = 3000; // 3 segundos de debounce
  const MIN_FETCH_INTERVAL = 4000; // Mínimo 4 segundos entre requisições
  const CACHE_DURATION = 6000; // Cache válido por 6 segundos

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
        const isProductOwner = participant.role === 'ProductOwner' || participant.role === 'Moderator';
        
        console.log('🔍 Processando participante da API:', {
          id: participant.id,
          name: participant.name,
          role: participant.role
        });
        
        let finalName = '';
        
        if (participant.name && participant.name.trim()) {
          finalName = participant.name.trim();
        } else if (gameState.currentUser && gameState.currentUser.id === participant.id) {
          finalName = gameState.currentUser.name;
        } else {
          const existingUser = gameState.users.find(u => u.id === participant.id);
          if (existingUser && existingUser.name && existingUser.name !== 'Usuário Anônimo') {
            finalName = existingUser.name;
          } else {
            finalName = participant.role === 'Moderator' ? 'Product Owner' : 'Desenvolvedor';
            console.warn(`⚠️ Name ausente para usuário ${participant.id}, usando nome baseado em role: "${finalName}"`);
          }
        }
        
        return {
          id: participant.id,
          name: finalName,
          isModerator: isProductOwner,
          isProductOwner: isProductOwner,
          hasVoted: false,
        };
      });

      // ✅ CORREÇÃO CRÍTICA: Verificação rigorosa de duplicação
      console.log('🔧 Aplicando verificação rigorosa de duplicação...');
      
      // Deduplica por ID primeiro
      const uniqueById = participants.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );
      
      // Para POs, também deduplica por role para evitar múltiplos POs
      const finalParticipants: User[] = [];
      let hasProductOwner = false;
      
      for (const user of uniqueById) {
        if (user.isProductOwner) {
          if (!hasProductOwner) {
            finalParticipants.push(user);
            hasProductOwner = true;
            console.log('✅ Adicionando PO único:', user.name);
          } else {
            console.warn('⚠️ PO duplicado removido:', user.name);
          }
        } else {
          finalParticipants.push(user);
        }
      }

      // Atualiza cache
      cacheRef.current = {
        roomId,
        participants: finalParticipants,
        timestamp: now
      };

      console.log('✅ Participantes finais após deduplicação:', finalParticipants.length);
      console.log('✅ POs na lista final:', finalParticipants.filter(p => p.isProductOwner).length);

      setGameState(prev => ({
        ...prev,
        users: finalParticipants,
      }));

      return finalParticipants;
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        console.warn('Rate limit atingido - aguardando mais tempo para próxima requisição');
        lastFetchTimeRef.current = now + 15000;
      }
      
      return gameState.users;
    } finally {
      setIsLoading(false);
    }
  }, [gameState.users, gameState.currentUser, handleApiResponse, setGameState]);

  const fetchParticipantsDebounced = useCallback((roomId: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

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
