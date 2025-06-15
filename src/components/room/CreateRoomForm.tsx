
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';

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
    <form className="space-y-6 p-2 md:p-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="player-name" className="block text-base md:text-sm font-semibold text-gray-700 mb-1">
          Seu nome
        </label>
        <Input
          id="player-name"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Digite seu nome"
          maxLength={30}
          disabled={isCreatingRoom}
          autoComplete="off"
          spellCheck={false}
          className="mb-1"
        />
        <div className="text-xs text-muted-foreground mt-1">Este nome aparecerá para outros participantes.</div>
      </div>
      <div className="flex gap-2 pt-1 items-center">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
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
          tabIndex={0}
          type="submit"
          size="lg"
          className="flex-1"
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
