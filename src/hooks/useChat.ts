
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService, ChatMessage, SendMessageDto } from '../services/api/chatService';
import { useGame } from '../contexts/GameContext';

export const useChat = () => {
  const { gameState } = useGame();
  const [isPolling, setIsPolling] = useState(true);
  const queryClient = useQueryClient();

  // Query para buscar mensagens
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', gameState.roomCode],
    queryFn: () => ChatService.getMessages(gameState.roomCode),
    enabled: !!gameState.roomCode,
    refetchInterval: isPolling ? 2000 : false, // Polling a cada 2 segundos
    select: (response) => response.data,
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageDto) => ChatService.sendMessage(gameState.roomCode, data),
    onSuccess: () => {
      // Invalidar e refazer a query das mensagens
      queryClient.invalidateQueries({ queryKey: ['chat-messages', gameState.roomCode] });
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
