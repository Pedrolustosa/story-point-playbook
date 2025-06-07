
import React, { useState } from 'react';
import { Users, Plus, ArrowRight, Loader2, Star, Clock, Shield, Zap } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const LandingPage: React.FC = () => {
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

  const features = [
    {
      icon: Star,
      title: "Estimativas Precisas",
      description: "Use a sequência de Fibonacci para estimativas mais precisas e realistas"
    },
    {
      icon: Clock,
      title: "Tempo Real",
      description: "Colabore instantaneamente com sua equipe, onde quer que estejam"
    },
    {
      icon: Shield,
      title: "Votação Anônima",
      description: "Evite vieses com votações anônimas até a revelação final"
    },
    {
      icon: Zap,
      title: "Rápido e Fácil",
      description: "Configure uma sessão em segundos e comece a estimar imediatamente"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Planning Poker
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Colaborativo
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transforme suas sessões de estimativa em experiências colaborativas e precisas. 
            Estime histórias de usuário com sua equipe de forma rápida e eficiente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={() => setMode('create')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Nova Sala
            </Button>
            
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl hover:shadow-md transition-all duration-200"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Entrar em Sala
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Modal */}
        {mode && (
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-0 bg-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Criar Nova Sala' : 'Entrar em Sala'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {mode === 'create' 
                    ? 'Configure sua sessão de planning poker' 
                    : 'Junte-se a uma sessão existente'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {mode === 'join' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código da sala
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 uppercase text-center text-lg font-mono"
                      maxLength={6}
                    />
                  </div>
                )}
                
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

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setMode(null)}
                    variant="outline"
                    className="flex-1"
                    disabled={isCreatingRoom}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
                    disabled={
                      !playerName.trim() || 
                      (mode === 'join' && !roomCode.trim()) ||
                      isCreatingRoom
                    }
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isCreatingRoom ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Criando...
                      </>
                    ) : (
                      mode === 'create' ? 'Criar Sala' : 'Entrar'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">
            Desenvolvido para equipes ágeis que valorizam colaboração e precisão
          </p>
        </div>
      </div>
    </div>
  );
};
