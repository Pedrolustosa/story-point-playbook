
import React, { useState } from 'react';
import { Copy, Users, Plus, Eye, RotateCcw, ArrowLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { VotingCards } from './VotingCards';
import { PlayersStatus } from './PlayersStatus';
import { StoryPanel } from './StoryPanel';
import { Results } from './Results';
import { Chat } from './Chat';
import { RevealCountdown } from './RevealCountdown';

export const GameRoom: React.FC = () => {
  const { gameState, leaveRoom, addStory, setCurrentStory, revealVotes, resetVoting } = useGame();
  const [showAddStory, setShowAddStory] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(gameState.roomCode);
    } catch (err) {
      console.log('Erro ao copiar código:', err);
    }
  };

  const handleAddStory = () => {
    if (newStoryTitle.trim()) {
      addStory({
        title: newStoryTitle.trim(),
        description: newStoryDescription.trim(),
      });
      setNewStoryTitle('');
      setNewStoryDescription('');
      setShowAddStory(false);
    }
  };

  // Apenas jogadores que não são PO podem votar
  const votingPlayers = gameState.players.filter(p => !p.isProductOwner);
  const allVotingPlayersVoted = votingPlayers.length > 0 && votingPlayers.every(p => p.hasVoted);
  const isProductOwner = gameState.currentPlayer?.isProductOwner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={leaveRoom}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Planning Poker</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Sala:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded font-mono">{gameState.roomCode}</code>
                  <button
                    onClick={copyRoomCode}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{gameState.players.length} participante{gameState.players.length !== 1 ? 's' : ''}</span>
              </div>
              
              {isProductOwner && (
                <button
                  onClick={() => setShowAddStory(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  História
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Story Panel */}
        <StoryPanel />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stories List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórias</h3>
            
            {gameState.stories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma história adicionada ainda.</p>
                {isProductOwner && (
                  <button
                    onClick={() => setShowAddStory(true)}
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

          {/* Middle Column - Voting */}
          <div className="space-y-6">
            <VotingCards />
            
            {/* Product Owner Controls */}
            {isProductOwner && gameState.currentStory && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Controles do Product Owner</h3>
                <div className="space-y-3">
                  {!gameState.votesRevealed ? (
                    <button
                      onClick={revealVotes}
                      disabled={!allVotingPlayersVoted || gameState.revealCountdown !== null}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {gameState.revealCountdown !== null 
                        ? 'Revelando...' 
                        : allVotingPlayersVoted 
                          ? 'Revelar Votos' 
                          : `Aguardando votos (${votingPlayers.filter(p => p.hasVoted).length}/${votingPlayers.length})`
                      }
                    </button>
                  ) : (
                    <button
                      onClick={resetVoting}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Nova Votação
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Players & Results */}
          <div className="space-y-6">
            <PlayersStatus />
            {gameState.votesRevealed && <Results />}
          </div>
        </div>
      </div>

      {/* Add Story Modal */}
      {showAddStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Adicionar História</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Ex: Como usuário, quero..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newStoryDescription}
                  onChange={(e) => setNewStoryDescription(e.target.value)}
                  placeholder="Critérios de aceitação, detalhes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddStory(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStory}
                disabled={!newStoryTitle.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reveal Countdown Modal */}
      <RevealCountdown />

      {/* Chat Component */}
      <Chat />
    </div>
  );
};
