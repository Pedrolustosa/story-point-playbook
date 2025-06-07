
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameState } from '../types/game';
import { GameContextType } from './GameContextTypes';
import { createInitialGameState } from '../utils/gameUtils';
import { useRoomOperations } from '../hooks/useRoomOperations';
import { useStoryOperations } from '../hooks/useStoryOperations';
import { useVotingOperations } from '../hooks/useVotingOperations';
import { useParticipantNotifications } from '../hooks/useParticipantNotifications';
import { useSignalR } from '../hooks/useSignalR';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());

  // Initialize room operations with proper dependency order
  const roomOperations = useRoomOperations(gameState, setGameState);
  const storyOperations = useStoryOperations(gameState, setGameState);
  const votingOperations = useVotingOperations(gameState, setGameState);

  // Use participant notifications hook only when we have users and current user
  const shouldUseNotifications = gameState.users.length > 0 && gameState.currentUser;
  if (shouldUseNotifications) {
    useParticipantNotifications(gameState.users, gameState.currentUser);
  }

  // Use SignalR for real-time updates only when we have room data
  const shouldUseSignalR = gameState.roomCode && gameState.roomId && gameState.currentUser;
  const signalRResult = useSignalR(
    shouldUseSignalR ? gameState : { ...gameState, roomCode: '', roomId: '', currentUser: null },
    roomOperations.fetchParticipants
  );

  const contextValue: GameContextType = {
    gameState,
    createRoom: roomOperations.createRoom,
    joinRoom: roomOperations.joinRoom,
    addStory: storyOperations.addStory,
    setCurrentStory: storyOperations.setCurrentStory,
    castVote: votingOperations.castVote,
    revealVotes: votingOperations.revealVotes,
    resetVoting: votingOperations.resetVoting,
    leaveRoom: roomOperations.leaveRoom,
    fetchParticipants: roomOperations.fetchParticipants,
    isCreatingRoom: roomOperations.isCreatingRoom,
    signalRConnection: shouldUseSignalR ? signalRResult.connection : null,
    isSignalRConnected: shouldUseSignalR ? signalRResult.isConnected : false,
    connectionError: shouldUseSignalR ? signalRResult.connectionError : null,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Re-export types for backwards compatibility
export type { User, Story, GameState } from '../types/game';
