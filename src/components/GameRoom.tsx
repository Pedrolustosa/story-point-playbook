
import React, { useState } from 'react';
import { VotingCards } from './VotingCards';
import { PlayersStatus } from './PlayersStatus';
import { StoryPanel } from './StoryPanel';
import { Results } from './Results';
import { Chat } from './Chat';
import { RevealCountdown } from './RevealCountdown';
import { GameHeader } from './GameHeader';
import { StoriesList } from './StoriesList';
import { ProductOwnerControls } from './ProductOwnerControls';
import { AddStoryModal } from './AddStoryModal';

export const GameRoom: React.FC = () => {
  const [showAddStory, setShowAddStory] = useState(false);

  const handleAddStory = () => {
    setShowAddStory(true);
  };

  const handleCloseAddStory = () => {
    setShowAddStory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <GameHeader onAddStory={handleAddStory} />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Story Panel */}
        <StoryPanel />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stories List */}
          <StoriesList onAddStory={handleAddStory} />

          {/* Middle Column - Voting */}
          <div className="space-y-6">
            <VotingCards />
            <ProductOwnerControls />
          </div>

          {/* Right Column - Players & Results */}
          <div className="space-y-6">
            <PlayersStatus />
            <Results />
          </div>
        </div>
      </div>

      {/* Add Story Modal */}
      <AddStoryModal 
        isOpen={showAddStory} 
        onClose={handleCloseAddStory} 
      />

      {/* Reveal Countdown Modal */}
      <RevealCountdown />

      {/* Chat Component */}
      <Chat />
    </div>
  );
};
