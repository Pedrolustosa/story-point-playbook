
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav
      className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm supports-backdrop-blur:backdrop-blur-md transition-all duration-300"
      role="navigation"
      aria-label="Barra de navegação principal"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-600 to-orange-600 rounded-xl animate-scale-in">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Planning Poker</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-orange-400 rounded px-1">Recursos</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-orange-400 rounded px-1">Como Funciona</a>
            <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-orange-400 rounded px-1">Depoimentos</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/join-room')}
              variant="outline"
              className="hidden sm:inline-flex animate-fade-in"
            >
              Entrar
            </Button>
            <Button
              onClick={() => navigate('/create-room')}
              className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 animate-scale-in"
            >
              Começar
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
