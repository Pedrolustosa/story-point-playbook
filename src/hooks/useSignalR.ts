
import { useEffect, useRef, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { GameState } from '../types/game';

export const useSignalR = (
  gameState: GameState,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const isConnectedRef = useRef(false);

  const connectToHub = useCallback(async () => {
    if (!gameState.roomCode || !gameState.roomId || !gameState.currentPlayer) {
      return;
    }

    if (connectionRef.current && isConnectedRef.current) {
      console.log('SignalR already connected');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const hubUrl = `${baseUrl}/gameHub`;
      
      console.log('Connecting to SignalR hub:', hubUrl);

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      connection.on('UserJoined', (userId: string) => {
        console.log('SignalR: User joined:', userId);
        if (gameState.roomId) {
          fetchParticipants(gameState.roomId);
        }
      });

      connection.on('UserLeft', (userId: string) => {
        console.log('SignalR: User left:', userId);
        if (gameState.roomId) {
          fetchParticipants(gameState.roomId);
        }
      });

      connection.on('ParticipantCountUpdated', (count: number) => {
        console.log('SignalR: Participant count updated:', count);
      });

      // Handle reconnection
      connection.onreconnected(() => {
        console.log('SignalR reconnected, rejoining room');
        if (gameState.roomCode && gameState.roomId && gameState.currentPlayer) {
          connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentPlayer.id);
        }
      });

      await connection.start();
      console.log('SignalR connection established');

      // Join the room
      await connection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentPlayer.id);
      console.log('Joined SignalR room:', gameState.roomCode);

      connectionRef.current = connection;
      isConnectedRef.current = true;

    } catch (error) {
      console.error('Error connecting to SignalR:', error);
    }
  }, [gameState.roomCode, gameState.roomId, gameState.currentPlayer, fetchParticipants]);

  const disconnectFromHub = useCallback(async () => {
    if (connectionRef.current && isConnectedRef.current) {
      try {
        if (gameState.roomCode && gameState.roomId && gameState.currentPlayer) {
          await connectionRef.current.invoke('LeaveRoom', gameState.roomCode, gameState.roomId, gameState.currentPlayer.id);
        }
        await connectionRef.current.stop();
        console.log('SignalR connection closed');
      } catch (error) {
        console.error('Error disconnecting from SignalR:', error);
      } finally {
        connectionRef.current = null;
        isConnectedRef.current = false;
      }
    }
  }, [gameState.roomCode, gameState.roomId, gameState.currentPlayer]);

  // Connect when room is available
  useEffect(() => {
    if (gameState.roomCode && gameState.roomId && gameState.currentPlayer) {
      connectToHub();
    }

    return () => {
      if (isConnectedRef.current) {
        disconnectFromHub();
      }
    };
  }, [gameState.roomCode, gameState.roomId, gameState.currentPlayer?.id, connectToHub, disconnectFromHub]);

  // Disconnect when leaving room
  useEffect(() => {
    if (!gameState.roomCode && connectionRef.current) {
      disconnectFromHub();
    }
  }, [gameState.roomCode, disconnectFromHub]);

  return {
    connection: connectionRef.current,
    isConnected: isConnectedRef.current,
    connectToHub,
    disconnectFromHub
  };
};
