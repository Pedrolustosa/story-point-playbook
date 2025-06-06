
import React, { useState } from 'react';
import { Users, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

export const HomePage: React.FC = () => {
  const { createRoom, joinRoom, isCreatingRoom } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      createRoom(playerName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planning Poker</h1>
          <p className="text-gray-600">Estime histórias de forma colaborativa</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {!mode && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Criar Nova Sala
              </button>
              
              <button
                onClick={() => setMode('join')}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-md"
              >
                <ArrowRight className="w-5 h-5" />
                Entrar em Sala
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 text-center">Criar Nova Sala</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu nome
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    maxLength={30}
                    disabled={isCreatingRoom}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode(null)}
                  disabled={isCreatingRoom}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim() || isCreatingRoom}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isCreatingRoom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Sala'
                  )}
                </button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 text-center">Entrar em Sala</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código da sala
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 uppercase"
                    maxLength={6}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    maxLength={30}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Entrar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          Desenvolvido para equipes ágeis
        </div>
      </div>
    </div>
  );
};
