
import { useCallback } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { GameState, Story } from '../types/game';

export const useSignalRStoryEvents = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const setupStoryEvents = useCallback((connection: HubConnection) => {
    console.log('🎯 SignalR: Setting up story and voting events');

    // Log all events received for debugging
    connection.onreconnected(() => {
      console.log('🔄 SignalR: Reconnected - re-registering story events');
    });

    // Stories events
    connection.on('StoriesInitialized', (storyDtos: any[]) => {
      console.log('📚 SignalR: Stories initialized received:', storyDtos);
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
      console.log('📚 SignalR: New story added:', storyDto);
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
      console.log('📚 SignalR: Story updated:', storyDto);
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
      console.log('📚 SignalR: Story deleted:', storyId);
      setGameState(prev => ({
        ...prev,
        stories: prev.stories.filter(story => story.id !== storyId),
        currentStory: prev.currentStory?.id === storyId ? null : prev.currentStory,
      }));
    });

    // EVENTOS DE VOTAÇÃO - PRINCIPAIS PARA O PROBLEMA
    connection.on('VoteSubmitted', (voteData: any) => {
      console.log('🗳️🗳️🗳️ SignalR: Vote submitted event received:', voteData);
      console.log('🗳️ Vote data details:', {
        userId: voteData.userId,
        value: voteData.value,
        storyId: voteData.storyId
      });
      
      setGameState(prev => {
        console.log('🗳️ Updating user vote in state. Previous users:', prev.users.map(u => ({ id: u.id, name: u.name, hasVoted: u.hasVoted })));
        
        const updatedUsers = prev.users.map(user => {
          if (user.id === voteData.userId) {
            console.log('🗳️ Found matching user, updating vote:', { userId: user.id, userName: user.name, newVote: voteData.value });
            return { ...user, hasVoted: true, vote: voteData.value };
          }
          return user;
        });
        
        console.log('🗳️ Updated users after vote:', updatedUsers.map(u => ({ id: u.id, name: u.name, hasVoted: u.hasVoted, vote: u.vote })));
        
        return {
          ...prev,
          users: updatedUsers,
        };
      });
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

    // Eventos de seleção de história
    const handleCurrentStorySet = (storyDto: any) => {
      console.log('🎯 SignalR: STORY SELECTION EVENT RECEIVED!');
      console.log('🎯 SignalR: Raw story data:', storyDto);
      
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
      
      console.log('🎯 SignalR: SETTING CURRENT STORY FOR ALL USERS!');
      console.log('🎯 SignalR: Story title:', currentStory.title);
      
      setGameState(prev => ({
        ...prev,
        currentStory: currentStory,
        votingInProgress: true,
        votesRevealed: false,
        revealCountdown: null,
        users: prev.users.map(p => ({ ...p, hasVoted: false, vote: undefined })),
      }));
    };

    // Lista de possíveis eventos de seleção de história
    const storySelectionEvents = [
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

    // Registra handlers para eventos de seleção de história
    storySelectionEvents.forEach(eventName => {
      connection.on(eventName, (data: any) => {
        console.log(`🎯 SignalR: Event '${eventName}' received with data:`, data);
        
        if (data && typeof data === 'object' && (data.id || data.storyId)) {
          console.log(`🎯 SignalR: Treating '${eventName}' as story selection event`);
          handleCurrentStorySet(data.story || data);
        }
      });
    });

    // Log de eventos registrados
    console.log('🎯 SignalR: All story and voting events registered successfully');
    console.log('🗳️ SignalR: Voting events: VoteSubmitted, VotingStatusChanged, VotesRevealed, VotingReset');
    console.log('🎯 SignalR: Story selection events:', storySelectionEvents.join(', '));
    console.log('🎯 SignalR: Connection state:', connection.state);
    console.log('🎯 SignalR: Connection ID:', connection.connectionId);
    
  }, [setGameState]);

  return {
    setupStoryEvents
  };
};
