
import { httpClient } from './httpClient';
import { CreateRoomCommand, JoinRoomCommand, RoomDto, UserDto } from './types';

export class RoomService {
  private static readonly BASE_PATH = '/rooms';

  static async createRoom(data: CreateRoomCommand) {
    return httpClient.post<RoomDto>(`${this.BASE_PATH}`, data);
  }

  static async joinRoom(data: JoinRoomCommand) {
    return httpClient.post<UserDto>(`${this.BASE_PATH}/join`, data);
  }

  static async getRoom(roomCode: string) {
    return httpClient.get<RoomDto>(`${this.BASE_PATH}/${roomCode}`);
  }

  static async leaveRoom(roomCode: string, userId: string) {
    return httpClient.delete(`${this.BASE_PATH}/${roomCode}/users/${userId}`);
  }

  static async deleteRoom(roomCode: string) {
    return httpClient.delete(`${this.BASE_PATH}/${roomCode}`);
  }
}
