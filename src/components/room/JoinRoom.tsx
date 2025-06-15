import React, { useState, useRef, useEffect } from "react";
import { Users, ArrowRight, ArrowLeft, XCircle } from "lucide-react";
import { useGame } from "../../contexts/GameContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { PasteButton } from "../ui/PasteButton";
import { FormHint } from "../ui/FormHint";

export const JoinRoom: React.FC = () => {
  const { joinRoom, gameState } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<{ roomCode?: string; playerName?: string; generic?: string }>({});
  const navigate = useNavigate();

  // Refs para inputs de melhor UX
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus inicial esperto
  useEffect(() => {
    if (roomCode.trim() === "") {
      codeInputRef.current?.focus();
    } else {
      nameInputRef.current?.focus();
    }
  }, []);

  // Auto-maiúsculo, 6 dígitos, sem espaços
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
    // Validação básica
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
      // o contexto navega, não precisa setar nada aqui
    } catch (err: any) {
      setError((prev) => ({
        ...prev,
        generic: err?.message || "Falha ao entrar na sala. Verifique o código e tente novamente.",
      }));
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

  // Enter no playerName → submit
  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleJoinRoom();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-amber-50 flex items-center justify-center">
      <div className="container max-w-md mx-auto px-2 py-8 flex flex-1 items-center justify-center">
        <Card
          className="w-full shadow-2xl border-0 bg-white animate-fade-in"
          tabIndex={-1}
        >
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-orange-600 rounded-2xl mb-2 mx-auto shadow-lg animate-fade-in">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Entrar em Sala
            </CardTitle>
            <CardDescription className="text-gray-600">
              Junte-se a uma sessão existente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="room-code" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={
                      "uppercase text-center tracking-widest border font-mono text-lg px-4 py-3 rounded-lg transition-all duration-200 w-full " +
                      (error.roomCode ? "border-red-400 ring-2 ring-red-300" : "focus:ring-2 focus:ring-orange-500 focus:border-transparent")
                    }
                    disabled={isJoining}
                    onFocus={(e) => e.target.select()}
                  />
                  <PasteButton onPaste={handlePasteCode} aria-label="Colar código da sala" />
                </div>
                <FormHint>
                  O organizador compartilhou o código. Use <b>Ctrl+V</b> ou clique em "Colar".
                </FormHint>
                {error.roomCode && (
                  <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <XCircle className="w-3 h-3" /> {error.roomCode}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1">
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
                    "px-4 py-3 border rounded-lg text-base w-full transition-all duration-200 " +
                    (error.playerName ? "border-red-400 ring-2 ring-red-300" : "focus:ring-2 focus:ring-orange-500 focus:border-transparent")
                  }
                  disabled={isJoining}
                  onKeyDown={handleNameKeyDown}
                />
                <FormHint>
                  Este nome aparecerá para outros participantes.
                </FormHint>
                {error.playerName && (
                  <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <XCircle className="w-3 h-3" /> {error.playerName}
                  </div>
                )}
              </div>
              {error.generic && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-2 mt-2">
                  <XCircle className="w-4 h-4" />
                  <span>{error.generic}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1 items-center">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                disabled={isJoining}
                tabIndex={0}
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
                className={
                  "flex-1 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-bold shadow-md transition-all " +
                  (isJoining ? "opacity-80 cursor-not-allowed" : "")
                }
                tabIndex={0}
                size="lg"
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
        </Card>
      </div>
    </div>
  );
};
