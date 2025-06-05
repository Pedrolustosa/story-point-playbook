
import { validateEnv } from '../../config/env';
import { RoomService } from './roomService';
import { StoryService } from './storyService';
import { VotingService } from './votingService';
import { ChatService } from './chatService';

// Valida as variáveis de ambiente na inicialização
validateEnv();

export const ApiService = {
  rooms: RoomService,
  stories: StoryService,
  voting: VotingService,
  chat: ChatService,
};

export * from './types';
export * from './httpClient';
export { RoomService, StoryService, VotingService, ChatService };
