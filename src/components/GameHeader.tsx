
import React from 'react';
import { Copy, Users, Plus, ArrowLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

interface GameHeaderProps {
  onAddStory: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ onAddStory }) => {
  const { gameState, leaveRoom } = useGame();

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(gameState.roomCode);
    } catch (err) {
      console.log('Erro ao copiar código:', err);
    }
  };

  const isProductOwner = gameState.currentPlayer?.isProductOwner;

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={leaveRoom}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">Planning Poker</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Sala:</span>
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">{gameState.roomCode}</code>
                <button
                  onClick={copyRoomCode}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{gameState.players.length} participante{gameState.players.length !== 1 ? 's' : ''}</span>
            </div>
            
            {isProductOwner && (
              <button
                onClick={onAddStory}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                História
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
