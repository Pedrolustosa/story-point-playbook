
import { useEffect, useCallback, useState } from 'react';
import { GameState } from '../types/game';
import { useSignalRConnection } from './useSignalRConnection';
import { useSignalREventHandlers } from './useSignalREventHandlers';

export const useSignalR = (
  gameState: GameState,
  fetchParticipants: (roomId: string) => Promise<any[]>,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const [shouldConnect, setShouldConnect] = useState(false);
  const connection = useSignalRConnection(gameState);
  const eventHandlers = useSignalREventHandlers(gameState, fetchParticipants, setGameState);

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

  const handleReconnection = useCallback(async (hubConnection: any) => {
    if (gameState.roomCode && gameState.roomId && gameState.currentUser) {
      try {
        await hubConnection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentUser.id);
        console.log('SignalR: Rejoined room after reconnection');
        
        // Agenda uma atualização após reconexão (com delay maior)
        if (gameState.roomId) {
          eventHandlers.scheduleParticipantsRefresh(gameState.roomId, 7000);
        }
      } catch (error) {
        console.error('SignalR: Error rejoining room after reconnection:', error);
      }
    }
  }, [gameState.roomCode, gameState.roomId, gameState.currentUser, eventHandlers]);

  const initializeConnection = useCallback(async () => {
    const hubConnection = await connection.connectToHub(handleReconnection);
    
    if (hubConnection) {
      // Setup event handlers
      eventHandlers.setupAllEventHandlers(hubConnection);

      // Join the room
      if (gameState.roomCode && gameState.roomId && gameState.currentUser) {
        await hubConnection.invoke('JoinRoom', gameState.roomCode, gameState.roomId, gameState.currentUser.id);
        console.log('SignalR: Joined room successfully:', gameState.roomCode, 'with user:', gameState.currentUser.id);
        
        // Só agenda atualização de participantes se não temos dados ainda
        if (gameState.users.length <= 1 && gameState.roomId) {
          eventHandlers.scheduleParticipantsRefresh(gameState.roomId, 6000);
        }
      }
    }
  }, [connection, eventHandlers, gameState, handleReconnection]);

  // Always call useEffect for connection management
  useEffect(() => {
    if (shouldConnect) {
      console.log('SignalR: Room data available, attempting to connect');
      // Adiciona delay antes de conectar para evitar conflito com join inicial
      const timeoutId = setTimeout(() => {
        initializeConnection();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }

    return () => {
      if (connection.connection) {
        console.log('SignalR: Cleaning up connection on unmount');
        eventHandlers.clearParticipantTimeouts();
        connection.disconnectFromHub();
      }
    };
  }, [shouldConnect, initializeConnection, connection, eventHandlers]);

  // Always call useEffect for disconnection when leaving room
  useEffect(() => {
    if (!gameState.roomCode && connection.connection) {
      console.log('SignalR: Room code cleared, disconnecting');
      eventHandlers.clearParticipantTimeouts();
      connection.disconnectFromHub();
    }
  }, [gameState.roomCode, connection, eventHandlers]);

  return {
    connection: connection.connection,
    isConnected: connection.isConnected,
    connectionError: connection.connectionError,
    connectToHub: connection.connectToHub,
    disconnectFromHub: connection.disconnectFromHub
  };
};
