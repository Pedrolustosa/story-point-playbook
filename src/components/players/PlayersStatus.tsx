
import React from 'react';
import { Crown, CheckCircle, Clock, User, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
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

  // Filter unique users by ID to prevent duplicate keys
  const uniqueUsers = gameState.users.filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  );

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 h-[600px] flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold text-gray-900">
              Participantes
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {uniqueUsers.length}
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
        {uniqueUsers.length === 0 && gameState.roomCode && (
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

      <CardContent className="pt-0 flex-1 min-h-0">
        {uniqueUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {gameState.roomCode ? 'Carregando participantes...' : 'Nenhum participante ainda'}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              {gameState.roomCode 
                ? 'Por favor, aguarde enquanto buscamos os participantes da sala.' 
                : 'Compartilhe o código da sala para convidar pessoas para participar da estimativa.'
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              {uniqueUsers.map((user) => {
                console.log(`Renderizando usuário: ID=${user.id}, Name="${user.name}", isPO=${user.isProductOwner}, isMod=${user.isModerator}`);
                
                return (
                  <div
                    key={`user-${user.id}`}
                    className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 ease-out"
                  >
                    {/* Background gradient for PO */}
                    {user.isProductOwner && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 opacity-50" />
                    )}
                    
                    <div className="relative p-4">
                      <div className="flex items-center justify-between">
                        {/* User Info Section */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
                              <AvatarFallback className={`font-bold text-sm ${
                                user.isProductOwner 
                                  ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white' 
                                  : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white'
                              }`}>
                                {(user.name || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Crown overlay for PO */}
                            {user.isProductOwner && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate text-sm">
                                {user.name || 'Nome não disponível'}
                              </h3>
                              {user.id === gameState.currentUser?.id && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 flex-shrink-0">
                                  Você
                                </Badge>
                              )}
                            </div>
                            
                            {/* Role badges */}
                            <div className="flex items-center gap-1.5">
                              {user.isProductOwner && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 rounded-full border border-orange-200">
                                  <Crown className="w-3 h-3 text-orange-600" />
                                  <span className="text-xs font-semibold">PO</span>
                                </div>
                              )}
                              
                              {user.isModerator && !user.isProductOwner && (
                                <div className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                                  <span className="text-xs font-semibold">Mod</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Section */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {gameState.votingInProgress && !user.isProductOwner && (
                            user.hasVoted ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg border border-green-200">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">Votou</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 rounded-lg border border-orange-200">
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                                <span className="text-xs font-semibold">Votando</span>
                              </div>
                            )
                          )}
                          
                          {gameState.votesRevealed && user.vote && (
                            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white px-3 py-2 rounded-xl font-bold text-base shadow-md">
                              {user.vote}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
