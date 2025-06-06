
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { GameState } from '../types/game';

export const useVotingOperations = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const castVote = useCallback(async (vote: number | string) => {
    if (!gameState.currentPlayer || gameState.currentPlayer.isProductOwner || !gameState.currentStory) return;

    try {
      await ApiService.stories.submitVote({
        storyId: gameState.currentStory.id,
        userId: gameState.currentPlayer.id,
        value: vote.toString(),
      });
    } catch (error) {
      console.error('Erro ao enviar voto:', error);
    }

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === prev.currentPlayer?.id
          ? { ...p, hasVoted: true, vote }
          : p
      ),
    }));
  }, [gameState.currentPlayer, gameState.currentStory, setGameState]);

  const revealVotes = useCallback(async () => {
    try {
      if (gameState.currentStory) {
        await ApiService.stories.revealVotes(gameState.currentStory.id);
      }
    } catch (error) {
      console.error('Erro ao revelar votos:', error);
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
  }, [gameState.currentStory, setGameState]);

  const resetVoting = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      votingInProgress: true,
      votesRevealed: false,
      revealCountdown: null,
      players: prev.players.map(p => ({ ...p, hasVoted: false, vote: undefined })),
    }));
  }, [setGameState]);

  return { castVote, revealVotes, resetVoting };
};
