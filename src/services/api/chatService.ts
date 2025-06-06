
import { httpClient } from './httpClient';
import { ChatMessageDto } from './types';

export interface SendMessageDto {
  message: string;
}

export class ChatService {
  private static readonly BASE_PATH = '/chat';

  static async getMessages(roomId: string) {
    return httpClient.get<ChatMessageDto[]>(`/rooms/${roomId}${this.BASE_PATH}`);
  }

  static async sendMessage(roomCode: string, data: SendMessageDto) {
    return httpClient.post<ChatMessageDto>(`/rooms/${roomCode}${this.BASE_PATH}`, data);
  }
}
