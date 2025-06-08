
import { useCallback } from 'react';
import { GameState } from '../types/game';
import { useParticipantsManager } from './useParticipantsManager';

export const useFetchParticipants = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const participantsManager = useParticipantsManager(gameState, setGameState);

  const fetchParticipants = useCallback(async (roomId: string) => {
    return participantsManager.fetchParticipantsImmediate(roomId);
  }, [participantsManager.fetchParticipantsImmediate]);

  return { 
    fetchParticipants,
    fetchParticipantsDebounced: participantsManager.fetchParticipantsDebounced,
    isLoadingParticipants: participantsManager.isLoading
  };
};
