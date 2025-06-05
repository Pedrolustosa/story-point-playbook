
import React from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

export const ProductOwnerControls: React.FC = () => {
  const { gameState, revealVotes, resetVoting } = useGame();

  const isProductOwner = gameState.currentPlayer?.isProductOwner;
  const votingPlayers = gameState.players.filter(p => !p.isProductOwner);
  const allVotingPlayersVoted = votingPlayers.length > 0 && votingPlayers.every(p => p.hasVoted);

  if (!isProductOwner || !gameState.currentStory) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Controles do Product Owner</h3>
      <div className="space-y-3">
        {!gameState.votesRevealed ? (
          <button
            onClick={revealVotes}
            disabled={!allVotingPlayersVoted || gameState.revealCountdown !== null}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {gameState.revealCountdown !== null 
              ? 'Revelando...' 
              : allVotingPlayersVoted 
                ? 'Revelar Votos' 
                : `Aguardando votos (${votingPlayers.filter(p => p.hasVoted).length}/${votingPlayers.length})`
            }
          </button>
        ) : (
          <button
            onClick={resetVoting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Nova Votação
          </button>
        )}
      </div>
    </div>
  );
};
