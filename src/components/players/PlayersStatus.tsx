
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Participantes ({gameState.players.length})</h3>
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

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-50 border rounded text-xs">
          <div>Room ID: {gameState.roomId}</div>
          <div>Room Code: {gameState.roomCode}</div>
          <div>SignalR Connected: {isSignalRConnected ? 'Yes' : 'No'}</div>
          <div>API URL: {import.meta.env.VITE_API_BASE_URL}</div>
        </div>
      )}
      
      <div className="space-y-3">
        {gameState.players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {player.isProductOwner ? (
                <div className="flex items-center gap-1">
                  <Crown className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">PO</span>
                </div>
              ) : player.isModerator ? (
                <Crown className="w-4 h-4 text-yellow-500" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
              <span className="font-medium text-gray-900">{player.name}</span>
              {player.id === gameState.currentPlayer?.id && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Você
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {gameState.votingInProgress && !player.isProductOwner && (
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
              
              {gameState.votingInProgress && player.isProductOwner && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Product Owner</span>
                </div>
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
