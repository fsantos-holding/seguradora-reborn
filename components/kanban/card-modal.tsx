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

const inputBase =
  "w-full px-4 py-3 border border-[var(--g200)] rounded-xl text-sm transition-all duration-200 outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[rgba(0,201,183,0.15)] hover:border-[var(--g300)]";

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
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 card-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-[var(--navy)]/40 backdrop-blur-md"
        aria-hidden
      />
      <div
        className="relative bg-white rounded-2xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(10,31,63,0.2)] border border-[var(--g200)]/60 scrollbar-kanban card-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de destaque superior */}
        <div
          className="h-1 rounded-t-2xl"
          style={{
            background: "linear-gradient(90deg, var(--teal), var(--teal-d))",
          }}
        />

        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-extrabold text-xl text-[var(--g800)] flex items-center gap-3">
                {mode === "edit" ? "Editar Card" : "Novo Card"}
                {mode === "edit" && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--blue-bg)] text-[var(--blue)] border border-[var(--blue-b)]">
                    {card.id}
                  </span>
                )}
              </h2>
              <p className="text-sm text-[var(--g500)] mt-1">
                {mode === "edit"
                  ? "Atualize as informações do card"
                  : "Preencha os dados para criar um novo card"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl border border-[var(--g200)] bg-[var(--g50)] text-[var(--g500)] flex items-center justify-center text-lg hover:bg-[var(--g200)] hover:text-[var(--g800)] transition-all duration-200 shrink-0"
            >
              ×
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wider">
                  ID
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Ex: DI-700"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wider">
                  Coluna
                </label>
                <select
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  className={inputBase}
                >
                  {buckets.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wider">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título executivo do card"
                className={`${inputBase} text-base font-medium`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wider">
                Descrição
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Descreva os detalhes do card..."
                rows={4}
                className={`${inputBase} resize-y min-h-[100px]`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wider">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={inputBase}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wider">
                  Progresso
                </label>
                <select
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className={inputBase}
                >
                  {progresses.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wider">
                  Data de Conclusão
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputBase}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--g600)] mb-2 uppercase tracking-wider">
                Rótulos
              </label>
              <div className="flex flex-wrap gap-2">
                {filterLabels.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      tags.has(t)
                        ? "bg-[var(--teal)] text-[var(--navy)] border-[var(--teal)] shadow-sm"
                        : "bg-white text-[var(--g600)] border-[var(--g200)] hover:border-[var(--teal)] hover:text-[var(--teal-d)] hover:bg-[rgba(0,201,183,0.06)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-[var(--g200)] flex-wrap">
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
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn-primary">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
