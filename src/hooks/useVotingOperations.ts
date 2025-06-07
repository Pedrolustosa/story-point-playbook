
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';

export const useVotingOperations = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const { handleError, handleApiResponse } = useErrorHandler();

  const castVote = useCallback(async (vote: number | string) => {
    if (!gameState.currentUser || gameState.currentUser.isProductOwner || !gameState.currentStory) return;

    try {
      const response = await ApiService.stories.submitVote({
        storyId: gameState.currentStory.id,
        userId: gameState.currentUser.id,
        value: vote.toString(),
      });

      // Só procede se a API retornar sucesso
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        return;
      }
    } catch (error) {
      handleError(error);
    }

    setGameState(prev => ({
      ...prev,
      users: prev.users.map(p =>
        p.id === prev.currentUser?.id
          ? { ...p, hasVoted: true, vote }
          : p
      ),
    }));
  }, [gameState.currentUser, gameState.currentStory, setGameState, handleError, handleApiResponse]);

  const revealVotes = useCallback(async () => {
    try {
      if (gameState.currentStory) {
        const response = await ApiService.stories.revealVotes(gameState.currentStory.id);
        
        // Só procede se a API retornar sucesso
        const isSuccess = handleApiResponse(response);
        if (!isSuccess) {
          return;
        }
      }
    } catch (error) {
      handleError(error);
    }

    setGameState(prev => ({
      ...prev,
      revealCountdown: 3,
    }));

    const countdownInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.revealCountdown === null) {
          clearInterval(countdownInterval);
          return prev;
        }
        
        if (prev.revealCountdown <= 1) {
          clearInterval(countdownInterval);
          return {
            ...prev,
            votesRevealed: true,
            votingInProgress: false,
            revealCountdown: null,
          };
        }
        
        return {
          ...prev,
          revealCountdown: prev.revealCountdown - 1,
        };
      });
    }, 1000);
  }, [gameState.currentStory, setGameState, handleError, handleApiResponse]);

  const resetVoting = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      votingInProgress: true,
      votesRevealed: false,
      revealCountdown: null,
      users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
    }));
  }, [setGameState]);

  return { castVote, revealVotes, resetVoting };
};
