"use client";

import { useState, useEffect } from "react";
import type { CardData } from "@/app/board/[id]/page";

interface DescModalProps {
  card: CardData;
  onClose: () => void;
  onSave: (cardId: string, desc: string) => void;
}

export function DescModal({ card, onClose, onSave }: DescModalProps) {
  const [desc, setDesc] = useState(card.desc || "");

  useEffect(() => {
    setDesc(card.desc || "");
  }, [card]);

  const handleSave = () => {
    onSave(card.id, desc.trim() || "Sem descrição.");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 modal-overlay modal-overlay-animate"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="desc-modal-title"
    >
      <div className="absolute inset-0 bg-[var(--navy)]/50 backdrop-blur-sm" aria-hidden />
      <div
        className="relative bg-white rounded-[var(--rad)] w-full max-w-[560px] min-w-[360px] min-h-[280px] max-h-[90vh] overflow-auto p-6 shadow-[var(--shadow-drag)] modal-content-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-[26px] h-[26px] rounded-full border-none bg-[var(--g100)] text-[var(--g500)] cursor-pointer text-base flex items-center justify-center z-[5] hover:bg-[var(--g200)] hover:text-[var(--g800)]"
          aria-label="Fechar"
        >
          ×
        </button>
        <div id="desc-modal-title" className="font-display font-extrabold text-base text-[var(--g800)] mb-4 flex items-center gap-2">
          Detalhes da descrição
          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[var(--blue-bg)] text-[var(--blue)] border border-[var(--blue-b)]">
            {card.id}
          </span>
        </div>
        <p className="text-xs font-semibold text-[var(--g600)] uppercase tracking-wide mb-1">{card.title}</p>
        <div className="mb-4">
          <label htmlFor="desc-textarea" className="block text-xs font-semibold text-[var(--g600)] uppercase tracking-wide mb-2">
            Descrição
          </label>
          <textarea
            id="desc-textarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Sem descrição."
            className="w-full min-h-[140px] p-3 border border-[var(--g200)] rounded-[var(--rad-sm)] font-sans text-sm text-[var(--g700)] bg-[var(--g50)] resize-y outline-none focus:border-[var(--teal)] whitespace-pre-wrap"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg font-bold text-sm bg-[var(--teal)] text-[var(--navy)] hover:bg-[var(--lime)] transition-all duration-200"
          >
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
