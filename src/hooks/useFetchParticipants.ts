
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';
import { User, GameState } from '../types/game';

export const useFetchParticipants = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const fetchParticipants = useCallback(async (roomId: string) => {
    try {
      console.log('Fetching participants for room:', roomId);
      const response = await ApiService.rooms.getParticipants(roomId);
      const usersData: UserDto[] = 'data' in response ? response.data : response;
      
      console.log('Fetched participants from API:', usersData);
      
      // Get current users to preserve voting state and moderator status
      const currentUsers = gameState.users;
      
      const users: User[] = usersData.map(userData => {
        // Find existing user to preserve their state
        const existingUser = currentUsers.find(u => u.id === userData.id);
        
        return {
          id: userData.id,
          name: userData.displayName,
          isModerator: existingUser?.isModerator || false,
          isProductOwner: userData.role === 'ProductOwner',
          hasVoted: gameState.votesRevealed ? false : (existingUser?.hasVoted || false),
          vote: gameState.votesRevealed ? undefined : existingUser?.vote
        };
      });
      
      console.log('Processed users:', users);
      
      setGameState(prev => {
        // Update current user if they're in the participants list
        const updatedCurrentUser = prev.currentUser ? 
          users.find(u => u.id === prev.currentUser!.id) || prev.currentUser :
          prev.currentUser;
          
        console.log('Updating game state with new users list');
        return {
          ...prev,
          users,
          currentUser: updatedCurrentUser
        };
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }, [setGameState]);

  return { fetchParticipants };
};
