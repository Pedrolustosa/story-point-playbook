
// DTOs que correspondem aos modelos da API .NET
export interface CreateRoomCommand {
  name: string;
  createdBy: string; // Campo obrigatório que estava faltando
  scale: VotingScale;
  timeLimit: number;
  autoReveal: boolean;
}

export interface JoinRoomCommand {
  roomCode: string;
  displayName: string;
  role: string;
}

export interface AddStoryCommand {
  roomId: string;
  title: string;
  description: string;
}

export interface SubmitVoteCommand {
  storyId: string;
  userId: string;
  value: string;
}

export interface ChatMessageDto {
  user: string;
  message: string;
  timestamp: string;
}

export interface RoomDto {
  id: string;
  code: string;
  name: string;
}

export interface StoryDto {
  id: string;
  title: string;
  description: string;
  roomId: string;
}

export interface UserDto {
  id: string;
  displayName: string;
  role: string;
  roomId: string;
}

export interface VoteEntryDto {
  user: string;
  value: string;
}

export enum VotingScale {
  Fibonacci = 0,
  Modified = 1,
  TShirt = 2,
  Powers = 3
}

// Tipos antigos mantidos por compatibilidade - serão removidos gradualmente
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

export interface PlayerDto {
  id: string;
  name: string;
  isModerator: boolean;
  hasVoted: boolean;
  vote?: number | string;
  joinedAt: string;
}

export interface VoteDto {
  id: string;
  playerId: string;
  storyId: string;
  value: number | string;
  createdAt: string;
}
