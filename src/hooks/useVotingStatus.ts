
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

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

    const now = Date.now();
    const cache = cacheRef.current;
    if (!isRetry &&
      cache.roomId === roomId &&
      cache.storyId === storyId &&
      now - cache.timestamp < 1000) {
      setVotingStatus(cache.data);
      return;
    }

    if (!isRetry && now - lastFetchRef.current < 1500) {
      return;
    }

    lastFetchRef.current = now;
    setIsLoading(true);

    try {
      const response = await ApiService.stories.getVotingStatus(roomId, storyId);
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        setVotingStatus([]);
        return;
      }

      const statusData = 'data' in response ? response.data : response;
      if (Array.isArray(statusData)) {
        setVotingStatus(statusData);
        cacheRef.current = {
          roomId,
          storyId,
          data: statusData,
          timestamp: now
        };
        retryCountRef.current = 0;
      } else {
        setVotingStatus([]);
      }
    } catch (error: any) {
      if (error?.status === 429) {
        retryCountRef.current++;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        retryTimeoutRef.current = setTimeout(() => {
          if (votingInProgress && roomId && storyId) {
            fetchVotingStatus(true);
          }
        }, retryDelay);
        return;
      }
      handleError(error);
      setVotingStatus([]);
      retryCountRef.current = 0;
    } finally {
      setIsLoading(false);
    }
  }, [roomId, storyId, votingInProgress, handleError, handleApiResponse]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  useEffect(() => {
    if (votingInProgress && roomId && storyId) {
      fetchVotingStatus();
    } else {
      setVotingStatus([]);
      clearAllTimers();
      retryCountRef.current = 0;
    }
  }, [fetchVotingStatus, votingInProgress, roomId, storyId]);

  useEffect(() => {
    clearAllTimers();
    if (!votingInProgress || !roomId || !storyId) {
      return;
    }
    intervalRef.current = setInterval(() => {
      fetchVotingStatus();
    }, 3000);
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
