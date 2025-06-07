
import { httpClient } from './httpClient';
import { ChatMessageDto, SendMessageRequest } from './types';

export class ChatService {
  static async getMessages(roomId: string) {
    return httpClient.get<ChatMessageDto[]>(`/rooms/${roomId}/chat`);
  }

  static async sendMessage(roomId: string, data: SendMessageRequest) {
    return httpClient.post(`/rooms/${roomId}/chat`, data);
  }
}
