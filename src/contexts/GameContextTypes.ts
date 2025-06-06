
import { GameState, Story } from '../types/game';

export interface GameContextType {
  gameState: GameState;
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  addStory: (story: Omit<Story, 'id' | 'isCompleted'>) => Promise<void>;
  setCurrentStory: (storyId: string) => Promise<void>;
  castVote: (vote: number | string) => Promise<void>;
  revealVotes: () => Promise<void>;
  resetVoting: () => void;
  leaveRoom: () => void;
  fetchParticipants: (roomId: string) => Promise<any[]>;
}
