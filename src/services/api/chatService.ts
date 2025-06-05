
import { httpClient } from './httpClient';

export interface ChatMessage {
  id: string;
  roomCode: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

export interface SendMessageDto {
  message: string;
}

export class ChatService {
  private static readonly BASE_PATH = '/chat';

  static async getMessages(roomCode: string) {
    return httpClient.get<ChatMessage[]>(`/rooms/${roomCode}${this.BASE_PATH}`);
  }

  static async sendMessage(roomCode: string, data: SendMessageDto) {
    return httpClient.post<ChatMessage>(`/rooms/${roomCode}${this.BASE_PATH}`, data);
  }
}
