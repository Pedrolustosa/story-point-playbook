
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
