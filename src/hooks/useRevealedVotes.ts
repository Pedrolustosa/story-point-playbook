
import { useCallback, useEffect, useState, useRef } from 'react';
import { ApiService } from '../services/api';
import { VoteResultDto } from '../services/api/types';
import { useErrorHandler } from './useErrorHandler';

export const useRevealedVotes = (roomId: string | null, storyId: string | null, votesRevealed: boolean) => {
  const [revealedVotes, setRevealedVotes] = useState<VoteResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleApiResponse } = useErrorHandler();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

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

    const now = Date.now();
    const cache = cacheRef.current;
    if (!isRetry &&
      cache.roomId === roomId &&
      cache.storyId === storyId &&
      now - cache.timestamp < 2000) {
      setRevealedVotes(cache.data);
      return;
    }
    if (!isRetry && now - lastFetchRef.current < 3000) {
      return;
    }

    lastFetchRef.current = now;
    setIsLoading(true);

    try {
      const response = await ApiService.stories.getRevealedVotes(roomId, storyId);
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        setRevealedVotes([]);
        return;
      }

      const votesData = 'data' in response ? response.data : response;
      if (Array.isArray(votesData)) {
        setRevealedVotes(votesData);
        cacheRef.current = {
          roomId,
          storyId,
          data: votesData,
          timestamp: now
        };
        retryCountRef.current = 0;
      } else {
        setRevealedVotes([]);
      }
    } catch (error: any) {
      if (error?.status === 429) {
        retryCountRef.current++;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        retryTimeoutRef.current = setTimeout(() => {
          if (votesRevealed && roomId && storyId) {
            fetchRevealedVotes(true);
          }
        }, retryDelay);
        return;
      } else if (error?.status === 500) {
        retryCountRef.current++;
        if (retryCountRef.current <= 3) {
          const retryDelay = Math.min(2000 * retryCountRef.current, 8000);
          retryTimeoutRef.current = setTimeout(() => {
            if (votesRevealed && roomId && storyId) {
              fetchRevealedVotes(true);
            }
          }, retryDelay);
          return;
        } else {
          handleError(error, 'Erro no servidor ao buscar votos revelados. Tente novamente mais tarde.');
        }
      } else {
        handleError(error);
      }
      setRevealedVotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, storyId, votesRevealed, handleError, handleApiResponse]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  useEffect(() => {
    if (votesRevealed && roomId && storyId) {
      fetchRevealedVotes();
    } else {
      setRevealedVotes([]);
      clearAllTimers();
      retryCountRef.current = 0;
    }
  }, [fetchRevealedVotes, votesRevealed, roomId, storyId]);

  useEffect(() => {
    clearAllTimers();
    if (!votesRevealed || !roomId || !storyId) {
      return;
    }
    intervalRef.current = setInterval(() => {
      fetchRevealedVotes();
    }, 5000);
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
