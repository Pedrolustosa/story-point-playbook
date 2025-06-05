
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Player {
  id: string;
  name: string;
  isModerator: boolean;
  hasVoted: boolean;
  vote?: number | string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  estimate?: number;
  isCompleted: boolean;
}

export interface GameState {
  roomCode: string;
  players: Player[];
  currentPlayer: Player | null;
  currentStory: Story | null;
  stories: Story[];
  votingInProgress: boolean;
  votesRevealed: boolean;
  fibonacciCards: (number | string)[];
}

interface GameContextType {
  gameState: GameState;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  addStory: (story: Omit<Story, 'id' | 'isCompleted'>) => void;
  setCurrentStory: (storyId: string) => void;
  castVote: (vote: number | string) => void;
  revealVotes: () => void;
  resetVoting: () => void;
  leaveRoom: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const fibonacciCards = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'];

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    players: [],
    currentPlayer: null,
    currentStory: null,
    stories: [],
    votingInProgress: false,
    votesRevealed: false,
    fibonacciCards,
  });

  const generateRoomCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const createRoom = (playerName: string) => {
    const roomCode = generateRoomCode();
    const newPlayer: Player = {
      id: '1',
      name: playerName,
      isModerator: true,
      hasVoted: false,
    };

    setGameState(prev => ({
      ...prev,
      roomCode,
      players: [newPlayer],
      currentPlayer: newPlayer,
    }));
  };

  const joinRoom = (roomCode: string, playerName: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerName,
      isModerator: false,
      hasVoted: false,
    };

    setGameState(prev => ({
      ...prev,
      roomCode,
      players: [...prev.players, newPlayer],
      currentPlayer: newPlayer,
    }));
  };

  const addStory = (story: Omit<Story, 'id' | 'isCompleted'>) => {
    const newStory: Story = {
      ...story,
      id: Date.now().toString(),
      isCompleted: false,
    };

    setGameState(prev => ({
      ...prev,
      stories: [...prev.stories, newStory],
    }));
  };

  const setCurrentStory = (storyId: string) => {
    const story = gameState.stories.find(s => s.id === storyId);
    if (story) {
      setGameState(prev => ({
        ...prev,
        currentStory: story,
        votingInProgress: true,
        votesRevealed: false,
        players: prev.players.map(p => ({ ...p, hasVoted: false, vote: undefined })),
      }));
    }
  };

  const castVote = (vote: number | string) => {
    if (!gameState.currentPlayer) return;

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === prev.currentPlayer?.id
          ? { ...p, hasVoted: true, vote }
          : p
      ),
    }));
  };

  const revealVotes = () => {
    setGameState(prev => ({
      ...prev,
      votesRevealed: true,
      votingInProgress: false,
    }));
  };

  const resetVoting = () => {
    setGameState(prev => ({
      ...prev,
      votingInProgress: true,
      votesRevealed: false,
      players: prev.players.map(p => ({ ...p, hasVoted: false, vote: undefined })),
    }));
  };

  const leaveRoom = () => {
    setGameState({
      roomCode: '',
      players: [],
      currentPlayer: null,
      currentStory: null,
      stories: [],
      votingInProgress: false,
      votesRevealed: false,
      fibonacciCards,
    });
  };

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
