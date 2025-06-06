
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService, SendMessageDto } from '../services/api/chatService';
import { ChatMessageDto } from '../services/api/types';
import { useGame } from '../contexts/GameContext';

export const useChat = () => {
  const { gameState } = useGame();
  const [isPolling, setIsPolling] = useState(true);
  const queryClient = useQueryClient();

  // Query para buscar mensagens - usando roomId (que agora é o ID real da API)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', gameState.roomId],
    queryFn: () => {
      console.log('Fetching messages for roomId:', gameState.roomId);
      return ChatService.getMessages(gameState.roomId);
    },
    enabled: !!gameState.roomId && gameState.roomId.length > 6, // Só busca se tiver um ID real (não um código de 6 chars)
    refetchInterval: isPolling ? 2000 : false,
    select: (response) => response.data,
  });

  // Mutation para enviar mensagem - usando roomId
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageDto) => {
      console.log('Sending message to roomId:', gameState.roomId);
      return ChatService.sendMessage(gameState.roomId, data);
    },
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
