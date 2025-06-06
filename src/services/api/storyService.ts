
import { httpClient } from './httpClient';
import { AddStoryCommand, StoryDto, SubmitVoteCommand, RevealVotesCommand } from './types';

export class StoryService {
  private static readonly BASE_PATH = '/stories';

  static async createStory(roomId: string, data: Omit<AddStoryCommand, 'roomId'>) {
    const command: AddStoryCommand = { ...data, roomId };
    return httpClient.post<StoryDto>(`/rooms/${roomId}${this.BASE_PATH}`, command);
  }

  static async getStories(roomId: string) {
    return httpClient.get<StoryDto[]>(`/rooms/${roomId}${this.BASE_PATH}`);
  }

  static async setCurrentStory(roomCode: string, storyId: string) {
    return httpClient.put(`/rooms/${roomCode}${this.BASE_PATH}/${storyId}/set-current`);
  }

  static async submitVote(command: SubmitVoteCommand) {
    return httpClient.post(`${this.BASE_PATH}/${command.storyId}/votes`, command);
  }

  static async revealVotes(command: RevealVotesCommand) {
    return httpClient.post(`${this.BASE_PATH}/${command.storyId}/reveal`, command);
  }

  static async deleteStory(roomCode: string, storyId: string) {
    return httpClient.delete(`/rooms/${roomCode}${this.BASE_PATH}/${storyId}`);
  }
}
