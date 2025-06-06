import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useChat } from '../../hooks/useChat';

export const Chat: React.FC = () => {
  const { gameState } = useGame();
  const { messages, isLoading, sendMessage, isSending, startPolling, stopPolling } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Controlar polling baseado no estado do chat
  useEffect(() => {
    if (isOpen && gameState.roomId) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [isOpen, gameState.roomId, startPolling, stopPolling]);

  const handleSendMessage = () => {
    if (!message.trim() || !gameState.currentPlayer || isSending) return;
    
    sendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Não mostrar o chat se não estiver em uma sala
  if (!gameState.roomId || !gameState.currentPlayer) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Chat da Equipe</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
            <p>Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-sm">Comece a conversa!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.user === gameState.currentPlayer?.name ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.user === gameState.currentPlayer?.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.user !== gameState.currentPlayer?.name && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {msg.user}
                  </p>
                )}
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            maxLength={500}
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
