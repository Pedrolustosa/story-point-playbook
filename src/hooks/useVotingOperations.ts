
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

    console.log('🗳️🗳️🗳️ CASTING VOTE - START');
    console.log('🗳️ Vote value:', vote);
    console.log('🗳️ User ID:', gameState.currentUser.id);
    console.log('🗳️ User name:', gameState.currentUser.name);
    console.log('🗳️ Story ID:', gameState.currentStory.id);
    console.log('🗳️ Story title:', gameState.currentStory.title);

    try {
      const voteCommand = {
        storyId: gameState.currentStory.id,
        userId: gameState.currentUser.id,
        value: vote.toString(),
      };
      
      console.log('🗳️ Sending vote command to API:', voteCommand);
      
      const response = await ApiService.stories.submitVote(voteCommand);
      
      console.log('🗳️ API response received:', response);

      const isSuccess = handleApiResponse(response);
      if (!isSuccess) {
        console.log('🗳️ Vote submission failed - API returned error');
        return;
      }

      console.log('🗳️🗳️🗳️ VOTE SUBMITTED SUCCESSFULLY TO API!');
      console.log('🗳️ Now waiting for SignalR VoteSubmitted event to update UI...');
      
      // Atualização temporária local para feedback imediato
      // O SignalR vai sobrescrever isso quando receber o evento
      setGameState(prev => {
        console.log('🗳️ Applying temporary local vote update');
        console.log('🗳️ Previous user state:', prev.users.find(u => u.id === prev.currentUser?.id));
        
        const updatedUsers = prev.users.map(p =>
          p.id === prev.currentUser?.id
            ? { ...p, hasVoted: true, vote }
            : p
        );
        
        console.log('🗳️ Updated users after local update:', updatedUsers.map(u => ({ 
          id: u.id, 
          name: u.name, 
          hasVoted: u.hasVoted, 
          vote: u.vote 
        })));
        
        return {
          ...prev,
          users: updatedUsers,
        };
      });

    } catch (error) {
      console.log('🗳️ ERROR casting vote:', error);
      handleError(error);
    }
  }, [gameState.currentUser, gameState.currentStory, setGameState, handleError, handleApiResponse]);

  const revealVotes = useCallback(async () => {
    if (!gameState.currentStory) return;

    console.log('🗳️ Revealing votes for story:', gameState.currentStory.id);

    try {
      const response = await ApiService.stories.revealVotes(gameState.currentStory.id);
      
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
