
import { httpClient } from './httpClient';
import { ChatMessageDto, GetChatHistoryQuery } from './types';

export interface SendMessageDto {
  message: string;
}

export class ChatService {
  private static readonly BASE_PATH = '/chat';

  static async getMessages(roomId: string) {
    const query: GetChatHistoryQuery = { roomId };
    return httpClient.get<ChatMessageDto[]>(`/rooms/${roomId}${this.BASE_PATH}`, { params: query });
  }

  static async sendMessage(roomCode: string, data: SendMessageDto) {
    return httpClient.post<ChatMessageDto>(`/rooms/${roomCode}${this.BASE_PATH}`, data);
  }
}
