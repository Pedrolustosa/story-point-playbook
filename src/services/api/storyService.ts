
import { httpClient } from './httpClient';
import { CreateStoryDto, StoryDto } from './types';

export class StoryService {
  private static readonly BASE_PATH = '/stories';

  static async createStory(roomCode: string, data: CreateStoryDto) {
    return httpClient.post<StoryDto>(`/rooms/${roomCode}${this.BASE_PATH}`, data);
  }

  static async getStories(roomCode: string) {
    return httpClient.get<StoryDto[]>(`/rooms/${roomCode}${this.BASE_PATH}`);
  }

  static async setCurrentStory(roomCode: string, storyId: string) {
    return httpClient.put(`/rooms/${roomCode}${this.BASE_PATH}/${storyId}/set-current`);
  }

  static async updateStoryEstimate(roomCode: string, storyId: string, estimate: number) {
    return httpClient.put(`/rooms/${roomCode}${this.BASE_PATH}/${storyId}/estimate`, { estimate });
  }

  static async deleteStory(roomCode: string, storyId: string) {
    return httpClient.delete(`/rooms/${roomCode}${this.BASE_PATH}/${storyId}`);
  }
}
