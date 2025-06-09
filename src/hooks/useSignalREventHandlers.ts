
import { useCallback } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { GameState } from '../types/game';
import { useSignalRParticipantEvents } from './useSignalRParticipantEvents';
import { useSignalRStoryEvents } from './useSignalRStoryEvents';

export const useSignalREventHandlers = (
  gameState: GameState,
  fetchParticipants: (roomId: string) => Promise<any[]>,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const participantEvents = useSignalRParticipantEvents(fetchParticipants);
  const storyEvents = useSignalRStoryEvents(setGameState);

  const setupAllEventHandlers = useCallback((connection: HubConnection) => {
    if (gameState.roomId) {
      participantEvents.setupParticipantEvents(connection, gameState.roomId);
    }
    storyEvents.setupStoryEvents(connection);
  }, [gameState.roomId, participantEvents, storyEvents]);

  return {
    setupAllEventHandlers,
    clearParticipantTimeouts: participantEvents.clearParticipantTimeouts,
    scheduleParticipantsRefresh: participantEvents.scheduleParticipantsRefresh
  };
};
