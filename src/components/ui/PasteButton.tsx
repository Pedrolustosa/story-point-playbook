
import React from "react";
import { KeyRound } from "lucide-react";

interface PasteButtonProps {
  onPaste: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}
export const PasteButton: React.FC<PasteButtonProps> = ({
  onPaste,
  className,
  ...props
}) => {
  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      onPaste(text.replace(/\s/g, "").slice(0, 6));
    } catch {
      // Clipboard não suportado ou permissões negadas.
    }
  }
  return (
    <button
      type="button"
      tabIndex={0}
      className={
        "ml-1 inline-flex items-center rounded-lg bg-gray-100 hover:bg-orange-200 px-2 py-1 text-xs text-gray-600 transition-colors border border-gray-200 shadow-sm " +
        (className ?? "")
      }
      onClick={handlePaste}
      aria-label={props["aria-label"] || "Colar código da sala"}
      title="Colar"
    >
      <KeyRound className="w-4 h-4 mr-1 opacity-70" />
      Colar
    </button>
  );
};
