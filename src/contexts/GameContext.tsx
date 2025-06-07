
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

  // Use participant notifications hook
  useParticipantNotifications(gameState.users, gameState.currentUser);

  // Use SignalR for real-time updates
  const { connection, isConnected, connectionError } = useSignalR(gameState, roomOperations.fetchParticipants);

  return (
    <GameContext.Provider
      value={{
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
        signalRConnection: connection,
        isSignalRConnected: isConnected,
        connectionError,
      }}
    >
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
