
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
        isCompleted: false,
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
        isCompleted: false,
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
        isCompleted: storyDto.isCompleted || false,
        estimate: storyDto.estimate,
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
      console.log('SignalR: Current story set:', storyDto);
      const currentStory: Story = {
        id: storyDto.id,
        title: storyDto.title,
        description: storyDto.description,
        isCompleted: storyDto.isCompleted || false,
        estimate: storyDto.estimate,
      };
      
      setGameState(prev => ({
        ...prev,
        currentStory: currentStory,
        votingInProgress: true,
        votesRevealed: false,
        revealCountdown: null,
        users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
      }));
    });
  }, [setGameState]);

  return {
    setupStoryEvents
  };
};
