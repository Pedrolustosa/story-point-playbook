
import React from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

export const ProductOwnerControls: React.FC = () => {
  const { gameState, revealVotes, resetVoting } = useGame();

  const isProductOwner = gameState.currentUser?.isProductOwner;
  const votingUsers = gameState.users.filter(u => !u.isProductOwner);
  const votedUsers = votingUsers.filter(u => u.hasVoted);
  const allVotingUsersVoted = votingUsers.length > 0 && votingUsers.every(u => u.hasVoted);

  console.log('🎛️🎛️🎛️ ProductOwnerControls render:');
  console.log('🎛️ isProductOwner:', isProductOwner);
  console.log('🎛️ All users:', gameState.users.map(u => ({ 
    id: u.id, 
    name: u.name, 
    isProductOwner: u.isProductOwner, 
    hasVoted: u.hasVoted, 
    vote: u.vote 
  })));
  console.log('🎛️ Voting users (não PO):', votingUsers.map(u => ({ 
    id: u.id, 
    name: u.name, 
    hasVoted: u.hasVoted, 
    vote: u.vote 
  })));
  console.log('🎛️ Users who voted:', votedUsers.map(u => ({ 
    id: u.id, 
    name: u.name, 
    vote: u.vote 
  })));
  console.log('🎛️ allVotingUsersVoted:', allVotingUsersVoted);
  console.log('🎛️ votingInProgress:', gameState.votingInProgress);
  console.log('🎛️ votesRevealed:', gameState.votesRevealed);
  console.log('🎛️ currentStory:', gameState.currentStory?.title || 'none');

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
            disabled={!allVotingUsersVoted || gameState.revealCountdown !== null}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {gameState.revealCountdown !== null 
              ? `Revelando em ${gameState.revealCountdown}...` 
              : allVotingUsersVoted 
                ? 'Revelar Votos' 
                : `Aguardando votos (${votedUsers.length}/${votingUsers.length})`
            }
          </button>
        ) : (
          <button
            onClick={resetVoting}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Nova Votação
          </button>
        )}
        
        {/* Status detalhado dos votos */}
        {gameState.votingInProgress && !gameState.votesRevealed && (
          <div className="text-sm text-gray-600 text-center">
            <p>Participantes que votaram:</p>
            <div className="mt-2 space-y-1">
              {votingUsers.map(user => (
                <div key={user.id} className="flex justify-between">
                  <span>{user.name}</span>
                  <span className={user.hasVoted ? 'text-green-600' : 'text-orange-600'}>
                    {user.hasVoted ? `✓ Votou (${user.vote})` : '⏳ Aguardando'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
