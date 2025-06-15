
import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

export const CreateRoom: React.FC = () => {
  const { createRoom, isCreatingRoom, gameState } = useGame();
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();

  // Redirecionar para a página principal quando a sala for criada
  useEffect(() => {
    if (gameState.roomCode && gameState.roomId) {
      navigate('/');
    }
  }, [gameState.roomCode, gameState.roomId, navigate]);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      createRoom(playerName.trim());
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-amber-50 flex items-center justify-center animate-fade-in">
      <div className="container max-w-md mx-auto px-2 py-8 flex flex-1 items-center justify-center">
        <Card className="w-full shadow-2xl border-0 bg-white animate-fade-in" tabIndex={-1}>
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-orange-600 rounded-2xl mb-2 mx-auto shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Criar Nova Sala
            </CardTitle>
            <CardDescription className="text-gray-600">
              Configure sua sessão de planning poker
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1">
                Seu nome
              </label>
              <input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
                maxLength={30}
                disabled={isCreatingRoom}
                autoComplete="off"
                spellCheck={false}
              />
              <div className="text-xs text-muted-foreground mt-1">Este nome aparecerá para outros participantes.</div>
            </div>
            <div className="flex gap-2 pt-1 items-center">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                disabled={isCreatingRoom}
                tabIndex={0}
                type="button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleCreateRoom}
                disabled={!playerName.trim() || isCreatingRoom}
                className={
                  "flex-1 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-bold shadow-md transition-all " +
                  (isCreatingRoom ? "opacity-80 cursor-not-allowed" : "")
                }
                tabIndex={0}
                type="button"
              >
                {isCreatingRoom ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Sala
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
