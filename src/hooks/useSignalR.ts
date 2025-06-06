
import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { GameState } from '../types/game';

export const useSignalR = (
  gameState: GameState,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connectToHub = useCallback(async () => {
    if (!gameState.roomCode || !gameState.roomId || !gameState.currentPlayer) {
      console.log('SignalR: Missing required data for connection', {
        roomCode: gameState.roomCode,
        roomId: gameState.roomId,
        currentPlayer: gameState.currentPlayer
      });
      return;
    }

    if (connectionRef.current && isConnected) {
      console.log('SignalR: Already connected');
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

      // Set up event handlers
      connection.on('UserJoined', async (userId: string) => {
        console.log('SignalR: User joined event received:', userId);
        console.log('SignalR: Current room data:', { roomId: gameState.roomId, roomCode: gameState.roomCode });
        if (gameState.roomId) {
          console.log('SignalR: Fetching participants after user joined');
          try {
            await fetchParticipants(gameState.roomId);
            console.log('SignalR: Successfully fetched participants after user joined');
          } catch (error) {
            console.error('SignalR: Error fetching participants after user joined:', error);
          }
        }
      });

      connection.on('UserLeft', async (userId: string) => {
        console.log('SignalR: User left event received:', userId);
        console.log('SignalR: Current room data:', { roomId: gameState.roomId, roomCode: gameState.roomCode });
        if (gameState.roomId) {
          console.log('SignalR: Fetching participants after user left');
          try {
            await fetchParticipants(gameState.roomId);
            console.log('SignalR: Successfully fetched participants after user left');
          } catch (error) {
            console.error('SignalR: Error fetching participants after user left:', error);
          }
        }
      });

      connection.on('ParticipantCountUpdated', (count: number) => {
        console.log('SignalR: Participant count updated:', count);
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
        if (gameState.roomCode && gameState.roomId && gameState.currentPlayer) {
          try {
            await connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentPlayer.id);
            console.log('SignalR: Rejoined room after reconnection');
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
      await connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentPlayer.id);
      console.log('SignalR: Joined room successfully:', gameState.roomCode);

      connectionRef.current = connection;

    } catch (error) {
      console.error('SignalR: Error connecting to hub:', error);
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
    }
  }, [gameState.roomCode, gameState.roomId, gameState.currentPlayer, fetchParticipants, isConnected]);

  const disconnectFromHub = useCallback(async () => {
    if (connectionRef.current) {
      try {
        if (gameState.roomCode && gameState.roomId && gameState.currentPlayer) {
          console.log('SignalR: Leaving room before disconnect');
          await connectionRef.current.invoke('LeaveRoom', gameState.roomCode, gameState.roomId, gameState.currentPlayer.id);
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
  }, [gameState.roomCode, gameState.roomId, gameState.currentPlayer]);

  // Connect when room is available
  useEffect(() => {
    if (gameState.roomCode && gameState.roomId && gameState.currentPlayer) {
      console.log('SignalR: Room data available, attempting to connect');
      connectToHub();
    }

    return () => {
      if (connectionRef.current) {
        console.log('SignalR: Cleaning up connection on unmount');
        disconnectFromHub();
      }
    };
  }, [gameState.roomCode, gameState.roomId, gameState.currentPlayer?.id]);

  // Disconnect when leaving room
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
