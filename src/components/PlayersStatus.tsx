
import React from 'react';
import { Crown, CheckCircle, Clock } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

export const PlayersStatus: React.FC = () => {
  const { gameState } = useGame();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Participantes</h3>
      
      <div className="space-y-3">
        {gameState.players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {player.isModerator && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
              <span className="font-medium text-gray-900">{player.name}</span>
              {player.id === gameState.currentPlayer?.id && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Você
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {gameState.votingInProgress && (
                player.hasVoted ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Votou</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Votando...</span>
                  </div>
                )
              )}
              
              {gameState.votesRevealed && player.vote && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-bold">
                  {player.vote}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
