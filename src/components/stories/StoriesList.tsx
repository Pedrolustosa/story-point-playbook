
import React from 'react';
import { useGame } from '../../contexts/GameContext';

interface StoriesListProps {
  onAddStory: () => void;
}

export const StoriesList: React.FC<StoriesListProps> = ({ onAddStory }) => {
  const { gameState, setCurrentStory } = useGame();
  const isProductOwner = gameState.currentPlayer?.isProductOwner;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórias</h3>
      
      {gameState.stories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma história adicionada ainda.</p>
          {isProductOwner && (
            <button
              onClick={onAddStory}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Adicionar primeira história
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {gameState.stories.map((story) => (
            <div
              key={story.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                gameState.currentStory?.id === story.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => isProductOwner && setCurrentStory(story.id)}
            >
              <h4 className="font-medium text-gray-900">{story.title}</h4>
              {story.description && (
                <p className="text-sm text-gray-600 mt-1">{story.description}</p>
              )}
              {story.estimate && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Estimativa: {story.estimate}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
