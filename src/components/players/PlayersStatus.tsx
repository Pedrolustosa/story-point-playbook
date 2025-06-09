
import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useGame } from '../../contexts/GameContext';
import { PlayersHeader } from './PlayersHeader';
import { ConnectionStatus } from './ConnectionStatus';
import { EmptyPlayersState } from './EmptyPlayersState';
import { PlayerCard } from './PlayerCard';

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
        <PlayersHeader 
          userCount={uniqueUsers.length}
          isSignalRConnected={isSignalRConnected}
        />

        <ConnectionStatus
          isSignalRConnected={isSignalRConnected}
          connectionError={connectionError}
          gameState={gameState}
        />
      </CardHeader>

      <CardContent className="pt-0 flex-1 min-h-0">
        {uniqueUsers.length === 0 ? (
          <EmptyPlayersState gameState={gameState} />
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              {uniqueUsers.map((user) => (
                <PlayerCard
                  key={`user-${user.id}`}
                  user={user}
                  isCurrentUser={user.id === gameState.currentUser?.id}
                  gameState={gameState}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
