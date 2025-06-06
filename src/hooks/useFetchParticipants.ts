
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { UserDto } from '../services/api/types';
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
      
      // Get current players to preserve voting state and moderator status
      const currentPlayers = gameState.players;
      
      const players: Player[] = users.map(user => {
        // Find existing player to preserve their state
        const existingPlayer = currentPlayers.find(p => p.id === user.id);
        
        return {
          id: user.id,
          name: user.displayName,
          isModerator: existingPlayer?.isModerator || false,
          isProductOwner: user.role === 'ProductOwner',
          hasVoted: gameState.votesRevealed ? false : (existingPlayer?.hasVoted || false),
          vote: gameState.votesRevealed ? undefined : existingPlayer?.vote
        };
      });
      
      console.log('Processed players:', players);
      
      setGameState(prev => {
        // Update current player if they're in the participants list
        const updatedCurrentPlayer = prev.currentPlayer ? 
          players.find(p => p.id === prev.currentPlayer!.id) || prev.currentPlayer :
          prev.currentPlayer;
          
        console.log('Updating game state with new players list');
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
  }, [setGameState]);

  return { fetchParticipants };
};
