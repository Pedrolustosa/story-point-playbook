
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService, SendMessageRequest } from '../services/api/chatService';
import { ChatMessageDto } from '../services/api/types';
import { useGame } from '../contexts/GameContext';
import { useErrorHandler } from './useErrorHandler';

export const useChat = () => {
  const { gameState } = useGame();
  const [isPolling, setIsPolling] = useState(true);
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  // Determinar se deve usar a API ou modo local
  const isApiMode = gameState.roomId && gameState.roomId.length > 6;

  // Query para buscar mensagens - só funciona no modo API
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', gameState.roomId],
    queryFn: async () => {
      try {
        console.log('Fetching messages for roomId:', gameState.roomId);
        return ChatService.getMessages(gameState.roomId);
      } catch (error) {
        handleError(error, 'Erro ao carregar mensagens');
        throw error;
      }
    },
    enabled: !!gameState.roomId && isApiMode,
    refetchInterval: isPolling && isApiMode ? 2000 : false,
    select: (response) => response.data,
    retry: (failureCount, error) => {
      // Don't retry on certain errors
      if ((error as any)?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Mutation para enviar mensagem - só funciona no modo API
  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      console.log('Sending message to roomId:', gameState.roomId);
      console.log('Message data being sent:', data);
      
      if (!isApiMode) {
        throw new Error('Chat API not available in local mode');
      }
      
      if (!data.UserName || !data.Message.trim()) {
        throw new Error('Nome de usuário e mensagem são obrigatórios');
      }
      
      return ChatService.sendMessage(gameState.roomId, data);
    },
    onSuccess: () => {
      handleSuccess('Mensagem enviada com sucesso!');
      if (isApiMode) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', gameState.roomId] });
      }
    },
    onError: (error) => {
      console.error('Erro ao enviar mensagem:', error);
      handleError(error, 'Erro ao enviar mensagem');
    },
  });

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) {
      handleError('Mensagem não pode estar vazia', 'Validação');
      return;
    }
    
    if (!gameState.currentUser) {
      handleError('Usuário não identificado', 'Validação');
      return;
    }
    
    if (!isApiMode) {
      handleError('Chat não disponível no modo local', 'Funcionalidade não disponível');
      return;
    }
    
    console.log('Current user:', gameState.currentUser);
    console.log('User name:', gameState.currentUser.name);
    
    const messageData: SendMessageRequest = {
      UserName: gameState.currentUser.name,
      Message: message.trim()
    };
    
    console.log('Prepared message data:', messageData);
    sendMessageMutation.mutate(messageData);
  }, [sendMessageMutation, gameState.currentUser, isApiMode, handleError]);

  const startPolling = () => setIsPolling(true);
  const stopPolling = () => setIsPolling(false);

  return {
    messages,
    isLoading,
    sendMessage,
    isSending: sendMessageMutation.isPending,
    startPolling,
    stopPolling,
    isApiMode,
  };
};
