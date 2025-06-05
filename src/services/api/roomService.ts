
import { httpClient } from './httpClient';
import { CreateRoomDto, JoinRoomDto, RoomDto } from './types';

export class RoomService {
  private static readonly BASE_PATH = '/rooms';

  static async createRoom(data: CreateRoomDto) {
    return httpClient.post<RoomDto>(`${this.BASE_PATH}`, data);
  }

  static async joinRoom(data: JoinRoomDto) {
    return httpClient.post<RoomDto>(`${this.BASE_PATH}/join`, data);
  }

  static async getRoom(roomCode: string) {
    return httpClient.get<RoomDto>(`${this.BASE_PATH}/${roomCode}`);
  }

  static async leaveRoom(roomCode: string, playerId: string) {
    return httpClient.delete(`${this.BASE_PATH}/${roomCode}/players/${playerId}`);
  }

  static async deleteRoom(roomCode: string) {
    return httpClient.delete(`${this.BASE_PATH}/${roomCode}`);
  }
}
