
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService, SendMessageDto } from '../services/api/chatService';
import { ChatMessageDto } from '../services/api/types';
import { useGame } from '../contexts/GameContext';

export const useChat = () => {
  const { gameState } = useGame();
  const [isPolling, setIsPolling] = useState(true);
  const queryClient = useQueryClient();

  // Determinar se deve usar a API ou modo local
  const isApiMode = gameState.roomId && gameState.roomId.length > 6;

  // Query para buscar mensagens - só funciona no modo API
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', gameState.roomId],
    queryFn: () => {
      console.log('Fetching messages for roomId:', gameState.roomId);
      return ChatService.getMessages(gameState.roomId);
    },
    enabled: !!gameState.roomId && isApiMode,
    refetchInterval: isPolling && isApiMode ? 2000 : false,
    select: (response) => response.data,
  });

  // Mutation para enviar mensagem - só funciona no modo API
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageDto) => {
      console.log('Sending message to roomId:', gameState.roomId);
      if (!isApiMode) {
        throw new Error('Chat API not available in local mode');
      }
      return ChatService.sendMessage(gameState.roomId, data);
    },
    onSuccess: () => {
      if (isApiMode) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', gameState.roomId] });
      }
    },
    onError: (error) => {
      console.error('Erro ao enviar mensagem:', error);
    },
  });

  const sendMessage = useCallback((message: string) => {
    if (!message.trim() || !gameState.currentUser) return;
    
    if (!isApiMode) {
      console.log('Chat not available in local mode');
      return;
    }
    
    sendMessageMutation.mutate({ message: message.trim() });
  }, [sendMessageMutation, gameState.currentUser, isApiMode]);

  const startPolling = () => setIsPolling(true);
  const stopPolling = () => setIsPolling(false);

  return {
    messages,
    isLoading,
    sendMessage,
    isSending: sendMessageMutation.isPending,
    startPolling,
    stopPolling,
    isApiMode, // Adicionar flag para verificar se o chat está disponível
  };
};
