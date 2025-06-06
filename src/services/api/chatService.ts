
import { httpClient } from './httpClient';
import { ChatMessageDto } from './types';

export interface SendMessageDto {
  message: string;
}

export class ChatService {
  static async getMessages(roomId: string) {
    return httpClient.get<ChatMessageDto[]>(`/rooms/${roomId}/chat`);
  }

  static async sendMessage(roomId: string, data: SendMessageDto) {
    return httpClient.post<ChatMessageDto>(`/rooms/${roomId}/chat`, data);
  }
}
