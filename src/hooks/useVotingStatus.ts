
import { useCallback, useEffect, useState } from 'react';
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

  const fetchVotingStatus = useCallback(async () => {
    if (!roomId || !storyId || !votingInProgress) {
      setVotingStatus([]);
      return;
    }

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
      } else {
        console.log('🗳️ Formato inválido do status de votação:', statusData);
        setVotingStatus([]);
      }
    } catch (error) {
      console.log('🗳️ Erro ao buscar status de votação:', error);
      handleError(error);
      setVotingStatus([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, storyId, votingInProgress, handleError, handleApiResponse]);

  // Busca inicial quando votação está em progresso
  useEffect(() => {
    fetchVotingStatus();
  }, [fetchVotingStatus]);

  // Polling para atualizar status em tempo real durante votação
  useEffect(() => {
    if (!votingInProgress || !roomId || !storyId) return;

    const interval = setInterval(() => {
      fetchVotingStatus();
    }, 2000); // Atualiza a cada 2 segundos

    return () => clearInterval(interval);
  }, [votingInProgress, roomId, storyId, fetchVotingStatus]);

  return {
    votingStatus,
    isLoading,
    refetch: fetchVotingStatus
  };
};
