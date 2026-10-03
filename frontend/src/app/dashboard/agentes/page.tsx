"use client";

import Link from "next/link";
import { Bot, ChevronRight, CircleAlert, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Agent = { id: string; name: string; role: string };

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/agents", { cache: "no-store" });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(json.message ?? "No fue posible consultar el runtime de agentes.");
      setAgents([]);
    } else {
      setAgents(json.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <div className="mx-auto w-full max-w-7xl space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Inteligencia artificial</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Agentes</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Agentes disponibles en el runtime NestJS de Gaspronal. Selecciona uno para conversar y configurar su acceso a Gemini.</p>
      </div>
      <button onClick={() => void load()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold">
        <RefreshCw size={16}/>Actualizar
      </button>
    </header>

    {error && <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><CircleAlert size={18} className="mt-0.5 shrink-0"/><p>{error}</p></div>}

    {loading ? <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)]">Consultando agentes…</div> :
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {agents.map(agent => <Link key={agent.id} href={`/dashboard/agentes/${agent.id}`} className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><Bot size={24}/></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold">{agent.name}</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{agent.role}</p>
              <div className="mt-5 flex items-center justify-between text-sm font-semibold text-[var(--brand)]"><span>Abrir agente</span><ChevronRight size={18} className="transition group-hover:translate-x-1"/></div>
            </div>
          </div>
        </Link>)}
        {!agents.length && !error && <p className="text-sm text-[var(--muted)]">No hay agentes registrados.</p>}
      </section>}
  </div>;
}
