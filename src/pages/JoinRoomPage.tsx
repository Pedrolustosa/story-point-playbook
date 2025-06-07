
import React from 'react';
import { GameProvider } from '../contexts/GameContext';
import { JoinRoom } from '../components/room/JoinRoom';

const JoinRoomPage: React.FC = () => {
  return (
    <GameProvider>
      <JoinRoom />
    </GameProvider>
  );
};

export default JoinRoomPage;
