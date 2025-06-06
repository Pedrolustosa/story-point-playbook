
import { httpClient } from './httpClient';
import { SubmitVoteCommand } from './types';

export class VotingService {
  static async submitVote(storyId: string, command: Omit<SubmitVoteCommand, 'storyId'>) {
    const cmd: SubmitVoteCommand = { ...command, storyId };
    return httpClient.post(`/stories/${storyId}/votes`, cmd);
  }

  static async revealVotes(storyId: string) {
    return httpClient.post(`/stories/${storyId}/reveal`);
  }
}
