"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";

interface Board {
  id: string;
  name: string;
  ownerId: string;
  lastUpdated?: string;
}

export default function BoardsPage() {
  const router = useRouter();
  const { user, getHeaders, isChecked } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [boardName, setBoardName] = useState("");
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!isChecked || !user) {
      router.replace("/login");
      return;
    }
    loadBoards();
  }, [isChecked, user, router]);

  async function loadBoards() {
    try {
      const r = await fetch("/api/boards", { headers: getHeaders() });
      if (r.status === 401) {
        router.replace("/login");
        return;
      }
      const { boards: list } = await r.json();
      setBoards(list || []);
      setEmpty(!list || list.length === 0);
    } catch {
      setBoards([]);
      setEmpty(true);
    } finally {
      setLoading(false);
    }
  }

  function openNewModal() {
    setModalMode("new");
    setEditingId(null);
    setBoardName("");
    setModalOpen(true);
  }

  function openEditModal(id: string, name: string) {
    setModalMode("edit");
    setEditingId(id);
    setBoardName(name);
    setModalOpen(true);
  }

  async function createBoard() {
    const name = boardName.trim() || "Novo Board";
    const r = await fetch("/api/boards", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!r.ok) {
      alert("Erro ao criar board.");
      return;
    }
    const { board } = await r.json();
    setModalOpen(false);
    router.push(`/board/${board.id}`);
  }

  async function saveBoardName() {
    if (!editingId) return;
    const name = boardName.trim() || "Board";
    const r = await fetch(`/api/boards/${editingId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!r.ok) {
      alert("Erro ao renomear.");
      return;
    }
    setModalOpen(false);
    loadBoards();
  }

  async function deleteBoard(id: string, name: string) {
    if (!confirm(`Excluir o board "${name}"? Esta ação não pode ser desfeita.`)) return;
    const r = await fetch(`/api/boards/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!r.ok) {
      alert("Erro ao excluir.");
      return;
    }
    loadBoards();
  }

  function formatDate(s?: string) {
    if (!s) return "-";
    try {
      return new Date(s).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return s;
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--off)]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <h2 className="font-display text-xl font-extrabold text-[var(--navy)] mb-6">
          Meus Boards
        </h2>

        {loading ? (
          <p className="text-[var(--g500)]">Carregando...</p>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              <button
                onClick={openNewModal}
                className="bg-[var(--g100)] border-2 border-dashed border-[var(--g200)] flex items-center justify-center min-h-[120px] text-[var(--g600)] font-semibold rounded-[var(--rad)] hover:bg-[rgba(0,201,183,0.08)] hover:border-[var(--teal)] hover:text-[var(--teal-d)] transition-colors cursor-pointer"
              >
                + Novo Board
              </button>
              {boards.map((b) => {
                const isBoardReborn = b.id === "b_reborn";
                const isAdmin = user.isAdmin;
                return (
                  <div
                    key={b.id}
                    className="bg-white border border-[var(--g200)] rounded-[var(--rad)] p-5 flex flex-col gap-2 cursor-pointer transition-all hover:shadow-[var(--shadow-md)] hover:border-[var(--teal)]"
                    onClick={() => router.push(`/board/${b.id}`)}
                  >
                    <h3 className="font-display font-bold text-[var(--navy)]">{b.name}</h3>
                    <span className="text-xs text-[var(--g400)]">
                      Atualizado: {formatDate(b.lastUpdated)}
                    </span>
                    {isBoardReborn ? (
                      isAdmin ? (
                        <div className="mt-auto pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBoard(b.id, b.name);
                            }}
                            className="px-2 py-1 text-xs rounded-md border border-[var(--g200)] bg-white text-[var(--g600)] hover:bg-[#FEF2F2] hover:border-[#EF4444] hover:text-[#EF4444] transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--g400)] italic">Board padrão</span>
                      )
                    ) : (
                      <div className="mt-auto pt-2 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(b.id, b.name);
                          }}
                          className="px-2 py-1 text-xs rounded-md border border-[var(--g200)] bg-white text-[var(--g600)] hover:bg-[var(--g100)] hover:border-[var(--teal)] hover:text-[var(--teal-d)] transition-colors"
                        >
                          Renomear
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBoard(b.id, b.name);
                          }}
                          className="px-2 py-1 text-xs rounded-md border border-[var(--g200)] bg-white text-[var(--g600)] hover:bg-[#FEF2F2] hover:border-[#EF4444] hover:text-[#EF4444] transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {empty && boards.length === 0 && (
              <p className="text-center py-12 text-[var(--g400)]">
                Nenhum board ainda. Clique em &quot;Novo Board&quot; para criar.
              </p>
            )}
          </>
        )}
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-[var(--rad)] p-6 min-w-[320px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold mb-4">
              {modalMode === "new" ? "Novo Board" : "Renomear Board"}
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[var(--g600)] mb-1">
                Nome do Board
              </label>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Ex: Backlog Principal"
                className="w-full px-3 py-2 border border-[var(--g200)] rounded-lg text-sm"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-2 rounded-lg font-semibold text-sm bg-[var(--g100)] text-[var(--g600)] border border-[var(--g200)] hover:bg-[var(--g200)]"
              >
                Cancelar
              </button>
              <button
                onClick={modalMode === "new" ? createBoard : saveBoardName}
                className="px-3.5 py-2 rounded-lg font-semibold text-sm bg-[var(--teal)] text-[var(--navy)] hover:bg-[var(--lime)]"
              >
                {modalMode === "new" ? "Criar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
