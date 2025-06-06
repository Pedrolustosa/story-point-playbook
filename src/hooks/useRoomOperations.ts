
import { GameState } from '../types/game';
import { useFetchParticipants } from './useFetchParticipants';
import { useCreateRoom } from './useCreateRoom';
import { useJoinRoom } from './useJoinRoom';
import { useLeaveRoom } from './useLeaveRoom';

export const useRoomOperations = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const { fetchParticipants } = useFetchParticipants(gameState, setGameState);
  const { createRoom, isCreatingRoom } = useCreateRoom(gameState, setGameState, fetchParticipants);
  const { joinRoom } = useJoinRoom(gameState, setGameState, fetchParticipants);
  const { leaveRoom } = useLeaveRoom(setGameState);

  return { createRoom, joinRoom, leaveRoom, fetchParticipants, isCreatingRoom };
};
