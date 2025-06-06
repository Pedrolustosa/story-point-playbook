
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';
import { User, GameState } from '../types/game';

export const useJoinRoom = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const joinRoom = useCallback(async (roomCode: string, userName: string) => {
    try {
      console.log('Joining room:', roomCode, 'as:', userName);
      
      const response = await ApiService.rooms.joinRoom(roomCode, {
        displayName: userName,
        role: 'Developer',
      });

      console.log('Joined room successfully:', response);

      // Extract the actual user data from the response
      const userData: UserDto = 'data' in response ? response.data : response;
      
      console.log('Processed user data:', userData);
      
      if (!userData || !userData.id) {
        throw new Error('Invalid API response: missing user data');
      }

      // Use roomId from the user response instead of making another API call
      const roomId = userData.roomId;
      console.log('Using roomId from join response:', roomId);

      // Create the new user without knowing moderator status yet
      const newUser: User = {
        id: userData.id,
        name: userData.displayName,
        isModerator: false, // Will be updated when fetching participants
        isProductOwner: userData.role === 'ProductOwner',
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomId,
        currentUser: newUser,
      }));

      // Fetch all participants after joining the room to get complete info including moderator status
      console.log('Fetching participants after joining room');
      await fetchParticipants(roomId);
      
    } catch (error) {
      console.error('Error joining room:', error);
      const newUser: User = {
        id: Date.now().toString(),
        name: userName,
        isModerator: false,
        isProductOwner: false,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomCode,
        users: [...prev.users, newUser],
        currentUser: newUser,
      }));
    }
  }, [setGameState, fetchParticipants]);

  return { joinRoom };
};
