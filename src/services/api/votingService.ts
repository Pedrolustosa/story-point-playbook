
import { httpClient } from './httpClient';
import { CastVoteDto, VoteDto } from './types';

export class VotingService {
  private static readonly BASE_PATH = '/voting';

  static async castVote(data: CastVoteDto) {
    return httpClient.post<VoteDto>(`${this.BASE_PATH}/cast`, data);
  }

  static async getVotes(roomCode: string, storyId: string) {
    return httpClient.get<VoteDto[]>(`${this.BASE_PATH}/${roomCode}/stories/${storyId}`);
  }

  static async revealVotes(roomCode: string, storyId: string) {
    return httpClient.post(`${this.BASE_PATH}/${roomCode}/stories/${storyId}/reveal`);
  }

  static async resetVoting(roomCode: string, storyId: string) {
    return httpClient.post(`${this.BASE_PATH}/${roomCode}/stories/${storyId}/reset`);
  }
}
