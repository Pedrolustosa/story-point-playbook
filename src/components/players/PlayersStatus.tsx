import React from 'react';
import { Crown, CheckCircle, Clock, User, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

export const PlayersStatus: React.FC = () => {
  const { gameState, fetchParticipants, isSignalRConnected } = useGame();

  const handleRefreshParticipants = async () => {
    if (gameState.roomId) {
      console.log('Manual refresh: Fetching participants for room:', gameState.roomId);
      await fetchParticipants(gameState.roomId);
    }
  };

  // Get connection error from SignalR hook if available
  const signalRHook = useGame();
  const connectionError = (signalRHook as any).connectionError;

  // Add debug logging for user names
  console.log('PlayersStatus - Current users:', gameState.users.map(u => ({ id: u.id, name: u.name })));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Participantes ({gameState.users.length})</h3>
          {isSignalRConnected ? (
            <div className="flex items-center gap-1 text-green-600" title="Atualizações automáticas ativas">
              <Wifi className="w-4 h-4" />
              <span className="text-xs">Auto</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-500" title="Atualizações automáticas desconectadas">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs">Manual</span>
            </div>
          )}
        </div>
        {gameState.roomId && (
          <button
            onClick={handleRefreshParticipants}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Atualizar lista de participantes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Connection Error Warning */}
      {connectionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">
              Erro de conexão: {connectionError}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {gameState.users.map((user) => {
          console.log(`Rendering user: ID=${user.id}, Name="${user.name}"`);
          
          return (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {user.isModerator ? (
                  <div className="flex items-center gap-1">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                      Product Owner
                    </span>
                  </div>
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-medium text-gray-900">
                  {user.name || 'Nome não disponível'}
                </span>
                {user.id === gameState.currentUser?.id && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Você
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {gameState.votingInProgress && !user.isModerator && (
                  user.hasVoted ? (
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
                
                {gameState.votingInProgress && user.isModerator && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">Product Owner</span>
                  </div>
                )}
                
                {gameState.votesRevealed && user.vote && (
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-bold">
                    {user.vote}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
