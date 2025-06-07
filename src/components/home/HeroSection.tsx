
import React from 'react';
import { Users, Plus, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  return (
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
  );
};
