
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { Story, GameState } from '../types/game';

export const useStoryOperations = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const addStory = useCallback(async (story: Omit<Story, 'id' | 'isCompleted'>) => {
    try {
      if (gameState.roomId) {
        const response = await ApiService.stories.createStory(gameState.roomId, {
          title: story.title,
          description: story.description,
        });

        const newStory: Story = {
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
          isCompleted: false,
        };

        setGameState(prev => ({
          ...prev,
          stories: [...prev.stories, newStory],
        }));
      }
    } catch (error) {
      console.error('Erro ao criar história:', error);
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
  }, [gameState.roomId, setGameState]);

  const setCurrentStory = useCallback(async (storyId: string) => {
    try {
      if (gameState.roomCode) {
        await ApiService.stories.setCurrentStory(gameState.roomCode, storyId);
      }
    } catch (error) {
      console.error('Erro ao definir história atual:', error);
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
  }, [gameState.roomCode, gameState.stories, setGameState]);

  return { addStory, setCurrentStory };
};
