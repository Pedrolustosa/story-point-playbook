
import { validateEnv } from '../../config/env';
import { RoomService } from './roomService';
import { StoryService } from './storyService';
import { ChatService } from './chatService';

// Valida as variáveis de ambiente na inicialização
validateEnv();

export const ApiService = {
  rooms: RoomService,
  stories: StoryService,
  chat: ChatService,
};

export * from './types';
export * from './httpClient';
export { RoomService, StoryService, ChatService };
