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

    // Add a generic event listener to catch ANY events we might be missing
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

    // Eventos de votação em tempo real
    connection.on('VoteSubmitted', (voteData: any) => {
      console.log('🗳️ SignalR: Vote submitted event received:', voteData);
      
      setGameState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === voteData.userId 
            ? { ...user, hasVoted: true, vote: voteData.value }
            : user
        ),
      }));
    });

    connection.on('VotingStatusChanged', (statusData: any) => {
      console.log('🗳️ SignalR: Voting status changed:', statusData);
      
      setGameState(prev => ({
        ...prev,
        votingInProgress: statusData.votingInProgress,
        votesRevealed: statusData.votesRevealed,
      }));
    });

    connection.on('VotesRevealed', (revealData: any) => {
      console.log('🗳️ SignalR: Votes revealed event received:', revealData);
      
      setGameState(prev => ({
        ...prev,
        votesRevealed: true,
        votingInProgress: false,
        revealCountdown: null,
      }));
    });

    connection.on('VotingReset', () => {
      console.log('🗳️ SignalR: Voting reset event received');
      
      setGameState(prev => ({
        ...prev,
        votingInProgress: true,
        votesRevealed: false,
        revealCountdown: null,
        users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
      }));
    });

    // Create a reusable handler for setting current story
    const handleCurrentStorySet = (storyDto: any) => {
      console.log('🎯🎯🎯 SignalR: STORY SELECTION EVENT RECEIVED!');
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
      
      console.log('🎯🎯🎯 SignalR: SETTING CURRENT STORY FOR ALL USERS!');
      console.log('🎯 SignalR: Story title:', currentStory.title);
      console.log('🎯 SignalR: Starting voting for all participants');
      
      setGameState(prev => {
        console.log('🎯 SignalR: Previous currentStory:', prev.currentStory?.title || 'none');
        console.log('🎯 SignalR: Previous votingInProgress:', prev.votingInProgress);
        
        const newState = {
          ...prev,
          currentStory: currentStory,
          votingInProgress: true,
          votesRevealed: false,
          revealCountdown: null,
          users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
        };
        
        console.log('🎯🎯🎯 SignalR: NEW STATE SET - VOTING SHOULD START NOW!');
        console.log('🎯 SignalR: New currentStory:', newState.currentStory?.title);
        console.log('🎯 SignalR: New votingInProgress:', newState.votingInProgress);
        
        return newState;
      });
    };

    // Lista completa de possíveis eventos que o backend pode enviar
    const allPossibleEventNames = [
      'CurrentStorySet',
      'StorySelected', 
      'StorySetForVoting',
      'VotingStarted',
      'StoryActivated',
      'ActiveStoryChanged',
      'GameStateChanged',
      'RoomStateChanged',
      'StorySelectionChanged',
      'CurrentStoryChanged',
      'PlanningStarted'
    ];

    // Registra handlers para todos os possíveis eventos
    allPossibleEventNames.forEach(eventName => {
      connection.on(eventName, (data: any) => {
        console.log(`🎯🎯🎯 SignalR: Event '${eventName}' received with data:`, data);
        
        // Se parece com dados de uma história, trata como seleção de história
        if (data && typeof data === 'object' && (data.id || data.storyId)) {
          console.log(`🎯 SignalR: Treating '${eventName}' as story selection event`);
          handleCurrentStorySet(data.story || data);
        }
      });
    });
    
    // Log all registered events
    console.log('🎯🎯🎯 SignalR: Story events registered. Listening for ALL possible events:');
    allPossibleEventNames.forEach(name => console.log(`  - ${name}`));
    console.log('🎯 SignalR: Connection state:', connection.state);
    console.log('🎯 SignalR: Connection ID:', connection.connectionId);
    
  }, [setGameState]);

  return {
    setupStoryEvents
  };
};
