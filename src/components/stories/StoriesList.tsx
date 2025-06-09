
import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { ScrollArea } from '../ui/scroll-area';

interface StoriesListProps {
  onAddStory: () => void;
}

export const StoriesList: React.FC<StoriesListProps> = ({ onAddStory }) => {
  const { gameState, setCurrentStory } = useGame();
  const isProductOwner = gameState.currentUser?.isProductOwner;

  return (
    <div className="bg-white rounded-xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 h-[600px] flex flex-col">
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">Histórias</h3>
            <div className="bg-blue-50 text-blue-700 border-blue-200 px-2 py-1 rounded-md text-sm font-medium">
              {gameState.stories.length}
            </div>
          </div>
          {isProductOwner && (
            <button
              onClick={onAddStory}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nova História
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0 px-6 pb-6">
        {gameState.stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma história ainda</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-4">
              Adicione histórias para começar a estimativa em Planning Poker.
            </p>
            {isProductOwner && (
              <button
                onClick={onAddStory}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar primeira história
              </button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              {gameState.stories.map((story) => (
                <div
                  key={story.id}
                  className={`group relative overflow-hidden bg-white rounded-xl border transition-all duration-200 ease-out ${
                    gameState.currentStory?.id === story.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
                  } ${isProductOwner ? 'cursor-pointer' : ''}`}
                  onClick={() => isProductOwner && setCurrentStory(story.id)}
                >
                  {/* Background gradient for selected story */}
                  {gameState.currentStory?.id === story.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50" />
                  )}
                  
                  <div className="relative p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          gameState.currentStory?.id === story.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 truncate">{story.title}</h4>
                        {story.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{story.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {gameState.currentStory?.id === story.id && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Selecionada
                            </div>
                          )}
                          {story.estimate && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Estimativa: {story.estimate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
