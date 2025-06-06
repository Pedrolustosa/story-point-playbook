
import { httpClient } from './httpClient';
import { ChatMessageDto } from './types';

export interface SendMessageRequest {
  UserName: string;
  Message: string;
}

export class ChatService {
  static async getMessages(roomId: string) {
    return httpClient.get<ChatMessageDto[]>(`/rooms/${roomId}/chat`);
  }

  static async sendMessage(roomId: string, data: SendMessageRequest) {
    return httpClient.post<ChatMessageDto>(`/rooms/${roomId}/chat`, data);
  }
}
