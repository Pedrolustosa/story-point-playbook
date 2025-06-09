import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { GameState, User, Story } from '../types/game';

export const useSignalR = (
  gameState: GameState,
  fetchParticipants: (roomId: string) => Promise<any[]>,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const participantsRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Controle de debounce para atualizações de participantes com delay maior
  const scheduleParticipantsRefresh = useCallback((delay: number = 5000) => {
    if (participantsRefreshTimeoutRef.current) {
      clearTimeout(participantsRefreshTimeoutRef.current);
    }

    participantsRefreshTimeoutRef.current = setTimeout(async () => {
      if (gameState.roomId) {
        console.log('SignalR: Atualizando participantes (debounced)');
        try {
          await fetchParticipants(gameState.roomId);
          console.log('SignalR: Participantes atualizados com sucesso');
        } catch (error) {
          console.error('SignalR: Erro ao atualizar participantes:', error);
        }
      }
    }, delay);
  }, [gameState.roomId, fetchParticipants]);

  // Always call useEffect for checking connection conditions
  useEffect(() => {
    const hasRequiredData = !!(gameState.roomCode && gameState.roomId && gameState.currentUser);
    setShouldConnect(hasRequiredData);
    
    if (!hasRequiredData) {
      console.log('SignalR: Missing required data for connection', {
        roomCode: gameState.roomCode,
        roomId: gameState.roomId,
        currentUser: gameState.currentUser
      });
    }
  }, [gameState.roomCode, gameState.roomId, gameState.currentUser]);

  const connectToHub = useCallback(async () => {
    if (!shouldConnect || isConnectingRef.current || (connectionRef.current && isConnected)) {
      console.log('SignalR: Skipping connection - shouldConnect:', shouldConnect, 'isConnecting:', isConnectingRef.current, 'isConnected:', isConnected);
      return;
    }

    isConnectingRef.current = true;

    try {
      setConnectionError(null);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const hubUrl = `${baseUrl.replace('/api', '')}/gameHub`;
      
      console.log('SignalR: Connecting to hub:', hubUrl);

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Eventos SignalR existentes
      connection.on('UserJoined', async (userData: any) => {
        console.log('SignalR: User joined event received:', userData);
        scheduleParticipantsRefresh(3000);
      });

      connection.on('UserLeft', async (userId: string) => {
        console.log('SignalR: User left event received:', userId);
        scheduleParticipantsRefresh(3000);
      });

      connection.on('ParticipantCountUpdated', async (count: number) => {
        console.log('SignalR: Participant count updated:', count);
        scheduleParticipantsRefresh(5000);
      });

      connection.on('ParticipantsUpdated', async (participants: any[]) => {
        console.log('SignalR: Participants list updated directly:', participants.length, 'participantes');
        scheduleParticipantsRefresh(2000);
      });

      // Novos eventos para histórias
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

      // Handle connection state changes
      connection.onclose((error) => {
        console.log('SignalR: Connection closed', error);
        setIsConnected(false);
        isConnectingRef.current = false;
        if (error) {
          setConnectionError(error.message || 'Connection closed with error');
        }
        
        // Limpa timeout pendente
        if (participantsRefreshTimeoutRef.current) {
          clearTimeout(participantsRefreshTimeoutRef.current);
          participantsRefreshTimeoutRef.current = null;
        }
      });

      connection.onreconnecting((error) => {
        console.log('SignalR: Reconnecting...', error);
        setIsConnected(false);
      });

      connection.onreconnected(async (connectionId) => {
        console.log('SignalR: Reconnected with connection ID:', connectionId);
        setIsConnected(true);
        setConnectionError(null);
        
        if (gameState.roomCode && gameState.roomId && gameState.currentUser) {
          try {
            await connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentUser.id);
            console.log('SignalR: Rejoined room after reconnection');
            
            // Agenda uma atualização após reconexão (com delay maior)
            scheduleParticipantsRefresh(7000);
          } catch (error) {
            console.error('SignalR: Error rejoining room after reconnection:', error);
            setConnectionError(`Failed to rejoin room: ${error}`);
          }
        }
      });

      await connection.start();
      console.log('SignalR: Connection established successfully');
      setIsConnected(true);
      setConnectionError(null);

      // Join the room apenas se não temos participantes ainda
      if (gameState.roomCode && gameState.roomId && gameState.currentUser) {
        await connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentUser.id);
        console.log('SignalR: Joined room successfully:', gameState.roomCode, 'with user:', gameState.currentUser.id);
        
        // Só agenda atualização de participantes se não temos dados ainda
        if (gameState.users.length <= 1) {
          scheduleParticipantsRefresh(6000);
        }
      }

      connectionRef.current = connection;

    } catch (error) {
      console.error('SignalR: Error connecting to hub:', error);
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
    } finally {
      isConnectingRef.current = false;
    }
  }, [shouldConnect, isConnected, gameState, scheduleParticipantsRefresh, setGameState]);

  const disconnectFromHub = useCallback(async () => {
    // Limpa timeout pendente
    if (participantsRefreshTimeoutRef.current) {
      clearTimeout(participantsRefreshTimeoutRef.current);
      participantsRefreshTimeoutRef.current = null;
    }

    if (connectionRef.current) {
      try {
        if (gameState.roomCode && gameState.roomId && gameState.currentUser) {
          console.log('SignalR: Leaving room before disconnect');
          await connectionRef.current.invoke('LeaveRoom', gameState.roomCode, gameState.roomId, gameState.currentUser.id);
        }
        await connectionRef.current.stop();
        console.log('SignalR: Connection closed successfully');
      } catch (error) {
        console.error('SignalR: Error disconnecting:', error);
      } finally {
        connectionRef.current = null;
        setIsConnected(false);
        setConnectionError(null);
        isConnectingRef.current = false;
      }
    }
  }, [gameState.roomCode, gameState.roomId, gameState.currentUser]);

  // Always call useEffect for connection management
  useEffect(() => {
    if (shouldConnect) {
      console.log('SignalR: Room data available, attempting to connect');
      // Adiciona delay antes de conectar para evitar conflito com join inicial
      const timeoutId = setTimeout(() => {
        connectToHub();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }

    return () => {
      if (connectionRef.current) {
        console.log('SignalR: Cleaning up connection on unmount');
        disconnectFromHub();
      }
    };
  }, [shouldConnect, connectToHub, disconnectFromHub]);

  // Always call useEffect for disconnection when leaving room
  useEffect(() => {
    if (!gameState.roomCode && connectionRef.current) {
      console.log('SignalR: Room code cleared, disconnecting');
      disconnectFromHub();
    }
  }, [gameState.roomCode, disconnectFromHub]);

  return {
    connection: connectionRef.current,
    isConnected,
    connectionError,
    connectToHub,
    disconnectFromHub
  };
};
