
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

        // Não adiciona mais localmente - deixa o SignalR gerenciar
        console.log('História criada com sucesso via API:', storyData.id);
      }
    } catch (error) {
      handleError(error);
      // Fallback para modo local apenas se não há conexão SignalR
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
    console.log('setCurrentStory chamado, mas endpoint não existe. Funcionando apenas localmente.');
    
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
  }, [gameState.stories, setGameState]);

  return { addStory, setCurrentStory };
};
