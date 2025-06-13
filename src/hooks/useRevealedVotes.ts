
import { useCallback, useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { VoteResultDto } from '../services/api/types';
import { useErrorHandler } from './useErrorHandler';

export const useRevealedVotes = (roomId: string | null, storyId: string | null, votesRevealed: boolean) => {
  const [revealedVotes, setRevealedVotes] = useState<VoteResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleApiResponse } = useErrorHandler();

  const fetchRevealedVotes = useCallback(async () => {
    if (!roomId || !storyId || !votesRevealed) {
      setRevealedVotes([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Buscando votos revelados para história:', storyId);
      const response = await ApiService.stories.getRevealedVotes(roomId, storyId);
      
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('Erro ao buscar votos revelados');
        setRevealedVotes([]);
        return;
      }

      const votesData = 'data' in response ? response.data : response;
      if (Array.isArray(votesData)) {
        console.log('Votos revelados recebidos:', votesData);
        setRevealedVotes(votesData);
      } else {
        console.log('Formato inválido de votos revelados:', votesData);
        setRevealedVotes([]);
      }
    } catch (error) {
      console.log('Erro ao buscar votos revelados:', error);
      handleError(error);
      setRevealedVotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, storyId, votesRevealed, handleError, handleApiResponse]);

  // Busca os votos quando os votos são revelados
  useEffect(() => {
    fetchRevealedVotes();
  }, [fetchRevealedVotes]);

  // Polling para atualizar os votos em tempo real quando revelados
  useEffect(() => {
    if (!votesRevealed || !roomId || !storyId) return;

    const interval = setInterval(() => {
      fetchRevealedVotes();
    }, 2000); // Atualiza a cada 2 segundos

    return () => clearInterval(interval);
  }, [votesRevealed, roomId, storyId, fetchRevealedVotes]);

  return {
    revealedVotes,
    isLoading,
    refetch: fetchRevealedVotes
  };
};
