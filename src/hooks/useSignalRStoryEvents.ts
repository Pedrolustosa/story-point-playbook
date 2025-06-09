
import { useCallback } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { GameState, Story } from '../types/game';

export const useSignalRStoryEvents = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const setupStoryEvents = useCallback((connection: HubConnection) => {
    connection.on('StoriesInitialized', (storyDtos: any[]) => {
      console.log('SignalR: Stories initialized received:', storyDtos);
      const stories: Story[] = storyDtos.map(dto => ({
        id: dto.id,
        title: dto.title,
        description: dto.description,
        isCompleted: dto.status === 'completed' || false,
        estimate: dto.average || dto.estimate,
      }));
      
      setGameState(prev => ({
        ...prev,
        stories: stories,
      }));
    });

    connection.on('StoryAdded', (storyDto: any) => {
      console.log('SignalR: New story added:', storyDto);
      const newStory: Story = {
        id: storyDto.id,
        title: storyDto.title,
        description: storyDto.description,
        isCompleted: storyDto.status === 'completed' || false,
        estimate: storyDto.average || storyDto.estimate,
      };
      
      setGameState(prev => ({
        ...prev,
        stories: [...prev.stories, newStory],
      }));
    });

    connection.on('StoryUpdated', (storyDto: any) => {
      console.log('SignalR: Story updated:', storyDto);
      const updatedStory: Story = {
        id: storyDto.id,
        title: storyDto.title,
        description: storyDto.description,
        isCompleted: storyDto.status === 'completed' || storyDto.isCompleted || false,
        estimate: storyDto.average || storyDto.estimate,
      };
      
      setGameState(prev => ({
        ...prev,
        stories: prev.stories.map(story => 
          story.id === updatedStory.id ? updatedStory : story
        ),
      }));
    });

    connection.on('StoryDeleted', (storyId: string) => {
      console.log('SignalR: Story deleted:', storyId);
      setGameState(prev => ({
        ...prev,
        stories: prev.stories.filter(story => story.id !== storyId),
        currentStory: prev.currentStory?.id === storyId ? null : prev.currentStory,
      }));
    });

    connection.on('CurrentStorySet', (storyDto: any) => {
      console.log('🎯 SignalR: CurrentStorySet event received!');
      console.log('🎯 SignalR: Raw story data:', storyDto);
      console.log('🎯 SignalR: Story data type:', typeof storyDto);
      console.log('🎯 SignalR: Story data keys:', storyDto ? Object.keys(storyDto) : 'null/undefined');
      
      if (!storyDto) {
        console.log('🎯 SignalR: Story data is null, clearing current story');
        setGameState(prev => ({
          ...prev,
          currentStory: null,
          votingInProgress: false,
          votesRevealed: false,
          revealCountdown: null,
          users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
        }));
        return;
      }

      const currentStory: Story = {
        id: storyDto.id,
        title: storyDto.title,
        description: storyDto.description,
        isCompleted: storyDto.status === 'completed' || storyDto.isCompleted || false,
        estimate: storyDto.average || storyDto.estimate,
      };
      
      console.log('🎯 SignalR: Processed story object:', currentStory);
      console.log('🎯 SignalR: Setting current story and starting voting:', {
        title: currentStory.title,
        description: currentStory.description,
        estimate: currentStory.estimate,
        id: currentStory.id
      });
      
      setGameState(prev => {
        console.log('🎯 SignalR: Previous state - currentStory:', prev.currentStory?.title || 'none');
        console.log('🎯 SignalR: Previous state - votingInProgress:', prev.votingInProgress);
        
        const newState = {
          ...prev,
          currentStory: currentStory,
          votingInProgress: true,
          votesRevealed: false,
          revealCountdown: null,
          users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
        };
        
        console.log('🎯 SignalR: New state - currentStory:', newState.currentStory?.title);
        console.log('🎯 SignalR: New state - votingInProgress:', newState.votingInProgress);
        
        return newState;
      });
    });

    // Adicionar log para verificar se há outros eventos que podem estar sendo perdidos
    console.log('🎯 SignalR: Story events registered. Listening for:');
    console.log('  - StoriesInitialized');
    console.log('  - StoryAdded'); 
    console.log('  - StoryUpdated');
    console.log('  - StoryDeleted');
    console.log('  - CurrentStorySet ⭐');
    
  }, [setGameState]);

  return {
    setupStoryEvents
  };
};
