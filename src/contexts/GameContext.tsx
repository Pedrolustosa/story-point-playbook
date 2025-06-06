
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameState } from '../types/game';
import { GameContextType } from './GameContextTypes';
import { createInitialGameState } from '../utils/gameUtils';
import { useRoomOperations } from '../hooks/useRoomOperations';
import { useStoryOperations } from '../hooks/useStoryOperations';
import { useVotingOperations } from '../hooks/useVotingOperations';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());

  const { createRoom, joinRoom, leaveRoom } = useRoomOperations(gameState, setGameState);
  const { addStory, setCurrentStory } = useStoryOperations(gameState, setGameState);
  const { castVote, revealVotes, resetVoting } = useVotingOperations(gameState, setGameState);

  return (
    <GameContext.Provider
      value={{
        gameState,
        createRoom,
        joinRoom,
        addStory,
        setCurrentStory,
        castVote,
        revealVotes,
        resetVoting,
        leaveRoom,
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
export type { Player, Story, GameState } from '../types/game';
