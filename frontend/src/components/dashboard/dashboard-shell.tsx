"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Settings, X } from "lucide-react";
import { useState } from "react";

type User = {
  name: string;
  email: string;
};

export function DashboardShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const configurationActive = pathname.startsWith("/dashboard/configuracion");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      {open && (
        <button
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 font-black tracking-tight">
              G
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-base tracking-[0.08em]">GASPRONAL</strong>
              <span className="block truncate text-xs text-white/60">Administración</span>
            </div>
          </Link>
          <button className="grid size-10 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Administración</p>
          <Link
            href="/dashboard/configuracion"
            onClick={() => setOpen(false)}
            className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${configurationActive ? "bg-white text-neutral-950 shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
          >
            <Settings size={19} />
            <span>Configuración</span>
          </Link>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-sm">{user.name}</strong>
              <span className="block truncate text-xs text-white/50">{user.email}</span>
            </div>
          </div>
          <button onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-white/65 transition hover:bg-white/10 hover:text-white">
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[var(--border)] bg-[color:var(--surface)/0.94] px-4 backdrop-blur sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:hidden" aria-label="Abrir menú">
            <Menu size={20} />
          </button>
          <div className="ml-3 min-w-0 lg:ml-0">
            <p className="truncate text-sm font-semibold">Panel administrativo</p>
            <p className="truncate text-xs text-[var(--muted)]">Gaspronal Industrias y Servicios S.A.S.</p>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
