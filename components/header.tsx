"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

interface HeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export function Header({ title = "PLATAFORMA REBORN", backHref, backLabel = "← Boards", children }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[var(--navy)] sticky top-0 z-[200]">
      <div className="max-w-[1900px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="text-[var(--g400)] text-sm no-underline mr-2 hover:text-white"
            >
              {backLabel}
            </Link>
          )}
          <div className="w-1 h-6 bg-[var(--teal)] rounded-sm" />
          <h1 className="font-display font-extrabold text-base text-white">
            AUSTRAL <span className="text-[var(--teal)] font-semibold">SEGURADORA</span>
            {title && <> — {title}</>}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {user && (
            <span className="text-sm text-[var(--g400)]">
              {user.name || user.username || "Usuário"}
            </span>
          )}
          {children}
          {user?.isAdmin && (
            <Link
              href="/users"
              className="px-3.5 py-2 rounded-lg font-semibold text-sm bg-transparent text-[var(--g400)] border border-[var(--g600)] hover:text-white hover:border-[var(--g400)] transition-colors no-underline"
            >
              Administrar Usuários
            </Link>
          )}
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-lg font-semibold text-sm bg-transparent text-[var(--g400)] border border-[var(--g600)] hover:text-white hover:border-[var(--g400)] transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
