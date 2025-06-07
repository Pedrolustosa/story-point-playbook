
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Planning Poker</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Recursos</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">Como Funciona</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Depoimentos</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/join-room')}
              variant="outline"
              className="hidden sm:inline-flex"
            >
              Entrar
            </Button>
            <Button
              onClick={() => navigate('/create-room')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Começar
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
