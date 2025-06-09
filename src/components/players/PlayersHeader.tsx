
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface PlayersHeaderProps {
  userCount: number;
  isSignalRConnected: boolean;
}

export const PlayersHeader: React.FC<PlayersHeaderProps> = ({
  userCount,
  isSignalRConnected
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CardTitle className="text-xl font-bold text-gray-900">
          Participantes
        </CardTitle>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          {userCount}
        </Badge>
        {isSignalRConnected ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-full" title="Atualizações automáticas ativas">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Tempo Real</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-600 rounded-full" title="Atualizações automáticas desconectadas">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Offline</span>
          </div>
        )}
      </div>
    </div>
  );
};
