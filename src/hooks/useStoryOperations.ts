
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
        console.log('Criando história via API:', story.title);
        const response = await ApiService.stories.createStory(gameState.roomId, {
          title: story.title,
          description: story.description,
        });

        // Só procede se a API retornar sucesso
        const isSuccess = handleApiResponse(response);
        if (!isSuccess) {
          console.log('API retornou erro para criação da história');
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
      console.log('Erro ao criar história via API, usando fallback local:', error);
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
    const story = gameState.stories.find(s => s.id === storyId);
    if (!story) {
      console.log('Erro: História não encontrada com ID:', storyId);
      return;
    }

    try {
      if (gameState.roomId) {
        console.log('Definindo história atual via API:', { storyId, roomId: gameState.roomId });
        const response = await ApiService.stories.selectStoryForVoting(gameState.roomId, storyId);
        
        console.log('Resposta da API para selectStoryForVoting:', response);
        
        // Só procede se a API retornar sucesso
        const isSuccess = handleApiResponse(response);
        if (!isSuccess) {
          console.log('API retornou erro para seleção da história');
          return;
        }

        console.log('História atual definida com sucesso via API');
        // O SignalR vai gerenciar a atualização do estado via CurrentStorySet
        return;
      }
    } catch (error) {
      console.log('Erro ao definir história atual via API, usando fallback local:', error);
      handleError(error);
    }

    // Fallback local apenas se a API falhar
    console.log('Usando fallback local para definir história atual:', story.title);
    setGameState(prev => ({
      ...prev,
      currentStory: story,
      votingInProgress: true,
      votesRevealed: false,
      revealCountdown: null,
      users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
    }));

    console.log('História atual definida localmente (fallback):', story.title);
  }, [gameState.stories, gameState.roomId, setGameState, handleError, handleApiResponse]);

  return { addStory, setCurrentStory };
};
