
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '../services/api/chatService';
import { ChatMessageDto, SendMessageRequest } from '../services/api/types';
import { useGame } from '../contexts/GameContext';
import { useErrorHandler } from './useErrorHandler';

export const useChat = () => {
  const { gameState } = useGame();
  const [isPolling, setIsPolling] = useState(true);
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  const isApiMode = gameState.roomId && gameState.roomId.length > 6;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', gameState.roomId],
    queryFn: async () => {
      try {
        const response = await ChatService.getMessages(gameState.roomId);
        return 'data' in response ? response.data : response;
      } catch (error) {
        // Não mostra toast para erros de busca de mensagens (polling silencioso)
        throw error;
      }
    },
    enabled: !!gameState.roomId && isApiMode,
    refetchInterval: isPolling && isApiMode ? 2000 : false,
    retry: (failureCount, error) => {
      if ((error as any)?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      if (!isApiMode) {
        throw new Error('Chat API not available in local mode');
      }
      
      if (!data.UserName || !data.Message.trim()) {
        throw new Error('Nome de usuário e mensagem são obrigatórios');
      }
      
      return ChatService.sendMessage(gameState.roomId, data);
    },
    onSuccess: () => {
      // Remove toast de sucesso - atualização silenciosa
      if (isApiMode) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', gameState.roomId] });
      }
    },
    onError: (error) => {
      // Mostra toast apenas para erros de envio de mensagem
      handleError(error);
    },
  });

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) {
      handleError('Mensagem não pode estar vazia');
      return;
    }
    
    if (!gameState.currentUser) {
      handleError('Usuário não identificado');
      return;
    }
    
    if (!isApiMode) {
      handleError('Chat não disponível no modo local');
      return;
    }
    
    const messageData: SendMessageRequest = {
      UserName: gameState.currentUser.name,
      Message: message.trim()
    };
    
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
