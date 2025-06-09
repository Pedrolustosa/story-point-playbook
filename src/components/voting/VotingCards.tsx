
import React, { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

export const VotingCards: React.FC = () => {
  const { gameState, castVote } = useGame();
  
  const currentUserVote = gameState.currentUser?.vote;
  const canVote = gameState.votingInProgress && 
                  gameState.currentStory && 
                  !gameState.votesRevealed && 
                  !gameState.currentUser?.isProductOwner;

  // Log para debug das condições de votação
  useEffect(() => {
    console.log('🃏 VotingCards: State update:');
    console.log('🃏 VotingCards: currentStory:', gameState.currentStory?.title || 'none');
    console.log('🃏 VotingCards: votingInProgress:', gameState.votingInProgress);
    console.log('🃏 VotingCards: votesRevealed:', gameState.votesRevealed);
    console.log('🃏 VotingCards: currentUser.isProductOwner:', gameState.currentUser?.isProductOwner);
    console.log('🃏 VotingCards: canVote:', canVote);
  }, [gameState.currentStory, gameState.votingInProgress, gameState.votesRevealed, gameState.currentUser?.isProductOwner, canVote]);

  if (!gameState.currentStory) {
    console.log('🃏 VotingCards: Rendering wait state - no current story');
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🃏</span>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-500">Aguardando história</h3>
        <p className="text-gray-400 mt-2">O Product Owner precisa selecionar uma história para começar a votação</p>
      </div>
    );
  }

  if (gameState.currentUser?.isProductOwner) {
    console.log('🃏 VotingCards: Rendering PO view');
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-blue-400 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">👑</span>
          </div>
        </div>
        <h3 className="text-lg font-medium text-blue-600">Product Owner</h3>
        <p className="text-gray-600 mt-2">Como PO, você não participa da votação, mas pode revelar os votos quando todos terminarem</p>
      </div>
    );
  }

  if (!canVote && !gameState.votesRevealed) {
    console.log('🃏 VotingCards: Rendering voting closed state');
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-500">Votação encerrada</h3>
        <p className="text-gray-400 mt-2">Aguardando o Product Owner revelar os votos</p>
      </div>
    );
  }

  console.log('🃏 VotingCards: Rendering voting cards');
  console.log('🃏 VotingCards: Available cards:', gameState.fibonacciCards);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecione sua carta</h3>
      
      <div className="grid grid-cols-4 gap-3">
        {gameState.fibonacciCards.map((card) => {
          const isSelected = currentUserVote === card;
          const isNumber = typeof card === 'number';
          
          return (
            <button
              key={card}
              onClick={() => canVote && castVote(card)}
              disabled={!canVote}
              className={`
                aspect-[3/4] rounded-xl border-2 font-bold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                }
                ${!canVote ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none' : 'cursor-pointer'}
                ${isNumber ? 'text-2xl' : 'text-xl'}
              `}
            >
              {card}
            </button>
          );
        })}
      </div>
      
      {currentUserVote && canVote && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            Voto selecionado: <span className="text-lg">{currentUserVote}</span>
          </p>
        </div>
      )}
    </div>
  );
};
