
import { useCallback } from 'react';
import { ApiService } from '../services/api';
import { VotingScale, RoomDto, UserDto } from '../services/api/types';
import { ApiResponse } from '../services/api/httpClient';
import { Player, GameState } from '../types/game';
import { generateRoomCode } from '../utils/gameUtils';

export const useRoomOperations = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const createRoom = useCallback(async (playerName: string) => {
    console.log('Creating room for player:', playerName);
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
    
    try {
      const roomData = {
        name: `Sala de ${playerName}`,
        createdBy: playerName,
        scale: VotingScale.Fibonacci,
        timeLimit: 0,
        autoReveal: false,
      };
      
      console.log('Sending room creation request with data:', roomData);
      
      const response: ApiResponse<RoomDto> = await ApiService.rooms.createRoom(roomData);

      console.log('Room created successfully:', response);
      console.log('Response data:', response.data);
      
      // Extract the actual room data from the response
      const room = response.data;
      
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
    } catch (error) {
      console.error('Erro ao criar sala:', error);
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
    }
  }, [setGameState]);

  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    try {
      const response: ApiResponse<UserDto> = await ApiService.rooms.joinRoom({
        roomCode,
        displayName: playerName,
        role: 'Developer',
      });

      console.log('Joined room successfully:', response.data);

      // Extract the actual user data from the response
      const user = response.data;
      
      if (!user || !user.id) {
        throw new Error('Invalid API response: missing user data');
      }

      const newPlayer: Player = {
        id: user.id,
        name: user.displayName,
        isModerator: false,
        isProductOwner: false,
        hasVoted: false,
      };

      setGameState(prev => ({
        ...prev,
        roomCode,
        roomId: user.roomId,
        players: [...prev.players, newPlayer],
        currentPlayer: newPlayer,
      }));
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
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
  }, [setGameState]);

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

  return { createRoom, joinRoom, leaveRoom };
};
