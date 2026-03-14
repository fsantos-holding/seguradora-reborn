"use client";

import { useState } from "react";

interface MapaItem {
  papel: string;
  equipe: string;
  linha: string;
  operacoes: string;
}

interface MapaModalProps {
  mapaProducao: MapaItem[];
  onClose: () => void;
  onSave: (arr: MapaItem[]) => void;
}

const DEFAULT_MAPA: MapaItem[] = [
  { papel: "Corretor", equipe: "Comercial", linha: "Todas as Linhas", operacoes: "SERPRO (RF), SUSEP" },
  { papel: "Cliente / Pagador", equipe: "D&O", linha: "Financial Lines", operacoes: "SERPRO (RF), SERASA" },
  { papel: "Cliente", equipe: "E&O, RCG, Petróleo", linha: "Garantia — RC Profissional, RC Geral, Energy, Subscrição", operacoes: "SERPRO (RF)" },
  { papel: "Tomador", equipe: "Comercial", linha: "Garantia", operacoes: "SERPRO (RF), SERASA" },
];

export function MapaModal({ mapaProducao, onClose, onSave }: MapaModalProps) {
  const [data, setData] = useState<MapaItem[]>(
    mapaProducao?.length ? [...mapaProducao] : [...DEFAULT_MAPA]
  );

  const update = (idx: number, field: keyof MapaItem, value: string) => {
    setData((prev) => {
      const next = [...prev];
      if (!next[idx]) next[idx] = { papel: "", equipe: "", linha: "", operacoes: "" };
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[var(--rad)] w-[95%] max-w-[920px] max-h-[90vh] overflow-y-auto p-7 shadow-[var(--shadow-drag)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full border-none bg-[var(--g100)] text-[var(--g500)] flex items-center justify-center text-sm hover:bg-[var(--g200)]"
        >
          ×
        </button>

        <div className="flex items-center gap-2 mb-5">
          <span className="bg-[var(--teal)] text-[var(--navy)] px-2 py-1 rounded-md text-xs font-semibold">
            VISÃO EXECUTIVA
          </span>
          <span className="font-display font-extrabold text-lg text-[var(--navy)]">
            Mapa de Produção — Plataforma Reborn
          </span>
        </div>
        <p className="text-sm text-[var(--g600)] leading-relaxed mb-5">
          Visão consolidada do status operacional da plataforma para apoiar decisões estratégicas.
        </p>

        <div className="mb-6">
          <div className="font-display font-bold text-sm text-[var(--g700)] uppercase tracking-wider mb-3 pb-2 border-b-2 border-[var(--teal)] inline-block">
            Cadastros em Produção
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-[28px_1fr_1fr_1.2fr_1.2fr] gap-3 p-3 bg-[var(--navy)] rounded-t-[var(--rad-sm)] text-white font-display font-bold text-xs">
              <div />
              <div>Papel</div>
              <div>Equipe</div>
              <div>Linha</div>
              <div>Operações</div>
            </div>
            {data.map((d, i) => (
              <div
                key={i}
                className="grid grid-cols-[28px_1fr_1fr_1.2fr_1.2fr] gap-3 p-4 bg-[var(--g50)] border border-[var(--g200)] rounded-[var(--rad-sm)] hover:bg-[rgba(0,201,183,0.06)] hover:border-[var(--teal)]"
              >
                <div className="text-[var(--green)] text-sm">✓</div>
                <input
                  type="text"
                  value={d.papel}
                  onChange={(e) => update(i, "papel", e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-bold text-[var(--navy)] focus:ring-1 focus:ring-[var(--teal)] rounded px-1"
                />
                <input
                  type="text"
                  value={d.equipe}
                  onChange={(e) => update(i, "equipe", e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-[var(--g600)] focus:ring-1 focus:ring-[var(--teal)] rounded px-1"
                />
                <input
                  type="text"
                  value={d.linha}
                  onChange={(e) => update(i, "linha", e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-[var(--g600)] focus:ring-1 focus:ring-[var(--teal)] rounded px-1"
                />
                <input
                  type="text"
                  value={d.operacoes}
                  onChange={(e) => update(i, "operacoes", e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-[var(--g600)] focus:ring-1 focus:ring-[var(--teal)] rounded px-1"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-md font-semibold text-sm bg-[var(--g100)] text-[var(--g600)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-2 rounded-md font-bold text-sm bg-[var(--teal)] text-[var(--navy)] hover:bg-[var(--lime)]"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
