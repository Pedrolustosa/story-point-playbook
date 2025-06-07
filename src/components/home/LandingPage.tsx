
import React from 'react';
import { Users, Plus, ArrowRight, Star, Clock, Shield, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    navigate('/join-room');
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
              onClick={handleCreateRoom}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Nova Sala
            </Button>
            
            <Button
              onClick={handleJoinRoom}
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
