
import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { GameState, User } from '../types/game';

export const useSignalR = (
  gameState: GameState,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);

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
    if (!shouldConnect || (connectionRef.current && isConnected)) {
      return;
    }

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

      // Set up event handlers for real-time participant updates
      connection.on('UserJoined', async (userData: any) => {
        console.log('SignalR: User joined event received:', userData);
        
        if (gameState.roomId) {
          console.log('SignalR: Fetching updated participants after user joined');
          try {
            await fetchParticipants(gameState.roomId);
            console.log('SignalR: Participants refreshed successfully after user joined');
          } catch (error) {
            console.error('SignalR: Error fetching participants after user joined:', error);
          }
        }
      });

      connection.on('UserLeft', async (userId: string) => {
        console.log('SignalR: User left event received:', userId);
        
        if (gameState.roomId) {
          console.log('SignalR: Fetching updated participants after user left');
          try {
            await fetchParticipants(gameState.roomId);
            console.log('SignalR: Participants refreshed successfully after user left');
          } catch (error) {
            console.error('SignalR: Error fetching participants after user left:', error);
          }
        }
      });

      connection.on('ParticipantCountUpdated', async (count: number) => {
        console.log('SignalR: Participant count updated:', count);
        
        if (gameState.roomId) {
          console.log('SignalR: Fetching updated participants after count change');
          try {
            await fetchParticipants(gameState.roomId);
            console.log('SignalR: Participants refreshed successfully after count change');
          } catch (error) {
            console.error('SignalR: Error fetching participants after count change:', error);
          }
        }
      });

      connection.on('ParticipantsUpdated', async (participants: any[]) => {
        console.log('SignalR: Participants list updated directly:', participants);
        
        if (gameState.roomId) {
          console.log('SignalR: Fetching from API to maintain consistency');
          try {
            await fetchParticipants(gameState.roomId);
            console.log('SignalR: Participants refreshed successfully from direct update');
          } catch (error) {
            console.error('SignalR: Error fetching participants from direct update:', error);
          }
        }
      });

      // Handle connection state changes
      connection.onclose((error) => {
        console.log('SignalR: Connection closed', error);
        setIsConnected(false);
        if (error) {
          setConnectionError(error.message || 'Connection closed with error');
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
            
            await fetchParticipants(gameState.roomId);
            console.log('SignalR: Participants refreshed after reconnection');
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

      // Join the room
      if (gameState.roomCode && gameState.roomId && gameState.currentUser) {
        await connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentUser.id);
        console.log('SignalR: Joined room successfully:', gameState.roomCode, 'with user:', gameState.currentUser.id);
      }

      connectionRef.current = connection;

    } catch (error) {
      console.error('SignalR: Error connecting to hub:', error);
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
    }
  }, [shouldConnect, isConnected, gameState, fetchParticipants]);

  const disconnectFromHub = useCallback(async () => {
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
      }
    }
  }, [gameState.roomCode, gameState.roomId, gameState.currentUser]);

  // Always call useEffect for connection management
  useEffect(() => {
    if (shouldConnect) {
      console.log('SignalR: Room data available, attempting to connect');
      connectToHub();
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
