
import React, { useState } from 'react';
import { Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

export const JoinRoom: React.FC = () => {
  const { joinRoom, gameState } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  console.log('JoinRoom component - gameState atual:', gameState);

  const handleJoinRoom = async () => {
    if (playerName.trim() && roomCode.trim()) {
      console.log('=== INICIANDO PROCESSO DE ENTRAR NA SALA ===');
      console.log('Dados do formulário:', { roomCode: roomCode.trim(), playerName: playerName.trim() });
      
      setIsJoining(true);
      try {
        await joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
        console.log('joinRoom concluído com sucesso');
      } catch (error) {
        console.error('Erro no handleJoinRoom:', error);
      } finally {
        setIsJoining(false);
      }
    } else {
      console.log('Dados insuficientes para entrar na sala:', { playerName, roomCode });
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-orange-600 rounded-2xl mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Entrar em Sala</h1>
            <p className="text-gray-600">Junte-se a uma sessão existente</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-gray-900">
                Informações da Sessão
              </CardTitle>
              <CardDescription className="text-gray-600">
                Insira o código da sala e seu nome para participar
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código da sala
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 uppercase text-center text-lg font-mono"
                  maxLength={6}
                  disabled={isJoining}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  maxLength={30}
                  disabled={isJoining}
                />
              </div>

              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <div>GameState: roomCode={gameState.roomCode}, currentUser={gameState.currentUser?.name}</div>
                  <div>Form: roomCode={roomCode}, playerName={playerName}</div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  disabled={isJoining}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim() || isJoining}
                  className="flex-1 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {isJoining ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
