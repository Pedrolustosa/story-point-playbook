
import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

export const Results: React.FC = () => {
  const { gameState } = useGame();

  const votes = gameState.players
    .filter(p => p.vote !== undefined)
    .map(p => p.vote);

  // Verificar se há votos antes de processar
  if (votes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resultados</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p>Nenhum voto registrado ainda.</p>
          <p className="text-sm">Os resultados aparecerão aqui após a votação.</p>
        </div>
      </div>
    );
  }

  const voteGroups = votes.reduce((acc, vote) => {
    const key = vote!.toString();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const numericVotes = votes.filter(v => typeof v === 'number') as number[];
  const average = numericVotes.length > 0 
    ? (numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length).toFixed(1)
    : null;

  // Verificar se há grupos de votos antes de fazer reduce
  const mostVoted = Object.keys(voteGroups).length > 0 
    ? Object.entries(voteGroups).reduce((a, b) => 
        voteGroups[a[0]] > voteGroups[b[0]] ? a : b
      )
    : ['', 0];

  const hasConsensus = Object.keys(voteGroups).length === 1;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Resultados</h3>
      </div>

      {/* Consensus Indicator */}
      <div className={`p-3 rounded-lg mb-4 ${
        hasConsensus ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
      }`}>
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${hasConsensus ? 'text-green-600' : 'text-orange-600'}`} />
          <span className={`font-medium ${hasConsensus ? 'text-green-800' : 'text-orange-800'}`}>
            {hasConsensus ? 'Consenso alcançado!' : 'Discussão necessária'}
          </span>
        </div>
      </div>

      {/* Vote Distribution */}
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
          .map(([vote, count]) => (
            <div key={vote} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-800">
                  {vote}
                </div>
                <span className="text-gray-700">{count} voto{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(count / votes.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Statistics */}
      <div className="border-t pt-4 space-y-2 text-sm">
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
        <div className="flex justify-between">
          <span className="text-gray-600">Total de votos:</span>
          <span className="font-medium">{votes.length}</span>
        </div>
      </div>
    </div>
  );
};
