"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";

interface UserRow {
  id: string;
  username: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const { user, getHeaders, isChecked } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPwd, setFormPwd] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isChecked || !user) {
      router.replace("/login");
      return;
    }
    if (!user.isAdmin) {
      router.replace("/boards");
      return;
    }
    loadUsers();
  }, [isChecked, user, router]);

  async function loadUsers() {
    try {
      const r = await fetch("/api/users", { headers: getHeaders() });
      if (r.status === 401) router.replace("/login");
      if (r.status === 403) router.replace("/boards");
      const { users: list } = await r.json();
      setUsers(list || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function openNewModal() {
    setModalMode("new");
    setEditingId(null);
    setFormName("");
    setFormEmail("");
    setFormPwd("");
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(u: UserRow) {
    setModalMode("edit");
    setEditingId(u.id);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPwd("");
    setFormError("");
    setModalOpen(true);
  }

  async function createUser() {
    setFormError("");
    if (!formName.trim() || !formEmail.trim() || !formPwd) {
      setFormError("Preencha todos os campos.");
      return;
    }
    if (formPwd.length < 4) {
      setFormError("Senha deve ter pelo menos 4 caracteres.");
      return;
    }
    const r = await fetch("/api/users", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPwd,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      setFormError(data.error || "Erro ao criar.");
      return;
    }
    setModalOpen(false);
    loadUsers();
  }

  async function saveUser() {
    if (!editingId) return;
    setFormError("");
    if (!formName.trim()) {
      setFormError("Nome é obrigatório.");
      return;
    }
    const body: { name: string; password?: string } = { name: formName.trim() };
    if (formPwd.length >= 4) body.password = formPwd;
    const r = await fetch(`/api/users/${editingId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) {
      setFormError(data.error || "Erro ao salvar.");
      return;
    }
    setModalOpen(false);
    loadUsers();
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Excluir o usuário "${name}"? Esta ação não pode ser desfeita.`)) return;
    const r = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!r.ok) {
      alert("Erro ao excluir.");
      return;
    }
    loadUsers();
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--off)]">
      <Header title="Usuários" backHref="/boards" />
      <main className="max-w-[900px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-extrabold text-[var(--navy)]">
            Administrar Usuários
          </h2>
          <button
            onClick={openNewModal}
            className="px-3.5 py-2 rounded-lg font-semibold text-sm bg-[var(--teal)] text-[var(--navy)] hover:bg-[var(--lime)]"
          >
            + Novo Usuário
          </button>
        </div>

        {loading ? (
          <p className="text-[var(--g500)]">Carregando...</p>
        ) : (
          <div className="bg-white rounded-[var(--rad)] shadow-[var(--shadow-md)] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-[var(--g100)] font-display text-xs font-bold text-[var(--g600)] uppercase tracking-wide text-left">
                    Nome
                  </th>
                  <th className="px-4 py-3 bg-[var(--g100)] font-display text-xs font-bold text-[var(--g600)] uppercase tracking-wide text-left">
                    E-mail
                  </th>
                  <th className="px-4 py-3 bg-[var(--g100)] font-display text-xs font-bold text-[var(--g600)] uppercase tracking-wide text-left">
                    Tipo
                  </th>
                  <th className="px-4 py-3 bg-[var(--g100)] font-display text-xs font-bold text-[var(--g600)] uppercase tracking-wide text-left">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[var(--g200)] hover:bg-[rgba(0,201,183,0.04)]"
                  >
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--navy)] text-white">
                          Admin
                        </span>
                      ) : (
                        "Usuário"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.id !== "admin" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-2 py-1 text-xs rounded-md border border-[var(--g200)] bg-white text-[var(--g600)] hover:bg-[var(--g100)] hover:border-[var(--teal)] hover:text-[var(--teal-d)]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.name)}
                            className="px-2 py-1 text-xs rounded-md border border-[var(--g200)] bg-white text-[var(--g600)] hover:bg-[#FEF2F2] hover:border-[#EF4444] hover:text-[#EF4444]"
                          >
                            Excluir
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-[var(--rad)] p-6 min-w-[360px] max-w-[95%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold mb-4">
              {modalMode === "new" ? "Novo Usuário" : "Editar Usuário"}
            </h3>
            {formError && (
              <p className="text-[#B91C1C] text-sm mb-2">{formError}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--g600)] mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 border border-[var(--g200)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--g600)] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  disabled={modalMode === "edit"}
                  className="w-full px-3 py-2 border border-[var(--g200)] rounded-lg text-sm disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--g600)] mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={formPwd}
                  onChange={(e) => setFormPwd(e.target.value)}
                  placeholder={modalMode === "edit" ? "Deixe em branco para manter" : "Mínimo 4 caracteres"}
                  className="w-full px-3 py-2 border border-[var(--g200)] rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-2 rounded-lg font-semibold text-sm bg-[var(--g100)] text-[var(--g600)] border border-[var(--g200)]"
              >
                Cancelar
              </button>
              <button
                onClick={modalMode === "new" ? createUser : saveUser}
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
