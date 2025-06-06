
import { httpClient } from './httpClient';
import { AddStoryCommand, StoryDto, SubmitVoteCommand } from './types';

export class StoryService {
  static async createStory(roomId: string, data: Omit<AddStoryCommand, 'roomId'>) {
    const command: AddStoryCommand = { ...data, roomId };
    return httpClient.post<StoryDto>(`/rooms/${roomId}/stories`, command);
  }

  static async getStories(roomId: string) {
    return httpClient.get<StoryDto[]>(`/rooms/${roomId}/stories`);
  }

  static async setCurrentStory(roomCode: string, storyId: string) {
    return httpClient.put(`/rooms/${roomCode}/stories/${storyId}/set-current`);
  }

  static async submitVote(command: SubmitVoteCommand) {
    return httpClient.post(`/stories/${command.storyId}/votes`, command);
  }

  static async revealVotes(storyId: string) {
    return httpClient.post(`/stories/${storyId}/reveal`);
  }

  static async deleteStory(roomCode: string, storyId: string) {
    return httpClient.delete(`/rooms/${roomCode}/stories/${storyId}`);
  }
}
