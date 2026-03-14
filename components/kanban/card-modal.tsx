"use client";

import { useState, useEffect } from "react";
import type { CardData, BucketConfig } from "@/app/board/[id]/page";

interface CardModalProps {
  card: CardData;
  mode: "new" | "edit";
  buckets: BucketConfig[];
  priorities: string[];
  progresses: string[];
  filterLabels: string[];
  onClose: () => void;
  onSave: (card: CardData) => void;
  onDelete?: (cardId: string) => void;
}

export function CardModal({
  card,
  mode,
  buckets,
  priorities,
  progresses,
  filterLabels,
  onClose,
  onSave,
  onDelete,
}: CardModalProps) {
  const [id, setId] = useState(card.id);
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.desc);
  const [bucket, setBucket] = useState(card.bucket);
  const [priority, setPriority] = useState(card.priority);
  const [progress, setProgress] = useState(card.progress);
  const [dueDate, setDueDate] = useState(card.dueDate || "");
  const [tags, setTags] = useState<Set<string>>(new Set(card.tags || []));

  useEffect(() => {
    setId(card.id);
    setTitle(card.title);
    setDesc(card.desc);
    setBucket(card.bucket);
    setPriority(card.priority);
    setProgress(card.progress);
    setDueDate(card.dueDate || "");
    setTags(new Set(card.tags || []));
  }, [card]);

  const toggleTag = (t: string) => {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const handleSave = () => {
    const t = title.trim();
    if (!t) {
      alert("Informe o título.");
      return;
    }
    const finalId = id.trim() || (mode === "new" ? `NEW-${Date.now()}` : card.id);
    onSave({
      ...card,
      id: finalId,
      title: t,
      desc: desc.trim() || "Sem descrição.",
      bucket,
      priority,
      progress,
      dueDate: dueDate || null,
      tags: [...tags],
      order: card.order ?? 0,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[var(--rad)] w-[95%] max-w-[560px] max-h-[90vh] overflow-y-auto p-6 shadow-[var(--shadow-drag)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[var(--g200)] bg-[var(--g100)] text-[var(--g500)] flex items-center justify-center text-sm hover:bg-[var(--g200)] hover:text-[var(--g800)] transition-all duration-200"
        >
          ×
        </button>
        <div className="font-display font-extrabold text-base text-[var(--g800)] mb-4 flex items-center gap-2">
          {mode === "edit" ? "Editar" : "Novo Card"}{" "}
          {mode === "edit" && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[var(--blue-bg)] text-[var(--blue)] border border-[var(--blue-b)]">
              {card.id}
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--g600)] mb-1 uppercase tracking-wide">
              ID
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Ex: DI-700"
              className="w-full px-3 py-2 border border-[var(--g200)] rounded-[var(--rad-sm)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--g600)] mb-1 uppercase tracking-wide">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título executivo"
              className="w-full px-3 py-2 border border-[var(--g200)] rounded-[var(--rad-sm)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--g600)] mb-1 uppercase tracking-wide">
              Descrição
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descrição"
              rows={3}
              className="w-full px-3 py-2 border border-[var(--g200)] rounded-[var(--rad-sm)] text-sm resize-y"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[var(--g600)] mb-1 uppercase tracking-wide">
                Coluna
              </label>
              <select
                value={bucket}
                onChange={(e) => setBucket(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--g200)] rounded-[var(--rad-sm)] text-sm"
              >
                {buckets.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[var(--g600)] mb-1 uppercase tracking-wide">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--g200)] rounded-[var(--rad-sm)] text-sm"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[var(--g600)] mb-1 uppercase tracking-wide">
                Progresso
              </label>
              <select
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--g200)] rounded-[var(--rad-sm)] text-sm"
              >
                {progresses.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[var(--g600)] mb-1 uppercase tracking-wide">
                Data de Conclusão
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--g200)] rounded-[var(--rad-sm)] text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wide">
              Rótulos
            </label>
            <div className="flex flex-wrap gap-2">
              {filterLabels.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`btn-pill transition-all duration-200 ${
                    tags.has(t)
                      ? "bg-[var(--teal)] text-[var(--navy)] border-[var(--teal)] shadow-sm"
                      : "bg-white text-[var(--g600)] border-[var(--g200)] hover:border-[var(--teal)] hover:text-[var(--teal-d)] hover:bg-[rgba(0,201,183,0.04)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-[var(--g100)] flex-wrap">
          {mode === "edit" && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Excluir este card?")) {
                  onDelete(card.id);
                  onClose();
                }
              }}
              className="mr-auto btn-danger"
            >
              Excluir
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
