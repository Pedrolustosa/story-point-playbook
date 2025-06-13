import { httpClient } from './httpClient';
import { AddStoryCommand, StoryDto, SubmitVoteCommand, VoteResultDto, VotingStatusDto } from './types';

export class StoryService {
  static async createStory(roomId: string, data: Omit<AddStoryCommand, 'roomId'>) {
    const command: AddStoryCommand = { ...data, roomId };
    return httpClient.post<StoryDto>(`/rooms/${roomId}/stories`, command);
  }

  static async getStories(roomId: string) {
    return httpClient.get<StoryDto[]>(`/rooms/${roomId}/stories`);
  }

  static async selectStoryForVoting(roomId: string, storyId: string) {
    return httpClient.post(`/rooms/${roomId}/stories/${storyId}/select`);
  }

  static async submitVote(command: SubmitVoteCommand) {
    return httpClient.post(`/stories/${command.storyId}/votes`, command);
  }

  static async revealVotes(storyId: string) {
    return httpClient.post(`/stories/${storyId}/reveal`);
  }

  static async getRevealedVotes(roomId: string, storyId: string) {
    return httpClient.get<VoteResultDto[]>(`/rooms/${roomId}/stories/${storyId}/votes`);
  }

  static async deleteStory(roomCode: string, storyId: string) {
    return httpClient.delete(`/rooms/${roomCode}/stories/${storyId}`);
  }

  static async getVotingStatus(roomId: string, storyId: string) {
    return httpClient.get<VotingStatusDto[]>(`/rooms/${roomId}/stories/${storyId}/voting-status`);
  }
}
