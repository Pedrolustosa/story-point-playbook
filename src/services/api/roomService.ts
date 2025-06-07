
import { httpClient } from './httpClient';
import { CreateRoomCommand, JoinRoomCommand, RoomDto, UserDto } from './types';

export class RoomService {
  private static readonly BASE_PATH = '/rooms';

  static async createRoom(data: CreateRoomCommand) {
    return httpClient.post<RoomDto>(`${this.BASE_PATH}`, data);
  }

  static async joinRoom(roomCode: string, data: Omit<JoinRoomCommand, 'roomCode'>) {
    // Include the roomCode in the request body as required by the API
    const requestData: JoinRoomCommand = {
      ...data,
      roomCode
    };
    return httpClient.post<UserDto>(`${this.BASE_PATH}/${roomCode}/join`, requestData);
  }

  static async getRoom(roomCode: string) {
    return httpClient.get<RoomDto>(`${this.BASE_PATH}/${roomCode}`);
  }

  static async getParticipants(roomId: string) {
    return httpClient.get<UserDto[]>(`${this.BASE_PATH}/${roomId}/participants`);
  }

  static async leaveRoom(roomCode: string, userId: string) {
    return httpClient.delete(`${this.BASE_PATH}/${roomCode}/users/${userId}`);
  }

  static async deleteRoom(roomCode: string) {
    return httpClient.delete(`${this.BASE_PATH}/${roomCode}`);
  }
}
