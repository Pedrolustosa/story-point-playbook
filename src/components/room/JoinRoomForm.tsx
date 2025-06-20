
import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, XCircle } from "lucide-react";
import { useGame } from "../../contexts/GameContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
/* TODO: Refatorar subseções do form em componentes separados para facilitar manutenção */
import { PasteButton } from "../ui/PasteButton";
import { FormHint } from "../ui/FormHint";
import { CardContent } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";

export const JoinRoomForm: React.FC = () => {
  const { joinRoom } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<{ roomCode?: string; playerName?: string; generic?: string }>({});
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (roomCode.trim() === "") {
      codeInputRef.current?.focus();
    } else {
      nameInputRef.current?.focus();
    }
  }, []);

  function handleRoomCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    let code = e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
    setRoomCode(code);
    setError((err) => ({ ...err, roomCode: undefined, generic: undefined }));
  }
  function handlePlayerNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPlayerName(e.target.value);
    setError((err) => ({ ...err, playerName: undefined, generic: undefined }));
  }

  const handleJoinRoom = async () => {
    let valid = true;
    let newError: typeof error = {};
    if (!roomCode.trim() || roomCode.trim().length < 3) {
      newError.roomCode = "Informe um código válido.";
      valid = false;
      codeInputRef.current?.focus();
    }
    if (!playerName.trim()) {
      newError.playerName = "Digite seu nome.";
      valid = false;
      nameInputRef.current?.focus();
    }
    setError(newError);
    if (!valid) return;

    setIsJoining(true);
    try {
      await joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
      toast({
        title: "Bem-vindo!",
        description: "Você entrou na sala com sucesso.",
        duration: 2500,
        className: "bg-green-50 border-green-300 text-green-800",
      });
    } catch (err: any) {
      setError((prev) => ({
        ...prev,
        generic: err?.message || "Falha ao entrar na sala. Verifique o código e tente novamente.",
      }));
      toast({
        title: "Erro",
        description: err?.message || "Falha ao entrar na sala. Verifique o código.",
        duration: 3200,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  function handlePasteCode(value: string) {
    if (value) {
      setRoomCode(value.toUpperCase());
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }

  const handleBack = () => {
    navigate("/");
  };

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleJoinRoom();
  }

  return (
    <CardContent className="space-y-6 p-2 md:p-6">
      <div className="flex flex-col gap-3">
        {/* Campo do código da sala */}
        <div>
          <label htmlFor="room-code" className="block text-base md:text-sm font-semibold text-gray-700 mb-1">
            Código da sala <span className="text-xs text-gray-400 align-top">(6 dígitos)</span>
          </label>
          <div className="flex gap-1 items-center">
            <Input
              id="room-code"
              ref={codeInputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              placeholder="Ex: ABC123"
              value={roomCode}
              onChange={handleRoomCodeChange}
              maxLength={6}
              className={"uppercase text-center tracking-widest border font-mono text-lg px-4 py-3 rounded-lg transition-all duration-200 w-full shadow-sm bg-amber-50/60 hover:bg-amber-50 focus:bg-white focus:border-orange-400 " +
                (error.roomCode
                  ? "border-red-400 ring-2 ring-red-300"
                  : "focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                )
              }
              disabled={isJoining}
              onFocus={(e) => e.target.select()}
              tabIndex={1}
              aria-invalid={!!error.roomCode}
              aria-describedby="roomcode-error"
            />
            <PasteButton onPaste={handlePasteCode} aria-label="Colar código da sala" />
          </div>
          <FormHint>
            O organizador compartilhou o código. Use <b>Ctrl+V</b> ou clique em "Colar".
          </FormHint>
          {error.roomCode && (
            <div id="roomcode-error" className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <XCircle className="w-3 h-3" /> {error.roomCode}
            </div>
          )}
        </div>
        {/* Campo do nome */}
        <div>
          <label htmlFor="player-name" className="block text-base md:text-sm font-semibold text-gray-700 mb-1">
            Seu nome
          </label>
          <Input
            id="player-name"
            ref={nameInputRef}
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="Digite seu nome"
            value={playerName}
            onChange={handlePlayerNameChange}
            maxLength={30}
            className={
              "px-4 py-3 border rounded-lg text-base w-full transition-all duration-200 shadow-sm hover:bg-amber-50/50 focus:bg-white focus:border-orange-400 " +
              (error.playerName
                ? "border-red-400 ring-2 ring-red-300"
                : "focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              )
            }
            disabled={isJoining}
            onKeyDown={handleNameKeyDown}
            tabIndex={2}
            aria-invalid={!!error.playerName}
            aria-describedby="name-error"
          />
          <FormHint>
            Este nome aparecerá para outros participantes.
          </FormHint>
          {error.playerName && (
            <div id="name-error" className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <XCircle className="w-3 h-3" /> {error.playerName}
            </div>
          )}
        </div>
        {error.generic && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-2 mt-2 animate-fade-in">
            <XCircle className="w-4 h-4" />
            <span>{error.generic}</span>
          </div>
        )}
      </div>
      {/* Ações */}
      <div className="flex gap-2 pt-1 items-center">
        <Button
          onClick={handleBack}
          variant="outline"
          size="lg"
          className="flex-1 animate-fade-in"
          disabled={isJoining}
          tabIndex={3}
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={handleJoinRoom}
          disabled={
            !playerName.trim() ||
            !roomCode.trim() ||
            isJoining ||
            (!!error.roomCode || !!error.playerName)
          }
          size="lg"
          className="flex-1"
          tabIndex={4}
          type="button"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          {isJoining ? (
            <span className="inline-flex gap-1 items-center animate-pulse">
              Entrando...
              <span className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin ml-1" />
            </span>
          ) : (
            "Entrar"
          )}
        </Button>
      </div>
    </CardContent>
  );
};

/* 
AVISO: Este componente tem mais de 200 linhas! 
Sugestão: Quebre este formulário em subcomponentes como <RoomCodeInput />, <PlayerNameInput /> e <FormError /> para facilitar manutenção/melhoria futura.
*/
