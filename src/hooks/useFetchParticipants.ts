
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
      
      const players: Player[] = users.map(user => ({
        id: user.id,
        name: user.displayName,
        // For now, we'll determine moderator status based on existing game state
        isModerator: gameState.players.find(p => p.id === user.id)?.isModerator || false,
        isProductOwner: user.role === 'ProductOwner',
        hasVoted: false,
        // Preserve vote if votes are revealed
        vote: gameState.votesRevealed ? 
          gameState.players.find(p => p.id === user.id)?.vote : 
          undefined
      }));
      
      console.log('Processed players:', players);
      
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
  }, [setGameState, gameState.votesRevealed, gameState.players]);

  return { fetchParticipants };
};
