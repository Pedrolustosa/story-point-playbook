
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { Player } from '../types/game';

export const useParticipantNotifications = (players: Player[], currentPlayer: Player | null) => {
  const previousPlayersRef = useRef<Player[]>([]);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Skip notifications on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousPlayersRef.current = players;
      return;
    }

    const previousPlayers = previousPlayersRef.current;
    const newPlayers = players.filter(player => 
      !previousPlayers.some(prevPlayer => prevPlayer.id === player.id) &&
      player.id !== currentPlayer?.id // Don't notify for the current player
    );

    // Show toast for each new player
    newPlayers.forEach(player => {
      toast({
        title: "Novo participante!",
        description: `${player.name} entrou na sala`,
        duration: 3000,
      });
    });

    previousPlayersRef.current = players;
  }, [players, currentPlayer]);
};
