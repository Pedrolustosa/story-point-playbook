
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

    console.log('🗳️ Casting vote:', vote, 'for user:', gameState.currentUser.id);

    try {
      const response = await ApiService.stories.submitVote({
        storyId: gameState.currentStory.id,
        userId: gameState.currentUser.id,
        value: vote.toString(),
      });

      // Só procede se a API retornar sucesso
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('🗳️ Vote submission failed');
        return;
      }

      console.log('🗳️ Vote submitted successfully, waiting for SignalR update');
      
      // Atualização temporária local para feedback imediato
      // O SignalR vai sobrescrever isso quando receber o evento
      setGameState(prev => ({
        ...prev,
        users: prev.users.map(p =>
          p.id === prev.currentUser?.id
            ? { ...p, hasVoted: true, vote }
            : p
        ),
      }));

    } catch (error) {
      console.log('🗳️ Error casting vote:', error);
      handleError(error);
    }
  }, [gameState.currentUser, gameState.currentStory, setGameState, handleError, handleApiResponse]);

  const revealVotes = useCallback(async () => {
    if (!gameState.currentStory) return;

    console.log('🗳️ Revealing votes for story:', gameState.currentStory.id);

    try {
      const response = await ApiService.stories.revealVotes(gameState.currentStory.id);
      
      // Só procede se a API retornar sucesso
      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('🗳️ Reveal votes failed');
        return;
      }

      console.log('🗳️ Votes reveal request sent, waiting for SignalR update');

    } catch (error) {
      console.log('🗳️ Error revealing votes:', error);
      handleError(error);
    }

    // Mantém o countdown local para feedback visual
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
    console.log('🗳️ Resetting voting');
    
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
