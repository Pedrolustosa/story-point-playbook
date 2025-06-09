
import { useCallback, useRef } from 'react';
import { HubConnection } from '@microsoft/signalr';

export const useSignalRParticipantEvents = (
  fetchParticipants: (roomId: string) => Promise<any[]>
) => {
  const participantsRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Controle de debounce para atualizações de participantes com delay maior
  const scheduleParticipantsRefresh = useCallback((roomId: string, delay: number = 5000) => {
    if (participantsRefreshTimeoutRef.current) {
      clearTimeout(participantsRefreshTimeoutRef.current);
    }

    participantsRefreshTimeoutRef.current = setTimeout(async () => {
      if (roomId) {
        console.log('SignalR: Atualizando participantes (debounced)');
        try {
          await fetchParticipants(roomId);
          console.log('SignalR: Participantes atualizados com sucesso');
        } catch (error) {
          console.error('SignalR: Erro ao atualizar participantes:', error);
        }
      }
    }, delay);
  }, [fetchParticipants]);

  const setupParticipantEvents = useCallback((connection: HubConnection, roomId: string) => {
    connection.on('UserJoined', async (userData: any) => {
      console.log('SignalR: User joined event received:', userData);
      scheduleParticipantsRefresh(roomId, 3000);
    });

    connection.on('UserLeft', async (userId: string) => {
      console.log('SignalR: User left event received:', userId);
      scheduleParticipantsRefresh(roomId, 3000);
    });

    connection.on('ParticipantCountUpdated', async (count: number) => {
      console.log('SignalR: Participant count updated:', count);
      scheduleParticipantsRefresh(roomId, 5000);
    });

    connection.on('ParticipantsUpdated', async (participants: any[]) => {
      console.log('SignalR: Participants list updated directly:', participants.length, 'participantes');
      scheduleParticipantsRefresh(roomId, 2000);
    });
  }, [scheduleParticipantsRefresh]);

  const clearParticipantTimeouts = useCallback(() => {
    if (participantsRefreshTimeoutRef.current) {
      clearTimeout(participantsRefreshTimeoutRef.current);
      participantsRefreshTimeoutRef.current = null;
    }
  }, []);

  return {
    setupParticipantEvents,
    scheduleParticipantsRefresh,
    clearParticipantTimeouts
  };
};
