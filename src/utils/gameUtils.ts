
export const generateRoomCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

export const fibonacciCards = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'];

export const createInitialGameState = () => ({
  roomCode: '',
  roomId: '',
  users: [],
  currentUser: null,
  currentStory: null,
  stories: [],
  votingInProgress: false,
  votesRevealed: false,
  revealCountdown: null,
  fibonacciCards,
});
