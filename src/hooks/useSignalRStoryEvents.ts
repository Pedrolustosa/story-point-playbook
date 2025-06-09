
import { useCallback } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { GameState, Story } from '../types/game';

export const useSignalRStoryEvents = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const setupStoryEvents = useCallback((connection: HubConnection) => {
    // Log all events received for debugging
    connection.onreconnected(() => {
      console.log('🔄 SignalR: Reconnected - re-registering story events');
    });

    // Add a generic event listener to catch any events we might be missing
    const originalOn = connection.on.bind(connection);
    connection.on = function(eventName: string, handler: (...args: any[]) => void) {
      console.log(`🎯 SignalR: Registering handler for event: ${eventName}`);
      return originalOn(eventName, (...args: any[]) => {
        console.log(`🎯 SignalR: Event received: ${eventName}`, args);
        return handler(...args);
      });
    };

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

    // Create a reusable handler for setting current story
    const handleCurrentStorySet = (storyDto: any) => {
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
    };

    // Enhanced CurrentStorySet handler with more debugging
    connection.on('CurrentStorySet', handleCurrentStorySet);

    // Listen for any potential alternative event names
    connection.on('StorySelected', (storyDto: any) => {
      console.log('🎯 SignalR: StorySelected event received (alternative):', storyDto);
      // Call the handler directly instead of using emit
      handleCurrentStorySet(storyDto);
    });

    connection.on('VotingStarted', (storyDto: any) => {
      console.log('🎯 SignalR: VotingStarted event received (alternative):', storyDto);
      // Call the handler directly instead of using emit
      handleCurrentStorySet(storyDto);
    });

    // Add additional potential event names that might be used
    const alternativeEventNames = [
      'StorySetForVoting', 'StoryActivated', 'ActiveStoryChanged', 'GameStateChanged'
    ];

    alternativeEventNames.forEach(eventName => {
      connection.on(eventName, (...args: any[]) => {
        console.log(`🎯 SignalR: Alternative event '${eventName}' received:`, args);
        // If it looks like a story selection event, handle it
        if (args.length > 0 && args[0] && typeof args[0] === 'object' && args[0].id) {
          console.log(`🎯 SignalR: Treating '${eventName}' as story selection event`);
          handleCurrentStorySet(args[0]);
        }
      });
    });
    
    // Log all registered events
    console.log('🎯 SignalR: Story events registered. Listening for:');
    console.log('  - StoriesInitialized');
    console.log('  - StoryAdded'); 
    console.log('  - StoryUpdated');
    console.log('  - StoryDeleted');
    console.log('  - CurrentStorySet ⭐');
    console.log('  - StorySelected (alternative)');
    console.log('  - VotingStarted (alternative)');
    console.log('  - Alternative events:', alternativeEventNames.join(', '));
    console.log('🎯 SignalR: Connection state:', connection.state);
    console.log('🎯 SignalR: Connection ID:', connection.connectionId);
    
  }, [setGameState]);

  return {
    setupStoryEvents
  };
};
