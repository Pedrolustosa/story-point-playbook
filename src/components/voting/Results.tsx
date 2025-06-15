
import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useRevealedVotes } from '../../hooks/useRevealedVotes';

export const Results: React.FC = () => {
  const { gameState } = useGame();

  const { revealedVotes, isLoading } = useRevealedVotes(
    gameState.roomId,
    gameState.currentStory?.id || null,
    gameState.votesRevealed
  );

  const votes = gameState.votesRevealed && revealedVotes.length > 0
    ? revealedVotes.map(v => v.value)
    : gameState.users.filter(u => u.vote !== undefined).map(u => u.vote);

  if (votes.length === 0) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-fade-in mb-4 w-full max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resultados</h3>
        </div>
        <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8 gap-2">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              Carregando votos...
            </span>
          ) : (
            <>
              <span>Nenhum voto registrado ainda.</span>
              <span className="text-sm text-gray-400">Os resultados aparecerão aqui após a votação.</span>
            </>
          )}
        </div>
      </section>
    );
  }

  const voteGroups = votes.reduce((acc, vote) => {
    const key = vote!.toString();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const numericVotes = votes.filter(v => typeof v === 'number' || !isNaN(Number(v))) as (number | string)[];
  const numericValues = numericVotes.map(v => Number(v)).filter(v => !isNaN(v));
  const average = numericValues.length > 0
    ? (numericValues.reduce((sum, vote) => sum + vote, 0) / numericValues.length).toFixed(1)
    : null;

  const mostVoted = Object.keys(voteGroups).length > 0
    ? Object.entries(voteGroups).reduce((a, b) =>
        voteGroups[a[0]] > voteGroups[b[0]] ? a : b
      )
    : ['', 0];

  const hasConsensus = Object.keys(voteGroups).length === 1;

  return (
    <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in mb-4 w-full max-w-xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Resultados</h3>
        {isLoading && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      <div className={`
        p-3 rounded-lg mb-4 transition-all duration-300
        flex items-center gap-2
        ${hasConsensus
          ? 'bg-green-50 border border-green-200'
          : 'bg-orange-50 border border-orange-200'
        }
      `}>
        <TrendingUp className={`w-4 h-4 shrink-0 ${hasConsensus ? 'text-green-600' : 'text-orange-600'}`} />
        <span className={`font-medium ${hasConsensus ? 'text-green-800' : 'text-orange-800'}`}>
          {hasConsensus ? 'Consenso alcançado!' : 'Discussão necessária'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {Object.entries(voteGroups)
          .sort(([a], [b]) => {
            const aNum = Number(a);
            const bNum = Number(b);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            if (!isNaN(aNum)) return -1;
            if (!isNaN(bNum)) return 1;
            return a.localeCompare(b);
          })
          .map(([vote, count], idx) => (
            <div key={vote} className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-800 shadow">
                  {vote}
                </div>
                <span className="text-gray-700">{count} voto{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex-1 w-full max-w-[110px] bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(count / votes.length) * 100}%` }}
                />
              </div>
            </div>
        ))}
      </div>

      {gameState.votesRevealed && revealedVotes.length > 0 && (
        <div className="border-t pt-4 mb-4 animate-fade-in">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Votos por usuário:</h4>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {revealedVotes.map((vote, index) => (
              <div key={index} className="flex justify-between items-center text-sm gap-2">
                <span
                  className="text-gray-600 truncate max-w-[120px]"
                  title={vote.userName}
                >
                  {vote.userName}:
                </span>
                <span className="font-medium">{vote.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4 space-y-2 text-sm grid grid-cols-1 xs:grid-cols-2 gap-y-1 xs:gap-x-8">
        {average && (
          <div className="flex justify-between">
            <span className="text-gray-600">Média:</span>
            <span className="font-medium">{average}</span>
          </div>
        )}
        {mostVoted[0] && (
          <div className="flex justify-between">
            <span className="text-gray-600">Mais votado:</span>
            <span className="font-medium">{mostVoted[0]}</span>
          </div>
        )}
        <div className="flex justify-between xs:col-span-2">
          <span className="text-gray-600">Total de votos:</span>
          <span className="font-medium">{votes.length}</span>
        </div>
      </div>
    </section>
  );
};
