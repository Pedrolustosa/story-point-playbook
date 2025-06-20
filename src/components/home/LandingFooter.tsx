
import React from 'react';
import { Users, Mail, Github, Twitter, Linkedin } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-600 to-orange-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Planning Poker</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              A plataforma definitiva para estimativas ágeis. Transforme suas cerimônias de 
              planning poker em experiências colaborativas e precisas.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:scale-110 hover:bg-gray-700 transition-transform duration-200"
                aria-label="Github"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:scale-110 hover:bg-gray-700 transition-transform duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:scale-110 hover:bg-gray-700 transition-transform duration-200"
                aria-label="Linkedin"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links Úteis */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white hover:underline rounded focus-visible:ring-2 focus-visible:ring-orange-400 transition">Recursos</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white hover:underline rounded focus-visible:ring-2 focus-visible:ring-orange-400 transition">Como Funciona</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:underline rounded focus-visible:ring-2 focus-visible:ring-orange-400 transition">Preços</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:underline rounded focus-visible:ring-2 focus-visible:ring-orange-400 transition">Integrações</a></li>
            </ul>
          </div>
          
          {/* Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white hover:underline rounded focus-visible:ring-2 focus-visible:ring-orange-400 transition">Central de Ajuda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:underline rounded focus-visible:ring-2 focus-visible:ring-orange-400 transition">Documentação</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:underline rounded focus-visible:ring-2 focus-visible:ring-orange-400 transition">Status</a></li>
              <li>
                <a href="mailto:suporte@planningpoker.com" className="text-gray-400 hover:text-white hover:underline rounded focus-visible:ring-2 focus-visible:ring-orange-400 transition flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Planning Poker. Desenvolvido para equipes ágeis que valorizam colaboração e precisão.
          </p>
        </div>
      </div>
    </footer>
  );
};
