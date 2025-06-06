
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { RoomDto, UserDto } from '../services/api/types';
import { Player, GameState } from '../types/game';

export const useFetchParticipants = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const fetchParticipants = useCallback(async (roomId: string) => {
    try {
      console.log('Fetching participants for room:', roomId);
      const response = await ApiService.rooms.getParticipants(roomId);
      const users: UserDto[] = 'data' in response ? response.data : response;
      
      console.log('Fetched participants from API:', users);
      
      // Only try to get room details if we have a roomCode
      let room: RoomDto | null = null;
      if (gameState.roomCode) {
        console.log('Fetching room details using roomCode:', gameState.roomCode);
        const roomResponse = await ApiService.rooms.getRoom(gameState.roomCode);
        room = 'data' in roomResponse ? roomResponse.data : roomResponse;
        console.log('Room details:', room);
      } else {
        console.warn('No roomCode available, skipping room details fetch');
      }
      
      const players: Player[] = users.map(user => ({
        id: user.id,
        name: user.displayName,
        // The user who created the room is the moderator (only if we have room details)
        isModerator: room ? room.createdBy?.id === user.id : false,
        isProductOwner: user.role === 'ProductOwner',
        hasVoted: false,
        // Preserve vote if votes are revealed
        vote: gameState.votesRevealed ? 
          gameState.players.find(p => p.id === user.id)?.vote : 
          undefined
      }));
      
      console.log('Processed players with moderator status:', players);
      
      setGameState(prev => {
        // Update current player if they're in the participants list
        const updatedCurrentPlayer = prev.currentPlayer ? 
          players.find(p => p.id === prev.currentPlayer!.id) || prev.currentPlayer :
          prev.currentPlayer;
          
        return {
          ...prev,
          players,
          currentPlayer: updatedCurrentPlayer
        };
      });
      
      return players;
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }, [setGameState, gameState.roomCode, gameState.votesRevealed, gameState.players]);

  return { fetchParticipants };
};
