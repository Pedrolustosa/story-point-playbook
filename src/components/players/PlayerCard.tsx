
import React from 'react';
import { Crown, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { User } from '../../types/game';

interface PlayerCardProps {
  user: User;
  isCurrentUser: boolean;
  gameState: {
    votingInProgress: boolean;
    votesRevealed: boolean;
  };
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ user, isCurrentUser, gameState }) => {
  console.log(`Renderizando usuário: ID=${user.id}, Name="${user.name}", isPO=${user.isProductOwner}, isMod=${user.isModerator}`);
  
  return (
    <div className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 ease-out">
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
                {isCurrentUser && (
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
};
