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

export interface SendMessageRequest {
  UserName: string;
  Message: string;
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
  createdBy: UserDto; // Adicionar a propriedade createdBy
}

export interface StoryDto {
  id: string;
  title: string;
  description: string;
  roomId: string;
}

// DTO atualizado para corresponder ao backend
export interface UserDto {
  id: string;
  name: string;  // Mudou de displayName para name
  role: string;
  roomId?: string; // Opcional, nem sempre presente
}

export interface VoteEntryDto {
  user: string;
  value: string;
}

// Resposta padrão da API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
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

export interface VoteResultDto {
  userName: string;
  value: string;
  isRevealed: boolean;
}
