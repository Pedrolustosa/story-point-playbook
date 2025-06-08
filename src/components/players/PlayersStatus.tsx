
import React from 'react';
import { Crown, CheckCircle, Clock, User, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useGame } from '../../contexts/GameContext';

export const PlayersStatus: React.FC = () => {
  const { gameState, isSignalRConnected, connectionError } = useGame();

  // Log detalhado para debug
  console.log('PlayersStatus - gameState completo:', gameState);
  console.log('PlayersStatus - users array:', gameState.users);
  console.log('PlayersStatus - currentUser:', gameState.currentUser);
  console.log('PlayersStatus - Total de usuários:', gameState.users.length);
  
  gameState.users.forEach((user, index) => {
    console.log(`PlayersStatus - Usuário ${index}:`, {
      id: user.id,
      name: user.name,
      isModerator: user.isModerator,
      isProductOwner: user.isProductOwner
    });
  });

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold text-gray-900">
              Participantes
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {gameState.users.length}
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
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {gameState.users.map((user) => {
            console.log(`Renderizando usuário: ID=${user.id}, Name="${user.name}", isPO=${user.isProductOwner}, isMod=${user.isModerator}`);
            
            return (
              <div
                key={user.id}
                className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-200">
                    <AvatarFallback className={`font-semibold text-sm ${
                      user.isProductOwner 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    }`}>
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {user.name || 'Nome não disponível'}
                      </span>
                      {user.id === gameState.currentUser?.id && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Você
                        </Badge>
                      )}
                    </div>
                    
                    {user.isProductOwner && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-semibold text-yellow-700">
                          Product Owner
                        </span>
                      </div>
                    )}
                    
                    {user.isModerator && !user.isProductOwner && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-semibold text-blue-700">
                          Moderador
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {gameState.votingInProgress && !user.isProductOwner && (
                    user.hasVoted ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Votou</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Votando...</span>
                      </div>
                    )
                  )}
                  
                  {gameState.votesRevealed && user.vote && (
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white px-3 py-2 rounded-xl font-bold shadow-sm">
                      {user.vote}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {gameState.users.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                {gameState.roomCode ? 'Carregando participantes...' : 'Nenhum participante ainda'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {gameState.roomCode 
                  ? 'Por favor, aguarde...' 
                  : 'Compartilhe o código da sala para convidar pessoas'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
