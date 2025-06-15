
import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Card, CardContent } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { CreateRoomHeader } from './CreateRoomHeader';
import { CreateRoomForm } from './CreateRoomForm';

export const CreateRoom: React.FC = () => {
  const { createRoom, isCreatingRoom, gameState } = useGame();
  const navigate = useNavigate();

  // Redirecionar para a página principal quando a sala for criada
  React.useEffect(() => {
    if (gameState.roomCode && gameState.roomId) {
      navigate('/');
    }
  }, [gameState.roomCode, gameState.roomId, navigate]);

  const handleCreateRoom = (playerName: string) => {
    createRoom(playerName);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-amber-50 flex items-center justify-center animate-fade-in">
      <div className="container max-w-md mx-auto px-2 py-8 flex flex-1 items-center justify-center">
        <Card className="w-full shadow-2xl border-0 bg-white animate-fade-in" tabIndex={-1}>
          <CreateRoomHeader />
          <CardContent>
            <CreateRoomForm
              onBack={handleBack}
              onCreateRoom={handleCreateRoom}
              isCreatingRoom={isCreatingRoom}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
