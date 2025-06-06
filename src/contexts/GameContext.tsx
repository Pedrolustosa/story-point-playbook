
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ApiService } from '../services/api';
import { VotingScale } from '../services/api/types';

export interface Player {
  id: string;
  name: string;
  isModerator: boolean;
  isProductOwner: boolean;
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
  roomId: string;
  players: Player[];
  currentPlayer: Player | null;
  currentStory: Story | null;
  stories: Story[];
  votingInProgress: boolean;
  votesRevealed: boolean;
  revealCountdown: number | null;
  fibonacciCards: (number | string)[];
}

interface GameContextType {
  gameState: GameState;
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  addStory: (story: Omit<Story, 'id' | 'isCompleted'>) => Promise<void>;
  setCurrentStory: (storyId: string) => Promise<void>;
  castVote: (vote: number | string) => Promise<void>;
  revealVotes: () => Promise<void>;
  resetVoting: () => void;
  leaveRoom: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const fibonacciCards = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'];

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    roomId: '',
    players: [],
    currentPlayer: null,
    currentStory: null,
    stories: [],
    votingInProgress: false,
    votesRevealed: false,
    revealCountdown: null,
    fibonacciCards,
  });

  const generateRoomCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const createRoom = async (playerName: string) => {
    try {
      const response = await ApiService.rooms.createRoom({
        name: `Sala de ${playerName}`,
        scale: VotingScale.Fibonacci,
        timeLimit: 0,
        autoReveal: false,
      });

      const room = response.data;
      const newPlayer: Player = {
        id: '1',
        name: playerName,
        isModerator: true,
        isProductOwner: true,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode: room.code,
        roomId: room.id,
        players: [newPlayer],
        currentPlayer: newPlayer,
      }));
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      // Fallback para modo local
      const roomCode = generateRoomCode();
      const newPlayer: Player = {
        id: '1',
        name: playerName,
        isModerator: true,
        isProductOwner: true,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomCode,
        players: [newPlayer],
        currentPlayer: newPlayer,
      }));
    }
  };

  const joinRoom = async (roomCode: string, playerName: string) => {
    try {
      const response = await ApiService.rooms.joinRoom({
        roomCode,
        displayName: playerName,
        role: 'Developer',
      });

      const user = response.data;
      const newPlayer: Player = {
        id: user.id,
        name: user.displayName,
        isModerator: false,
        isProductOwner: false,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: user.roomId,
        players: [...prev.players, newPlayer],
        currentPlayer: newPlayer,
      }));
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      // Fallback para modo local
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: playerName,
        isModerator: false,
        isProductOwner: false,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomCode,
        players: [...prev.players, newPlayer],
        currentPlayer: newPlayer,
      }));
    }
  };

  const addStory = async (story: Omit<Story, 'id' | 'isCompleted'>) => {
    try {
      if (gameState.roomId) {
        const response = await ApiService.stories.createStory(gameState.roomId, {
          title: story.title,
          description: story.description,
        });

        const newStory: Story = {
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
          isCompleted: false,
        };

        setGameState(prev => ({
          ...prev,
          stories: [...prev.stories, newStory],
        }));
      }
    } catch (error) {
      console.error('Erro ao criar história:', error);
      // Fallback para modo local
      const newStory: Story = {
        ...story,
        id: Date.now().toString(),
        isCompleted: false,
      };

      setGameState(prev => ({
        ...prev,
        stories: [...prev.stories, newStory],
      }));
    }
  };

  const setCurrentStory = async (storyId: string) => {
    try {
      if (gameState.roomCode) {
        await ApiService.stories.setCurrentStory(gameState.roomCode, storyId);
      }
    } catch (error) {
      console.error('Erro ao definir história atual:', error);
    }

    const story = gameState.stories.find(s => s.id === storyId);
    if (story) {
      setGameState(prev => ({
        ...prev,
        currentStory: story,
        votingInProgress: true,
        votesRevealed: false,
        revealCountdown: null,
        players: prev.players.map(p => ({ ...p, hasVoted: false, vote: undefined })),
      }));
    }
  };

  const castVote = async (vote: number | string) => {
    if (!gameState.currentPlayer || gameState.currentPlayer.isProductOwner || !gameState.currentStory) return;

    try {
      await ApiService.stories.submitVote({
        storyId: gameState.currentStory.id,
        userId: gameState.currentPlayer.id,
        value: vote.toString(),
      });
    } catch (error) {
      console.error('Erro ao enviar voto:', error);
    }

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === prev.currentPlayer?.id
          ? { ...p, hasVoted: true, vote }
          : p
      ),
    }));
  };

  const revealVotes = async () => {
    try {
      if (gameState.currentStory) {
        await ApiService.stories.revealVotes(gameState.currentStory.id);
      }
    } catch (error) {
      console.error('Erro ao revelar votos:', error);
    }

    setGameState(prev => ({
      ...prev,
      revealCountdown: 3,
    }));

    // Iniciar countdown
    const countdownInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.revealCountdown === null) {
          clearInterval(countdownInterval);
          return prev;
        }
        
        if (prev.revealCountdown <= 1) {
          clearInterval(countdownInterval);
          return {
            ...prev,
            votesRevealed: true,
            votingInProgress: false,
            revealCountdown: null,
          };
        }
        
        return {
          ...prev,
          revealCountdown: prev.revealCountdown - 1,
        };
      });
    }, 1000);
  };

  const resetVoting = () => {
    setGameState(prev => ({
      ...prev,
      votingInProgress: true,
      votesRevealed: false,
      revealCountdown: null,
      players: prev.players.map(p => ({ ...p, hasVoted: false, vote: undefined })),
    }));
  };

  const leaveRoom = () => {
    setGameState({
      roomCode: '',
      roomId: '',
      players: [],
      currentPlayer: null,
      currentStory: null,
      stories: [],
      votingInProgress: false,
      votesRevealed: false,
      revealCountdown: null,
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
