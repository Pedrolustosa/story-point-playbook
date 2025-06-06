
import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { GameState } from '../types/game';

export const useSignalR = (
  gameState: GameState,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
        if (gameState.roomId) {
          console.log('SignalR: Fetching participants after user joined');
          await fetchParticipants(gameState.roomId);
        }
      });

      connection.on('UserLeft', async (userId: string) => {
        console.log('SignalR: User left event received:', userId);
        if (gameState.roomId) {
          console.log('SignalR: Fetching participants after user left');
          await fetchParticipants(gameState.roomId);
        }
      });

      connection.on('ParticipantCountUpdated', (count: number) => {
        console.log('SignalR: Participant count updated:', count);
      });

      // Handle connection state changes
      connection.onclose(() => {
        console.log('SignalR: Connection closed');
        setIsConnected(false);
      });

      connection.onreconnecting(() => {
        console.log('SignalR: Reconnecting...');
        setIsConnected(false);
      });

      connection.onreconnected(async () => {
        console.log('SignalR: Reconnected, rejoining room');
        setIsConnected(true);
        if (gameState.roomCode && gameState.roomId && gameState.currentPlayer) {
          try {
            await connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentPlayer.id);
            console.log('SignalR: Rejoined room after reconnection');
          } catch (error) {
            console.error('SignalR: Error rejoining room after reconnection:', error);
          }
        }
      });

      await connection.start();
      console.log('SignalR: Connection established successfully');
      setIsConnected(true);

      // Join the room
      await connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentPlayer.id);
      console.log('SignalR: Joined room successfully:', gameState.roomCode);

      connectionRef.current = connection;

    } catch (error) {
      console.error('SignalR: Error connecting to hub:', error);
      setIsConnected(false);
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
        console.log('SignalR: Cleaning up connection');
        disconnectFromHub();
      }
    };
  }, [gameState.roomCode, gameState.roomId, gameState.currentPlayer?.id, connectToHub, disconnectFromHub]);

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
    connectToHub,
    disconnectFromHub
  };
};
