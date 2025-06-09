
import React from 'react';
import { User } from 'lucide-react';

interface EmptyPlayersStateProps {
  gameState: {
    roomCode: string;
  };
}

export const EmptyPlayersState: React.FC<EmptyPlayersStateProps> = ({ gameState }) => {
  return (
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
  );
};
