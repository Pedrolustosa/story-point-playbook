

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
      const currentUserId = gameState.currentUser?.id;
      
      const users: User[] = usersData.map(userData => {
        // Find existing user to preserve their state
        const existingUser = currentUsers.find(u => u.id === userData.id);
        
        // Use name from the API response (using name property)
        const userName = (userData as any).name || existingUser?.name || 'Usuário sem nome';
        
        console.log(`Processing user ${userData.id}: API name="${(userData as any).name}", existing name="${existingUser?.name}", final name="${userName}"`);
        
        return {
          id: userData.id,
          name: userName,
          isModerator: userData.role === 'Moderator' || existingUser?.isModerator || false,
          isProductOwner: userData.role === 'ProductOwner',
          hasVoted: gameState.votesRevealed ? false : (existingUser?.hasVoted || false),
          vote: gameState.votesRevealed ? undefined : existingUser?.vote
        };
      });
      
      console.log('Processed users with names:', users.map(u => ({ id: u.id, name: u.name })));
      console.log('Current user ID:', currentUserId);
      
      setGameState(prev => {
        // Find the current user in the updated list
        const updatedCurrentUser = currentUserId ? 
          users.find(u => u.id === currentUserId) || prev.currentUser :
          prev.currentUser;
          
        console.log('Updated current user:', updatedCurrentUser);
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
  }, [setGameState, gameState.users, gameState.currentUser?.id, gameState.votesRevealed]);

  return { fetchParticipants };
};

