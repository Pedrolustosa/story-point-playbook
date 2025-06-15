
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';

interface CreateRoomFormProps {
  onBack: () => void;
  onCreateRoom: (playerName: string) => void;
  isCreatingRoom: boolean;
}

export const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onBack, onCreateRoom, isCreatingRoom }) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  return (
    <form className="space-y-6 p-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1">
          Seu nome
        </label>
        <input
          id="player-name"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Digite seu nome"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
          maxLength={30}
          disabled={isCreatingRoom}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="text-xs text-muted-foreground mt-1">Este nome aparecerá para outros participantes.</div>
      </div>
      <div className="flex gap-2 pt-1 items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
          disabled={isCreatingRoom}
          tabIndex={0}
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          disabled={!playerName.trim() || isCreatingRoom}
          className={
            "flex-1 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-bold shadow-md transition-all " +
            (isCreatingRoom ? "opacity-80 cursor-not-allowed" : "")
          }
          tabIndex={0}
          type="submit"
        >
          {isCreatingRoom ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Criar Sala
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
