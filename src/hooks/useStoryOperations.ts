
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { Story, GameState } from '../types/game';
import { useErrorHandler } from './useErrorHandler';

export const useStoryOperations = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const { handleError, handleApiResponse } = useErrorHandler();

  const addStory = useCallback(async (story: Omit<Story, 'id' | 'isCompleted'>) => {
    try {
      if (gameState.roomId) {
        const response = await ApiService.stories.createStory(gameState.roomId, {
          title: story.title,
          description: story.description,
        });

        // Só procede se a API retornar sucesso
        const isSuccess = handleApiResponse(response);
        if (!isSuccess) {
          return;
        }

        const storyData = 'data' in response ? response.data : response;
        
        if (!storyData || !storyData.id) {
          handleError('Resposta inválida da API: dados da história ausentes');
          return;
        }

        const newStory: Story = {
          id: storyData.id,
          title: storyData.title,
          description: storyData.description,
          isCompleted: false,
        };

        setGameState(prev => ({
          ...prev,
          stories: [...prev.stories, newStory],
        }));
      }
    } catch (error) {
      handleError(error);
      // Fallback para modo local
      const newStory: Story = {
        ...story,
        id: Date.now().toString(),
        isCompleted: false,
      };

      setGameState(prev => ({
        ...prev,
        stories: [...prev.stories, newStory],
      }));
    }
  }, [gameState.roomId, setGameState, handleError, handleApiResponse]);

  const setCurrentStory = useCallback(async (storyId: string) => {
    try {
      if (gameState.roomCode) {
        const response = await ApiService.stories.setCurrentStory(gameState.roomCode, storyId);
        
        // Só procede se a API retornar sucesso
        const isSuccess = handleApiResponse(response);
        if (!isSuccess) {
          return;
        }
      }
    } catch (error) {
      handleError(error);
    }

    const story = gameState.stories.find(s => s.id === storyId);
    if (story) {
      setGameState(prev => ({
        ...prev,
        currentStory: story,
        votingInProgress: true,
        votesRevealed: false,
        revealCountdown: null,
        users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
      }));
    }
  }, [gameState.roomCode, gameState.stories, setGameState, handleError, handleApiResponse]);

  return { addStory, setCurrentStory };
};
