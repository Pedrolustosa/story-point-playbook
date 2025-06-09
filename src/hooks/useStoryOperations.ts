
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

        console.log('História criada com sucesso via API:', storyData.id);
      }
    } catch (error) {
      console.log('Erro ao criar história via API, usando fallback local:', error);
      handleError(error);
      
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

    console.log('🎯🎯🎯 INICIANDO SELEÇÃO DE HISTÓRIA:', story.title);

    try {
      if (gameState.roomId) {
        console.log('🎯 Chamando API para selecionar história:', { storyId, roomId: gameState.roomId });
        const response = await ApiService.stories.selectStoryForVoting(gameState.roomId, storyId);
        
        console.log('🎯 Resposta da API selectStoryForVoting:', response);
        
        const isSuccess = handleApiResponse(response);
        if (!isSuccess) {
          console.log('🎯 API retornou erro para seleção da história');
          // Aplica fallback imediatamente se a API falhar
          setGameState(prev => ({
            ...prev,
            currentStory: story,
            votingInProgress: true,
            votesRevealed: false,
            revealCountdown: null,
            users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
          }));
          return;
        }

        console.log('🎯🎯🎯 API call SUCCESSFUL - aguardando SignalR...');
        
        // Aguarda 2 segundos pelo SignalR, se não funcionar, aplica fallback
        let signalRWorked = false;
        
        // Verifica se o SignalR funcionou
        setTimeout(() => {
          setGameState(prev => {
            if (prev.currentStory?.id === storyId) {
              signalRWorked = true;
              console.log('✅ SignalR funcionou - história atualizada');
              return prev;
            }
            
            if (!signalRWorked) {
              console.log('⚠️⚠️⚠️ FALLBACK: SignalR não atualizou, aplicando mudança local');
              return {
                ...prev,
                currentStory: story,
                votingInProgress: true,
                votesRevealed: false,
                revealCountdown: null,
                users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
              };
            }
            
            return prev;
          });
        }, 2000);
        
        return;
      }
    } catch (error) {
      console.log('🎯 Erro na API, usando fallback local:', error);
      handleError(error);
    }

    // Fallback local se não há roomId ou API falhou
    console.log('🎯 Aplicando fallback local para definir história atual:', story.title);
    setGameState(prev => ({
      ...prev,
      currentStory: story,
      votingInProgress: true,
      votesRevealed: false,
      revealCountdown: null,
      users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
    }));
  }, [gameState.stories, gameState.roomId, setGameState, handleError, handleApiResponse]);

  return { addStory, setCurrentStory };
};
