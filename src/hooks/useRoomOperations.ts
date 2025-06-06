import { useCallback, useState } from 'react';
import { ApiService } from '../services/api';
import { VotingScale, RoomDto, UserDto } from '../services/api/types';
import { Player, GameState } from '../types/game';
import { generateRoomCode } from '../utils/gameUtils';

export const useRoomOperations = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const fetchParticipants = useCallback(async (roomId: string) => {
    try {
      console.log('Fetching participants for room:', roomId);
      const response = await ApiService.rooms.getParticipants(roomId);
      const users: UserDto[] = 'data' in response ? response.data : response;
      
      console.log('Fetched participants from API:', users);
      
      // Get room details to determine who is the moderator
      const roomResponse = await ApiService.rooms.getRoom(gameState.roomCode || roomId);
      const room: RoomDto = 'data' in roomResponse ? roomResponse.data : roomResponse;
      
      console.log('Room details:', room);
      
      const players: Player[] = users.map(user => ({
        id: user.id,
        name: user.displayName,
        // The user who created the room is the moderator
        isModerator: room.createdBy?.id === user.id,
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

      // Buscar informações da sala para obter o roomId
      const roomResponse = await ApiService.rooms.getRoom(roomCode);
      const room: RoomDto = 'data' in roomResponse ? roomResponse.data : roomResponse;

      console.log('Room info after joining:', room);

      const newPlayer: Player = {
        id: user.id,
        name: user.displayName,
        // Determine if this user is the moderator based on room creator
        isModerator: room.createdBy?.id === user.id,
        isProductOwner: user.role === 'ProductOwner',
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: room.id,
        currentPlayer: newPlayer,
      }));

      // Fetch all participants after joining the room
      console.log('Fetching participants after joining room');
      await fetchParticipants(room.id);
      
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

  const leaveRoom = useCallback(() => {
    setGameState(prev => ({
      roomCode: '',
      roomId: '',
      players: [],
      currentPlayer: null,
      currentStory: null,
      stories: [],
      votingInProgress: false,
      votesRevealed: false,
      revealCountdown: null,
      fibonacciCards: prev.fibonacciCards,
    }));
  }, [setGameState]);

  return { createRoom, joinRoom, leaveRoom, fetchParticipants, isCreatingRoom };
};
