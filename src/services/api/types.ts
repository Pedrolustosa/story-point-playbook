
// DTOs que correspondem aos modelos da API .NET
export interface CreateRoomDto {
  moderatorName: string;
}

export interface JoinRoomDto {
  roomCode: string;
  playerName: string;
}

export interface CreateStoryDto {
  title: string;
  description?: string;
}

export interface CastVoteDto {
  roomCode: string;
  playerId: string;
  vote: number | string;
}

export interface RoomDto {
  id: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  players: PlayerDto[];
  stories: StoryDto[];
  currentStoryId?: string;
  votingInProgress: boolean;
  votesRevealed: boolean;
}

export interface PlayerDto {
  id: string;
  name: string;
  isModerator: boolean;
  hasVoted: boolean;
  vote?: number | string;
  joinedAt: string;
}

export interface StoryDto {
  id: string;
  title: string;
  description?: string;
  estimate?: number;
  isCompleted: boolean;
  createdAt: string;
}

export interface VoteDto {
  id: string;
  playerId: string;
  storyId: string;
  value: number | string;
  createdAt: string;
}
