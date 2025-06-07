
import React from 'react';
import { GameProvider } from '../contexts/GameContext';
import { CreateRoom } from '../components/room/CreateRoom';

const CreateRoomPage: React.FC = () => {
  return (
    <GameProvider>
      <CreateRoom />
    </GameProvider>
  );
};

export default CreateRoomPage;
