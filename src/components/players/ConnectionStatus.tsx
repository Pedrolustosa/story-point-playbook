
import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isSignalRConnected: boolean;
  connectionError?: string;
  gameState: {
    roomCode: string;
    users: any[];
  };
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isSignalRConnected,
  connectionError,
  gameState
}) => {
  return (
    <>
      {/* Connection Error Warning */}
      {connectionError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-800">
              Erro de conexão: {connectionError}
            </span>
          </div>
        </div>
      )}

      {/* Real-time status info */}
      {isSignalRConnected && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-800">
              Lista de participantes atualizada automaticamente em tempo real
            </span>
          </div>
        </div>
      )}

      {/* Debug info */}
      {gameState.users.length === 0 && gameState.roomCode && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <span className="text-sm text-yellow-800">
              Sala ativa ({gameState.roomCode}) mas nenhum participante carregado. Verificando...
            </span>
          </div>
        </div>
      )}
    </>
  );
};
