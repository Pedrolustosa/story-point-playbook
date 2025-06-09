
import { useCallback, useRef, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { GameState } from '../types/game';

export const useSignalRConnection = (gameState: GameState) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const isConnectingRef = useRef(false);

  const createConnection = useCallback(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const hubUrl = `${baseUrl.replace('/api', '')}/gameHub`;
    
    console.log('SignalR: Creating connection to hub:', hubUrl);

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    return connection;
  }, []);

  const connectToHub = useCallback(async (
    onReconnected?: (connection: HubConnection) => Promise<void>
  ) => {
    if (isConnectingRef.current || (connectionRef.current && isConnected)) {
      console.log('SignalR: Skipping connection - isConnecting:', isConnectingRef.current, 'isConnected:', isConnected);
      return null;
    }

    isConnectingRef.current = true;

    try {
      setConnectionError(null);
      const connection = createConnection();

      // Handle connection state changes
      connection.onclose((error) => {
        console.log('SignalR: Connection closed', error);
        setIsConnected(false);
        isConnectingRef.current = false;
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
        
        if (onReconnected) {
          await onReconnected(connection);
        }
      });

      await connection.start();
      console.log('SignalR: Connection established successfully');
      setIsConnected(true);
      setConnectionError(null);

      connectionRef.current = connection;
      return connection;

    } catch (error) {
      console.error('SignalR: Error connecting to hub:', error);
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
      return null;
    } finally {
      isConnectingRef.current = false;
    }
  }, [isConnected, createConnection]);

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
        isConnectingRef.current = false;
      }
    }
  }, [gameState.roomCode, gameState.roomId, gameState.currentUser]);

  return {
    connection: connectionRef.current,
    isConnected,
    connectionError,
    connectToHub,
    disconnectFromHub
  };
};
