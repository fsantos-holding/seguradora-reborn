"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./kanban-card";
import type { CardData, BucketConfig } from "@/app/board/[id]/page";

interface KanbanColumnProps {
  bucket: BucketConfig;
  cards: CardData[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onEditCard: (card: CardData) => void;
  onDeleteCard: (id: string) => void;
  onSetDirection: (cardId: string, dir: string) => void;
  directions: string[];
  dirColors: Record<string, string>;
}

export function KanbanColumn({
  bucket,
  cards,
  collapsed,
  onToggleCollapse,
  onEditCard,
  onDeleteCard,
  onSetDirection,
  directions,
  dirColors,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `bucket-${bucket.key}` });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[52px] max-w-[290px] flex-1 flex-[1_0_260px] bg-[var(--g50)] rounded-[var(--rad)] border border-[var(--g200)] flex flex-col max-h-[calc(100vh-165px)] transition-all ${
        collapsed ? "min-w-[52px] max-w-[52px] flex-[0_0_52px] cursor-pointer overflow-hidden" : ""
      } ${isOver ? "bg-[rgba(0,201,183,0.08)]" : ""}`}
    >
      <div
        className="flex items-center gap-2 p-2.5 pb-2 border-b border-[var(--g200)] sticky top-0 bg-[var(--g50)] rounded-t-[var(--rad)] cursor-grab active:cursor-grabbing"
        onClick={collapsed ? onToggleCollapse : undefined}
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: bucket.color || "#9CA3AF" }}
        />
        <div className="font-display font-bold text-xs text-[var(--g800)] flex-1 truncate">
          {bucket.label}
        </div>
        <div
          className="font-display font-extrabold text-xs text-white px-2 py-0.5 rounded-full min-w-[20px] text-center"
          style={{ background: bucket.color || "#9CA3AF" }}
        >
          {cards.length}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="w-5 h-5 rounded-full border border-[var(--g200)] bg-white text-[var(--g500)] flex items-center justify-center text-xs hover:border-[var(--teal)] hover:text-[var(--teal-d)]"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          ◂
        </button>
      </div>

      {!collapsed && (
        <div className="p-2 flex-1 overflow-y-auto flex flex-col gap-2 min-h-[50px]">
          {cards.map((c) => (
            <KanbanCard
              key={c.id}
              card={c}
              directions={directions}
              dirColors={dirColors}
              onEdit={() => onEditCard(c)}
              onDelete={() => onDeleteCard(c.id)}
              onSetDirection={(dir) => onSetDirection(c.id, dir)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
