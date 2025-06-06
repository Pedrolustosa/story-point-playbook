
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService, SendMessageDto } from '../services/api/chatService';
import { ChatMessageDto } from '../services/api/types';
import { useGame } from '../contexts/GameContext';

export const useChat = () => {
  const { gameState } = useGame();
  const [isPolling, setIsPolling] = useState(true);
  const queryClient = useQueryClient();

  // Query para buscar mensagens - usando roomId
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', gameState.roomId],
    queryFn: () => ChatService.getMessages(gameState.roomId),
    enabled: !!gameState.roomId,
    refetchInterval: isPolling ? 2000 : false,
    select: (response) => response.data,
  });

  // Mutation para enviar mensagem - usando roomId
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageDto) => ChatService.sendMessage(gameState.roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', gameState.roomId] });
    },
    onError: (error) => {
      console.error('Erro ao enviar mensagem:', error);
    },
  });

  const sendMessage = useCallback((message: string) => {
    if (!message.trim() || !gameState.currentPlayer) return;
    
    sendMessageMutation.mutate({ message: message.trim() });
  }, [sendMessageMutation, gameState.currentPlayer]);

  const startPolling = () => setIsPolling(true);
  const stopPolling = () => setIsPolling(false);

  return {
    messages,
    isLoading,
    sendMessage,
    isSending: sendMessageMutation.isPending,
    startPolling,
    stopPolling,
  };
};
