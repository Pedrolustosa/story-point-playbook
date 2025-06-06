
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';
import { Player, GameState } from '../types/game';

export const useJoinRoom = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    try {
      console.log('Joining room:', roomCode, 'as:', playerName);
      
      const response = await ApiService.rooms.joinRoom(roomCode, {
        displayName: playerName,
        role: 'Developer',
      });

      console.log('Joined room successfully:', response);

      // Extract the actual user data from the response
      const user: UserDto = 'data' in response ? response.data : response;
      
      console.log('Processed user data:', user);
      
      if (!user || !user.id) {
        throw new Error('Invalid API response: missing user data');
      }

      // Use roomId from the user response instead of making another API call
      const roomId = user.roomId;
      console.log('Using roomId from join response:', roomId);

      // Create the new player without knowing moderator status yet
      const newPlayer: Player = {
        id: user.id,
        name: user.displayName,
        isModerator: false, // Will be updated when fetching participants
        isProductOwner: user.role === 'ProductOwner',
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomId,
        currentPlayer: newPlayer,
      }));

      // Fetch all participants after joining the room to get complete info including moderator status
      console.log('Fetching participants after joining room');
      await fetchParticipants(roomId);
      
    } catch (error) {
      console.error('Error joining room:', error);
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: playerName,
        isModerator: false,
        isProductOwner: false,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomCode,
        players: [...prev.players, newPlayer],
        currentPlayer: newPlayer,
      }));
    }
  }, [setGameState, fetchParticipants]);

  return { joinRoom };
};
