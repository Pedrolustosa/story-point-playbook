
import { useCallback } from 'react';
import { GameState } from '../types/game';

export const useLeaveRoom = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const leaveRoom = useCallback(() => {
    setGameState(prev => ({
      roomCode: '',
      roomId: '',
      users: [],
      currentUser: null,
      currentStory: null,
      stories: [],
      votingInProgress: false,
      votesRevealed: false,
      revealCountdown: null,
      fibonacciCards: prev.fibonacciCards,
    }));
  }, [setGameState]);

  return { leaveRoom };
};
