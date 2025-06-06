
import { useCallback, useState } from 'react';
import { ApiService } from '../services/api';
import { VotingScale, RoomDto } from '../services/api/types';
import { Player, GameState } from '../types/game';
import { generateRoomCode } from '../utils/gameUtils';

export const useCreateRoom = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const createRoom = useCallback(async (playerName: string) => {
    console.log('Creating room for player:', playerName);
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
    
    setIsCreatingRoom(true);
    
    try {
      const roomData = {
        name: `Sala de ${playerName}`,
        createdBy: playerName,
        scale: VotingScale.Fibonacci,
        timeLimit: 0,
        autoReveal: false,
      };
      
      console.log('Sending room creation request with data:', roomData);
      
      const response = await ApiService.rooms.createRoom(roomData);

      console.log('Room created successfully:', response);
      
      // Extract the actual room data from the response
      const room: RoomDto = 'data' in response ? response.data : response;
      
      console.log('Processed room data:', room);
      
      if (!room || !room.id) {
        console.error('API response is invalid:', room);
        throw new Error('Invalid API response: missing room data');
      }
      
      const newPlayer: Player = {
        id: room.createdBy?.id || playerName,
        name: room.createdBy?.displayName || playerName,
        isModerator: true,
        isProductOwner: true,
        hasVoted: false,
      };

      console.log('Setting game state with room:', room);
      console.log('New player:', newPlayer);

      setGameState(prev => ({
        ...prev,
        roomCode: room.code,
        roomId: room.id,
        players: [newPlayer],
        currentPlayer: newPlayer,
      }));

      // Fetch all participants after creating the room
      console.log('Fetching participants after room creation');
      setTimeout(() => fetchParticipants(room.id), 1000);
      
    } catch (error) {
      console.error('Error creating room:', error);
      console.log('Falling back to local mode due to API error');
      
      const roomCode = generateRoomCode();
      const newPlayer: Player = {
        id: '1',
        name: playerName,
        isModerator: true,
        isProductOwner: true,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: roomCode,
        players: [newPlayer],
        currentPlayer: newPlayer,
      }));
    } finally {
      setIsCreatingRoom(false);
    }
  }, [setGameState, fetchParticipants]);

  return { createRoom, isCreatingRoom };
};
