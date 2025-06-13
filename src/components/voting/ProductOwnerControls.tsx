
import React from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useVotingStatus } from '../../hooks/useVotingStatus';

export const ProductOwnerControls: React.FC = () => {
  const { gameState, revealVotes, resetVoting } = useGame();
  
  // Usa o hook para buscar status de votação em tempo real
  const { votingStatus, isLoading } = useVotingStatus(
    gameState.roomId,
    gameState.currentStory?.id || null,
    gameState.votingInProgress
  );

  const isProductOwner = gameState.currentUser?.isProductOwner;
  
  // Combina dados locais com dados da API para melhor experiência
  const votingUsers = gameState.users.filter(u => !u.isProductOwner);
  const statusMap = new Map(votingStatus.map(s => [s.userId, s]));
  
  // Mescla status local com status da API
  const usersWithStatus = votingUsers.map(user => {
    const apiStatus = statusMap.get(user.id);
    return {
      ...user,
      hasVoted: apiStatus?.hasVoted ?? user.hasVoted,
      displayName: apiStatus?.displayName ?? user.name
    };
  });
  
  const votedUsers = usersWithStatus.filter(u => u.hasVoted);
  const allVotingUsersVoted = usersWithStatus.length > 0 && usersWithStatus.every(u => u.hasVoted);

  console.log('🎛️🎛️🎛️ ProductOwnerControls render:');
  console.log('🎛️ isProductOwner:', isProductOwner);
  console.log('🎛️ API voting status:', votingStatus);
  console.log('🎛️ Users with merged status:', usersWithStatus.map(u => ({ 
    id: u.id, 
    name: u.name, 
    hasVoted: u.hasVoted
  })));
  console.log('🎛️ allVotingUsersVoted:', allVotingUsersVoted);
  console.log('🎛️ votingInProgress:', gameState.votingInProgress);
  console.log('🎛️ votesRevealed:', gameState.votesRevealed);

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
                : `Aguardando votos (${votedUsers.length}/${usersWithStatus.length})`
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
        
        {/* Status detalhado dos votos com dados em tempo real */}
        {gameState.votingInProgress && !gameState.votesRevealed && usersWithStatus.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            <div className="flex items-center justify-between mb-2">
              <span>Participantes que votaram:</span>
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {usersWithStatus.map(user => (
                <div key={user.id} className="flex justify-between">
                  <span>{user.displayName || user.name}</span>
                  <span className={user.hasVoted ? 'text-green-600' : 'text-orange-600'}>
                    {user.hasVoted ? '✓ Votou' : '⏳ Aguardando'}
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
