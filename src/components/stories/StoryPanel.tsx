import React from 'react';
import { FileText } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

export const StoryPanel: React.FC = () => {
  const { gameState } = useGame();

  if (!gameState.currentStory) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="text-gray-400 mb-4">
          <FileText className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-500 mb-2">Nenhuma história selecionada</h2>
        <p className="text-gray-400">
          {gameState.currentUser?.isModerator 
            ? 'Selecione uma história da lista para começar a votação' 
            : 'Aguardando o moderador selecionar uma história'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {gameState.currentStory.title}
          </h2>
          
          {gameState.currentStory.description && (
            <p className="text-gray-600 mb-4">
              {gameState.currentStory.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            {gameState.votingInProgress && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                Votação em andamento
              </span>
            )}
            
            {gameState.votesRevealed && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                Votos revelados
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
